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

import bigRSVLogo from "./assets/reserve-logo.png";
import usdcLogo from "./assets/usdc.png";
import tusdLogo from "./assets/tusd.png";
import paxLogo from "./assets/pax.png";
import rsvLogo from "./assets/rsv.svg";

import TokenBalance from "./components/TokenBalance.js";


export default class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      generate: { min: 0, max: 0 },
      redeem: { min: 0, max: 0 },
      usdc: { bal: null },
      tusd: { bal: null },
      pax: { bal: null },
      rsv: { bal: null }
    };
  }

  componentDidMount() {
    const { drizzle, drizzleState } = this.props;
    const account = drizzleState.accounts[0];
    console.log("account ", account);

    // get and save the key for the variable we are interested in
    const usdcKey = drizzle.contracts.USDC.methods["balanceOf"].cacheCall(account);
    const tusdKey = drizzle.contracts.TUSD.methods["balanceOf"].cacheCall(account);
    const paxKey = drizzle.contracts.PAX.methods["balanceOf"].cacheCall(account);
    const rsvKey = drizzle.contracts.Reserve.methods["balanceOf"].cacheCall(account);

    this.setState({ 
      account, 
      usdc: { bal: usdcKey }, 
      tusd: { bal: tusdKey }, 
      pax: { bal: paxKey },
      rsv: { bal: rsvKey } 
    });
  }

  

  render() {
    // console.log(this.props.drizzleState);
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
              nativeDecimals={18} 
              showDecimals={2} 
              value={rsvBalance && rsvBalance.value}
            />

            <TextField 
              id="generate-input-field" 
              variant="outlined"
              type="number"
              InputProps={{ inputProps: { min: this.state.generateMin, max: this.state.generateMax } }}
            />
            <Button variant="contained" color="primary">
              Generate
              <ArrowUpward/>
            </Button>
            <TextField 
              id="redeem-input-field" 
              variant="outlined"
              type="number"
              InputProps={{ inputProps: { min: this.state.redeemMin, max: this.state.redeemMax } }}
            />
            <Button variant="outlined" color="secondary">
              Redeem
              <ArrowDownward/>
            </Button>
          </Card>

          <Card>
            <TokenBalance 
              logo={usdcLogo} 
              nativeDecimals={6} 
              showDecimals={2} 
              value={usdcBalance && usdcBalance.value}
            />
            <TokenBalance 
              logo={tusdLogo} 
              nativeDecimals={18} 
              showDecimals={2} 
              value={tusdBalance && tusdBalance.value}
            />
            <TokenBalance 
              logo={paxLogo} 
              nativeDecimals={18} 
              showDecimals={2} 
              value={paxBalance && paxBalance.value}
            />
          </Card>
        </div>  
      </div>
    );

  }
}
