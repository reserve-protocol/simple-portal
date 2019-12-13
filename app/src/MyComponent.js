import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import {merge} from 'lodash/fp';

import metamaskLogo from "./assets/metamask.jpeg";
import bigRSVLogo from "./assets/reserve-logo.png";
import usdcLogo from "./assets/usdc.png";
import tusdLogo from "./assets/tusd.png";
import paxLogo from "./assets/pax.png";
import rsvCombineLogo from "./assets/rsv_combine.png";

import SmallTokenBalance from "./components/SmallTokenBalance.js";
import BigTokenBalance from "./components/BigTokenBalance.js";
import MyModal from "./components/MyModal.js";
import MyInputCard from "./components/MyInputCard.js";
import MyHeader from "./components/MyHeader.js";
import MyHelpButton from "./components/MyHelpButton.js";
import * as util from "./util.js";

const BN = require('bn.js');
const DEV = false;


export default class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generate: { min: 0, max: 0, cur: 0, status: util.NOTSTARTED },
      redeem: { min: 0, max: 0, cur: 0, status: util.NOTSTARTED },
      usdc: { bal: null, allowance: null, approve: null, decimals: 6 },
      tusd: { bal: null, allowance: null, approve: null, decimals: 18 },
      pax: { bal: null, allowance: null, approve: null, decimals: 18 },
      rsv: { bal: null, allowance: null, approve: null, generate: null, decimals: 18 },
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
    console.log(drizzleState);
    const account = drizzleState.accounts[0];
    const managerAddress = drizzle.contracts.Manager.address;
    console.log("account ", account);

    // tell drizzle we always want to know the balances of these 4 tokens
    const usdcBal = drizzle.contracts.USDC.methods["balanceOf"].cacheCall(account);
    const tusdBal = drizzle.contracts.TUSD.methods["balanceOf"].cacheCall(account);
    const paxBal = drizzle.contracts.PAX.methods["balanceOf"].cacheCall(account);
    const rsvBal = drizzle.contracts.Reserve.methods["balanceOf"].cacheCall(account);
    const usdcAllowance = drizzle.contracts.USDC.methods["allowance"].cacheCall(account, managerAddress);
    const tusdAllowance = drizzle.contracts.TUSD.methods["allowance"].cacheCall(account, managerAddress);
    const paxAllowance = drizzle.contracts.PAX.methods["allowance"].cacheCall(account, managerAddress);
    const rsvAllowance = drizzle.contracts.Reserve.methods["allowance"].cacheCall(account, managerAddress);

    const newState = merge(this.state, {
      usdc: { bal: usdcBal, allowance: usdcAllowance }, 
      tusd: { bal: tusdBal, allowance: tusdAllowance }, 
      pax: { bal: paxBal, allowance: paxAllowance },
      rsv: { bal: rsvBal, allowance: rsvAllowance } 
    });
    this.setState(newState);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.initialized || !prevProps.initialized) {
      this.componentDidMount();
      return;
    }
    if (!this.appOn()) {
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
      managerIssue = drizzle.contracts.Manager.methods.issue.cacheSend(amt, { from: drizzleState.accounts[0], gas: 500000 });
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
      managerRedeem = drizzle.contracts.Manager.methods.redeem.cacheSend(amt, { from: drizzleState.accounts[0], gas: 300000 });
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

  appOn = () => { 
    return DEV || (this.props.drizzle.web3.givenProvider && this.props.drizzle.web3.givenProvider.networkVersion === "1");
  }

  hasUSDCAllowance = () => {
    if (!this.props.initialized) {
      return;
    }
    const usdcAllowance = new BN(this.props.drizzleState.contracts.USDC.allowance[this.state.usdc.allowance] && this.props.drizzleState.contracts.USDC.allowance[this.state.usdc.allowance].value);
    const usdcAmt = new BN(this.state.generate.cur).mul(new BN(333334));
    return usdcAmt.lte(usdcAllowance);
  }

  hasTUSDAllowance = () => {
    if (!this.props.initialized) {
      return;
    }
    const tusdAllowance = new BN(this.props.drizzleState.contracts.TUSD.allowance[this.state.tusd.allowance] && this.props.drizzleState.contracts.TUSD.allowance[this.state.tusd.allowance].value);
    const tusdAmt = new BN(this.state.generate.cur).mul(new BN(333333)).mul(util.TWELVE);
    return tusdAmt.lte(tusdAllowance);
  }

  hasPAXAllowance = () => {
    if (!this.props.initialized) {
      return;
    }
    const paxAllowance = new BN(this.props.drizzleState.contracts.PAX.allowance[this.state.pax.allowance] && this.props.drizzleState.contracts.PAX.allowance[this.state.pax.allowance].value);
    const paxAmt = new BN(this.state.generate.cur).mul(new BN(333333)).mul(util.TWELVE);
    return paxAmt.lte(paxAllowance);
  }

  hasRSVAllowance = () => {
    if (!this.props.initialized) {
      return;
    }
    const rsvAllowance = new BN(this.props.drizzleState.contracts.Reserve.allowance[this.state.rsv.allowance] && this.props.drizzleState.contracts.Reserve.allowance[this.state.rsv.allowance].value);
    const rsvAmt = new BN(this.state.generate.cur).mul(util.EIGHTEEN);
    return rsvAmt.lte(rsvAllowance);
  }

  getGenerateTxs = () => {
    return [
      this.hasUSDCAllowance() ? "success" : this.getTxStatus(this.state.usdc.approve), 
      this.hasTUSDAllowance() ? "success" : this.getTxStatus(this.state.tusd.approve), 
      this.hasPAXAllowance() ? "success" : this.getTxStatus(this.state.pax.approve), 
      this.getTxStatus(this.state.manager.issue)
    ];
  }

  getRedeemTxs = () => {
    return [
      this.hasRSVAllowance() ? "success" : this.getTxStatus(this.state.rsv.approve), 
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
    if (!this.appOn()) {
      return;
    }
    console.log(this.state.generate.cur);
    const { drizzle, drizzleState } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    var usdcApprove = this.state.usdc.approve;
    var tusdApprove = this.state.tusd.approve; 
    var paxApprove = this.state.pax.approve;

    const paxAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333333)).mul(util.TWELVE);
    if (!this.hasPAXAllowance()) {
      paxApprove = drizzle.contracts.PAX.methods.approve.cacheSend(
        managerAddress, 
        paxAmt, 
        { from: drizzleState.accounts[0], gas: 80000, to: drizzle.contracts.PAX.address }
      );
    }

    const tusdAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333333)).mul(util.TWELVE);
    if (!this.hasTUSDAllowance()) {
      tusdApprove = drizzle.contracts.TUSD.methods.approve.cacheSend(
        managerAddress, 
        tusdAmt, 
        { from: drizzleState.accounts[0], gas: 80000, to: drizzle.contracts.TUSD.address }
      );
    }

    const usdcAmt = drizzle.web3.utils.toBN(this.state.generate.cur).mul(drizzle.web3.utils.toBN(333334));
    if (!this.hasUSDCAllowance()) {
      usdcApprove = drizzle.contracts.USDC.methods.approve.cacheSend(
        managerAddress, 
        usdcAmt, 
        { from: drizzleState.accounts[0], gas: 80000, to: drizzle.contracts.USDC.address }
      );
    }

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
    if (!this.appOn()) {
      return;
    }
    console.log(this.state.redeem.cur);
    const { drizzle, drizzleState } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    var rsvApprove = this.state.rsv.approve;

    const amt = drizzle.web3.utils.toBN(this.state.redeem.cur).mul(util.EIGHTEEN);
    if (!this.hasRSVAllowance()) {
      rsvApprove = drizzle.contracts.Reserve.methods.approve.cacheSend(
        managerAddress, 
        amt, 
        { from: drizzleState.accounts[0], gas: 80000, to: drizzle.contracts.Reserve.address }
      );
    }

    const newState = merge(this.state, { 
      redeem: { status: util.APPROVING },
      rsv: { approve: rsvApprove }  
    });
    this.setState(newState);
  }


  render() {
    const rootStyle = '{ flexGrow: 1, height: "100%" }';
    var USDC, TUSD, PAX, Reserve, usdcBalance, tusdBalance, paxBalance, rsvBalance;
    if (this.props.initialized) {
      ({ USDC, TUSD, PAX, Reserve } = this.props.drizzleState.contracts);
      usdcBalance = USDC.balanceOf[this.state.usdc.bal];
      tusdBalance = TUSD.balanceOf[this.state.tusd.bal];
      paxBalance = PAX.balanceOf[this.state.pax.bal];
      rsvBalance = Reserve.balanceOf[this.state.rsv.bal];
    }
    if (!this.appOn() || !usdcBalance || !tusdBalance || !paxBalance || !rsvBalance) {
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
          on={(!this.appOn() || !this.props.initialized) && !this.state.hideConnectMetamask}
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
          title="Sign Transactions"
          texts={util.GENERATE_TEXT}
          txStatuses={this.getGenerateTxs()}
          on={this.state.generate.status !== util.NOTSTARTED}
          onExited={() => {
            const newState = merge(this.state, { generate: { status: util.NOTSTARTED }});
            this.setState(newState);
          }}
        />
        <MyModal 
          title="Signing Transactions"
          texts={util.REDEEM_TEXT}
          txStatuses={this.getRedeemTxs()}
          on={this.state.redeem.status !== util.NOTSTARTED}
          onExited={() => {
            const newState = merge(this.state, { redeem: { status: util.NOTSTARTED }});
            this.setState(newState);
          }}
        />

        <MyHeader initialized={this.appOn() && this.props.initialized} />

        <Grid container style={{ backgroundColor: "#3F3F3F", height: "2px" }}/>

        <Grid container className={rootStyle} spacing={0} direction="column" alignContent="stretch">
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
                  text="Generate RSV"
                  arrow=<ArrowUpward style={{ color: util.GREEN, height: "20px", width: "14px" }}/>
                  max={this.state.generate.max}
                  onChange={this.handleGenerateChange}
                  onSubmit={this.generate}
                />
              </Grid>
              <Grid item xs={5}>
                <MyInputCard
                  text="Redeem RSV"
                  arrow=<ArrowDownward style={{ color: util.GREEN, height: "20px", width: "14px"  }}/>
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
              style={{ backgroundColor: util.WHITE, paddingTop: "150px", paddingBottom: "150px" }}
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
          </Grid>
          <Grid item xs={12}>
            <MyHelpButton openHelp={this.openHelp}/>
          </Grid>
          <Grid item xs={12} style={{ backgroundColor: util.BLACK, marginTop: "15px" }}>
            <label style={{ paddingTop: "20px" }}>|</label>
          </Grid>
        </Grid>
      </div>
    );

  }
}
