import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { makeStyles } from '@material-ui/core/styles';
import {merge} from 'lodash/fp';

import metamaskLogo from "./assets/metamask.jpeg";
import bigRSVLogo from "./assets/reserve-logo.png";
import usdcLogo from "./assets/usdc.png";
import tusdLogo from "./assets/tusd.png";
import paxLogo from "./assets/pax.png";
import rsvLogo from "./assets/rsv.svg";
import rsvCombineLogo from "./assets/rsv_combine.png";

import SmallTokenBalance from "./components/SmallTokenBalance.js";
import BigTokenBalance from "./components/BigTokenBalance.js";
import MyModal from "./components/MyModal.js";
import MyInputCard from "./components/MyInputCard.js";
import MyHeader from "./components/MyHeader.js";
import * as util from "./util.js";


export default class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generate: { min: 0, max: 0, cur: 0, status: util.NOTSTARTED },
      redeem: { min: 0, max: 0, cur: 0, status: util.NOTSTARTED },
      usdc: { bal: null, approve: null, decimals: 6 },
      tusd: { bal: null, approve: null, decimals: 18 },
      pax: { bal: null, approve: null, decimals: 18 },
      rsv: { bal: null, approve: null, generate: null, decimals: 18 },
      manager: { issue: null, redeem: null },
      showingHelp: false,
      hideConnectMetamask: false,
    };
  }

  componentDidMount() {
    if (!this.props.initialized) {
      return;
    }
    const { drizzle, drizzleState } = this.props;
    console.log(drizzle);
    const account = drizzleState.accounts[0];
    console.log("account ", account);

    // tell drizzle we always want to know the balances of these 4 tokens
    const usdcKey = drizzle.contracts.USDC.methods["balanceOf"].cacheCall(account);
    const tusdKey = drizzle.contracts.TUSD.methods["balanceOf"].cacheCall(account);
    const paxKey = drizzle.contracts.PAX.methods["balanceOf"].cacheCall(account);
    const rsvKey = drizzle.contracts.Reserve.methods["balanceOf"].cacheCall(account);
    const newState = merge(this.state, {
      usdc: { bal: usdcKey }, 
      tusd: { bal: tusdKey }, 
      pax: { bal: paxKey },
      rsv: { bal: rsvKey } 
    });
    this.setState(newState);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.initialized || !prevProps.initialized) {
      this.componentDidMount();
      return;
    }
    const { drizzle, drizzleState } = this.props;

    // Vars to update.
    var issuableRSV;
    var redeemableRSV;
    var generateStatus = this.state.generate.status;
    var redeemStatus = this.state.redeem.status;
    var managerIssue = this.state.manager.issue;
    var managerRedeem = this.state.manager.redeem;

    // State transitions for max issuable count.
    const lastIssuableRSV = util.getIssuableRSV(
      prevProps.drizzleState.contracts.USDC.balanceOf[this.state.usdc.bal], 
      prevProps.drizzleState.contracts.TUSD.balanceOf[this.state.tusd.bal], 
      prevProps.drizzleState.contracts.PAX.balanceOf[this.state.pax.bal]
    );
    issuableRSV = util.getIssuableRSV(
      drizzleState.contracts.USDC.balanceOf[this.state.usdc.bal], 
      drizzleState.contracts.TUSD.balanceOf[this.state.tusd.bal], 
      drizzleState.contracts.PAX.balanceOf[this.state.pax.bal]
    );

    // State transitions for max redeem count.
    const lastRedeemableRSV = util.getRedeemableRSV(prevProps.drizzleState.contracts.Reserve.balanceOf[this.state.rsv.bal]);
    redeemableRSV = util.getRedeemableRSV(drizzleState.contracts.Reserve.balanceOf[this.state.rsv.bal]);
    
    // State transitions for generate flow.
    const generateSuccessCount = util.countOccurrences(this.getGenerateTxs(), "success");
    if (generateSuccessCount === 3 && this.state.generate.status === util.APPROVING) {
      console.log("approving -> issuing");
      const amt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(util.EIGHTEEN);
      managerIssue = drizzle.contracts.Manager.methods.issue.cacheSend(amt, { from: drizzleState.accounts[0], gas: 1000000 });
      generateStatus = util.ISSUING;
    } else if (generateSuccessCount === 4 && this.state.generate.status === util.ISSUING) {
      console.log("issuing -> done");
      generateStatus = util.DONE;
    }

    // State transitions for redeem flow.
    const redeemSuccessCount = util.countOccurrences(this.getRedeemTxs(), "success");
    if (redeemSuccessCount === 1 && this.state.redeem.status === util.APPROVING) {
      console.log("approving -> redeeming");
      const amt = drizzle.web3.utils.toBN(this.state.redeem.cur).mul(util.EIGHTEEN);
      managerRedeem = drizzle.contracts.Manager.methods.redeem.cacheSend(amt, { from: drizzleState.accounts[0], gas: 1000000 });
      redeemStatus = util.REDEEMING;
    } else if (redeemSuccessCount === 2 && this.state.redeem.status === util.REDEEMING) {
      console.log("redeem -> done");
      redeemStatus = util.DONE;
    }

    // Update state all at once.
    if (
      issuableRSV !== lastIssuableRSV || 
      redeemableRSV !== lastRedeemableRSV ||
      generateStatus !== this.state.generate.status ||
      redeemStatus !== this.state.redeem.status || 
      managerIssue !== this.state.manager.issue ||
      managerRedeem !== this.state.manager.redeem
    ) {
      const newState = merge(this.state, { 
        generate: { max: issuableRSV, status: generateStatus },
        redeem: { max: redeemableRSV, status: redeemStatus },
        manager: { issue: managerIssue, redeem: managerRedeem }
      });
      this.setState(newState);
    }

  }

  getGenerateTxs = () => {
    return [
      this.getTxStatus(this.state.usdc.approve), 
      this.getTxStatus(this.state.tusd.approve), 
      this.getTxStatus(this.state.pax.approve), 
      this.getTxStatus(this.state.manager.issue)
    ];
  }

  getRedeemTxs = () => {
    return [
      this.getTxStatus(this.state.rsv.approve), 
      this.getTxStatus(this.state.manager.redeem)
    ];
  }

  getTxStatus = (txId) => {
    if (!this.props.initialized) {
      return;
    }
    const txHash = this.props.drizzleState.transactionStack[txId];
    const txStatus = this.props.drizzleState.transactions[txHash]
    if (txStatus) {
      return txStatus.status;
    }
  }

  handleGenerateChange = event => {
    const newState = merge(this.state, { generate: { cur: event.target.value }});
    this.setState(newState);
  };

  handleRedeemChange = event => {
    const newState = merge(this.state, { redeem: { cur: event.target.value }});
    this.setState(newState);
  };

  openHelp = () => {
    this.setState({ showingHelp: true });
  }

  generate = () => {
    if (!this.props.initialized) {
      return;
    }
    console.log(this.state.generate.cur);
    const { drizzle, drizzleState } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    const usdcAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333334));
    const tusdAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333333)).mul(util.TWELVE);
    const paxAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333333)).mul(util.TWELVE);

    const usdcApprove = drizzle.contracts.USDC.methods.approve.cacheSend(
      managerAddress, 
      usdcAmt, 
      { from: drizzleState.accounts[0], gas: 200000, to: drizzle.contracts.USDC.address }
    );
    const tusdApprove = drizzle.contracts.TUSD.methods.approve.cacheSend(
      managerAddress, 
      tusdAmt, 
      { from: drizzleState.accounts[0], gas: 200000, to: drizzle.contracts.TUSD.address }
    );
    const paxApprove = drizzle.contracts.PAX.methods.approve.cacheSend(
      managerAddress, 
      paxAmt, 
      { from: drizzleState.accounts[0], gas: 200000, to: drizzle.contracts.PAX.address }
    );

    const newState = merge(this.state, { 
      generate: { status: util.APPROVING },
      usdc: { approve: usdcApprove },  
      tusd: { approve: tusdApprove },  
      pax: { approve: paxApprove }
    });
    this.setState(newState);
  }

  redeem = () => {
    if (!this.props.initialized) {
      return;
    }
    console.log(this.state.redeem.cur);
    const { drizzle, drizzleState } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    const amt = drizzle.web3.utils.toBN(this.state.redeem.cur).mul(util.EIGHTEEN);

    const rsvApprove = drizzle.contracts.Reserve.methods.approve.cacheSend(
      managerAddress, 
      amt, 
      { from: drizzleState.accounts[0], gas: 200000, to: drizzle.contracts.Reserve.address }
    );

    const newState = merge(this.state, { 
      redeem: { status: util.APPROVING },
      rsv: { approve: rsvApprove }  
    });
    this.setState(newState);
  }


  render() {
    const rootStyle = "{ flexGrow: 1 }";
    var USDC, TUSD, PAX, Reserve, usdcBalance, tusdBalance, paxBalance, rsvBalance;
    if (this.props.initialized) {
      ({ USDC, TUSD, PAX, Reserve } = this.props.drizzleState.contracts);
      usdcBalance = USDC.balanceOf[this.state.usdc.bal];
      tusdBalance = TUSD.balanceOf[this.state.tusd.bal];
      paxBalance = PAX.balanceOf[this.state.pax.bal];
      rsvBalance = Reserve.balanceOf[this.state.rsv.bal];
    }
    if (!usdcBalance || !tusdBalance || !paxBalance || !rsvBalance) {
      usdcBalance = 0;
      tusdBalance = 0;
      paxBalance = 0;
      rsvBalance = 0;
    }

    return (
      <div>
        <MyModal
          title="Connect Metamask"
          image={metamaskLogo}
          text={util.METAMASK_TEXT}
          on={!this.props.initialized && !this.state.hideConnectMetamask}
          onExited={() => {
            this.setState({ hideConnectMetamask: true });
          }}
        />
        <MyModal
          title=""
          image={rsvCombineLogo}
          text={util.HELP_TEXT}
          on={this.state.showingHelp}
          onExited={() => {
            this.setState({ showingHelp: false });
          }}
        />
        <MyModal 
          texts={util.GENERATE_TEXT}
          txStatuses={this.getGenerateTxs()}
          on={this.state.generate.status !== util.NOTSTARTED}
          onExited={() => {
            const newState = merge(this.state, { generate: { status: util.NOTSTARTED }});
            this.setState(newState);
          }}
        />
        <MyModal 
          texts={util.REDEEM_TEXT}
          txStatuses={this.getRedeemTxs()}
          on={this.state.redeem.status !== util.NOTSTARTED}
          onExited={() => {
            const newState = merge(this.state, { redeem: { status: util.NOTSTARTED }});
            this.setState(newState);
          }}
        />

        <MyHeader initialized={this.props.initialized} />

        <Divider />

        <Grid container className={rootStyle} spacing={0} direction="column">
          <Grid item xs={12} style={{ backgroundColor: util.BLACK }}>      
            <BigTokenBalance
              image={bigRSVLogo} 
              nativeDecimals={this.state.rsv.decimals} 
              value={rsvBalance && rsvBalance.value}
              suffix="RSV"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Grid container className={rootStyle} spacing={0} alignItems="center" justify="center">      
              <Grid item xs={5}>
                <MyInputCard
                  text="Generate RSV  "
                  arrow=<ArrowUpward fontSize="small" style={{ color: util.GREEN }}/>
                  max={this.state.generate.max}
                  onChange={this.handleGenerateChange}
                  onSubmit={this.generate}
                />
              </Grid>
              <Grid item xs={5}>
                <MyInputCard
                  text="Redeem RSV  "
                  arrow=<ArrowDownward fontSize="small" style={{ color: util.GREEN }}/>
                  max={this.state.redeem.max}
                  onChange={this.handleRedeemChange}
                  onSubmit={this.redeem}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid 
              container 
              className={rootStyle}
              spacing={0}
              alignItems="center" 
              justify="center"
              style={{ backgroundColor: util.WHITE, height: "576px" }}
            >
              <Grid item xs={3}>             
                <SmallTokenBalance 
                  image={usdcLogo} 
                  nativeDecimals={this.state.usdc.decimals} 
                  value={usdcBalance && usdcBalance.value}
                  suffix="USDC"
                  width="120px"
                  height="50px"
                />
              </Grid>
              <Grid item xs={3}>            
                <SmallTokenBalance 
                  image={tusdLogo} 
                  nativeDecimals={this.state.tusd.decimals} 
                  value={tusdBalance && tusdBalance.value}
                  suffix="TUSD"
                  width="50px"
                  height="50px"
                />
              </Grid>
              <Grid item xs={3}>          
                <SmallTokenBalance 
                  image={paxLogo} 
                  nativeDecimals={this.state.pax.decimals} 
                  value={paxBalance && paxBalance.value}
                  suffix="PAX"
                  width="50px"
                  height="50px"
                />
              </Grid>
            </Grid>
            <Fab onClick={this.openHelp} style={{backgroundColor: "#E4F14D"}}>?</Fab>
          </Grid>
        </Grid>
      </div>
    );

  }
}
