import React, { Component } from "react";
import { 
  Button, 
  Card,
  TextField
} from "@material-ui/core";
import {
  ArrowUpward,
  ArrowDownward
} from "@material-ui/icons";
import {merge} from 'lodash/fp';

import bigRSVLogo from "./assets/reserve-logo.png";
import usdcLogo from "./assets/usdc.png";
import tusdLogo from "./assets/tusd.png";
import paxLogo from "./assets/pax.png";
import rsvLogo from "./assets/rsv.svg";

import TokenBalance from "./components/TokenBalance.js";
import MyModal from "./components/MyModal.js";
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
      manager: { issue: null, redeem: null }
    };
  }

  componentDidMount() {
    const { drizzle, drizzleState } = this.props;
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
    const { drizzle, drizzleState } = this.props;

    // Vars to update.
    var issuableRSV;
    var generateStatus = this.state.generate.status;
    var managerIssue = this.state.manager.issue;

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

    // Update state all at once.
    if (
      issuableRSV !== lastIssuableRSV || 
      generateStatus !== this.state.generate.status ||
      managerIssue !== this.state.manager.issue
    ) {
      const newState = merge(this.state, { 
        generate: { max: issuableRSV, status: generateStatus },
        manager: { issue: managerIssue }
      });
      this.setState(newState);
    }

  }

  refreshBalances = () => {

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

  generate = () => {
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
    console.log(this.state.redeem.cur);
    const { drizzle } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    const amt = drizzle.web3.utils.toBN(this.state.redeem.cur).mul(util.EIGHTEEN);
    const rsvApprove = drizzle.contracts.Reserve.methods.approve.cacheSend(managerAddress, amt);
    const managerRedeem = drizzle.contracts.Manager.methods.redeem.cacheSend(amt);

    const newState = merge(this.state, { 
      rsv: { approve: rsvApprove },  
      manager: { redeem: managerRedeem }  
    });
    this.setState(newState);
  }


  render() {
    const { USDC, TUSD, PAX, Reserve } = this.props.drizzleState.contracts;
    const usdcBalance = USDC.balanceOf[this.state.usdc.bal];
    const tusdBalance = TUSD.balanceOf[this.state.tusd.bal];
    const paxBalance = PAX.balanceOf[this.state.pax.bal];
    const rsvBalance = Reserve.balanceOf[this.state.rsv.bal];

    return (
      <div className="App">
        <MyModal 
          texts={util.GENERATE_TEXT}
          txStatuses={this.getGenerateTxs()}
          on={this.state.generate.status !== util.NOTSTARTED}
          onExited={() => {
            const newState = merge(this.state, { generate: { status: util.NOTSTARTED }});
            this.setState(newState);
          }}
        />



        <div>
          <img src={bigRSVLogo} alt="drizzle-logo" />
          <h1>Reserve</h1>
        </div>
        
        <div className="section">
          <h2>Balances</h2>
          <Card>
            <TokenBalance 
              logo={rsvLogo} 
              nativeDecimals={this.state.rsv.decimals} 
              showDecimals={2} 
              value={rsvBalance && rsvBalance.value}
            />

            <TextField 
              id="generate-input-field" 
              variant="outlined"
              type="number"
              InputProps={{ inputProps: this.state.generate }}
              onChange={this.handleGenerateChange}
              disabled={this.state.generate.status !== util.NOTSTARTED}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.generate} 
              disabled={this.state.generate.cur === 0}
            >
              Generate
              <ArrowUpward/>
            </Button>
            <TextField 
              id="redeem-input-field" 
              variant="outlined"
              type="number"
              InputProps={{ inputProps: this.state.redeem }}
              onChange={this.handleRedeemChange}
            />
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={this.redeem}
              disabled={this.state.redeem.cur === 0}
            >
              Redeem
              <ArrowDownward/>
            </Button>
          </Card>

          <Card>
            <TokenBalance 
              logo={usdcLogo} 
              nativeDecimals={this.state.usdc.decimals} 
              showDecimals={2} 
              value={usdcBalance && usdcBalance.value}
            />
            <TokenBalance 
              logo={tusdLogo} 
              nativeDecimals={this.state.tusd.decimals} 
              showDecimals={2} 
              value={tusdBalance && tusdBalance.value}
            />
            <TokenBalance 
              logo={paxLogo} 
              nativeDecimals={this.state.pax.decimals} 
              showDecimals={2} 
              value={paxBalance && paxBalance.value}
            />
          </Card>
        </div>  
      </div>
    );

  }
}
