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

const BN = require('bn.js');
const TEN = new BN(10)
const SIX = TEN.pow(new BN(6));
const TWELVE = TEN.pow(new BN(12));
const EIGHTEEN = TEN.pow(new BN(18));

function getIssuableRSV(usdc, tusd, pax) {
    if (!usdc || !tusd || !pax) { 
      return 0; 
    }
    const usdcBN = new BN(usdc.value);
    const tusdBN = new BN(tusd.value);
    const paxBN = new BN(pax.value);

    return BN.min(BN.min(usdcBN.mul(TWELVE), tusdBN), paxBN).mul(new BN(3)).div(EIGHTEEN).toNumber();
  };

export default class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      generate: { min: 0, max: 0, cur: 0 },
      redeem: { min: 0, max: 0, cur: 0 },
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

  componentDidUpdate() {
    const { USDC, TUSD, PAX, Reserve } = this.props.drizzleState.contracts;
    const usdcBalance = USDC.balanceOf[this.state.usdc.bal];
    const tusdBalance = TUSD.balanceOf[this.state.tusd.bal];
    const paxBalance = PAX.balanceOf[this.state.pax.bal];
    const rsvBalance = Reserve.balanceOf[this.state.rsv.bal];
    const issuableRSV = getIssuableRSV(usdcBalance, tusdBalance, paxBalance);
    if (issuableRSV != this.state.generate.max) {
      const newState = merge(this.state, { generate: { max: issuableRSV }});
      this.setState(newState);
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
    const { drizzle } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    const amt = drizzle.web3.utils.toBN(this.state.generate.cur).div(drizzle.web3.utils.toBN(3));
    const usdcApprove = drizzle.contracts.USDC.methods.approve.cacheSend(managerAddress, amt.mul(SIX));
    const tusdApprove = drizzle.contracts.TUSD.methods.approve.cacheSend(managerAddress, amt.mul(EIGHTEEN));
    const paxApprove = drizzle.contracts.PAX.methods.approve.cacheSend(managerAddress, amt.mul(EIGHTEEN));
    const managerIssue = drizzle.contracts.Manager.methods.issue.cacheSend(amt.mul(EIGHTEEN));

    const newState = merge(this.state, { 
      usdc: { approve: usdcApprove },  
      tusd: { approve: tusdApprove },  
      pax: { approve: paxApprove },  
      manager: { issue: managerIssue }  
    });
    this.setState(newState);
  }

  redeem = () => {
    console.log(this.state.redeem.cur);
    const { drizzle } = this.props;
    const managerAddress = drizzle.contracts.Manager.address;
    const amt = drizzle.web3.utils.toBN(this.state.redeem.cur).mul(EIGHTEEN);
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
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.generate} 
              disabled={this.state.generate.cur == 0}
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
              disabled={this.state.redeem.cur == 0}
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
