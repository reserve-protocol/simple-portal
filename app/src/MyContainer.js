import { drizzleConnect } from "@drizzle/react-plugin";
import React, { Component } from "react";
import { 
  Button, 
  Card 
} from "@material-ui/core";
import {
  AccountData,
  ContractData,
  ContractForm,
} from "@drizzle/react-components";


import logo from "./assets/reserve-logo.png";
import usdcLogo from "./assets/usdc.png";
import tusdLogo from "./assets/tusd.png";
import paxLogo from "./assets/pax.png";
import rsvLogo from "./assets/rsv.svg";

function formatNumber (nativeDecimals, showDecimals) {
  return function(arg) {
    return Math.round(arg / Math.pow(10, nativeDecimals)).toFixed(showDecimals);
  }
};

class MyComponent extends Component {
  constructor(props) {
    super(props);
  }

  

  render() {
    return (
      <div className="App">
        <div>
          <img src={logo} alt="drizzle-logo" />
          <h1>Reserve</h1>
          <p></p>
        </div>
        
        <div className="section">
          <h2>Balances</h2>
          <Card>
            <p>
              <img src={usdcLogo} alt="usdc-logo" />
              <ContractData 
                contract="USDC" 
                method="balanceOf" 
                methodArgs={[ this.props.accounts[0] ]} 
                render={ formatNumber(6, 2) }
              />
            </p>
          </Card>
          <Card>
            <p>
              <img src={tusdLogo} alt="tusd-logo" />
              <ContractData 
                contract="TUSD" 
                method="balanceOf" 
                methodArgs={[ this.props.accounts[0] ]} 
                render={ formatNumber(18, 2) }
              />      
            </p>
          </Card>
          <Card>
            <p>
              <img src={paxLogo} alt="pax-logo" />
              <ContractData 
                contract="PAX" 
                method="balanceOf" 
                methodArgs={[ this.props.accounts[0] ]} 
                render={ formatNumber(18, 2) }
              />      
            </p>
          </Card>
          <Card>
            <p>
              <img src={rsvLogo} alt="rsv-logo" />
              <ContractData 
                contract="Reserve" 
                method="balanceOf" 
                methodArgs={[ this.props.accounts[0] ]} 
                render={ formatNumber(18, 2) }
              />   
            </p>

          <p>
            <Button variant="contained" color="primary">
              Generate
            </Button>
          </p>
          <p>
            <Button variant="outlined" color="secondary">
              Redeem
            </Button>
          </p>
          </Card>
        </div>  
      </div>
    );

  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    USDC: state.contracts.USDC,
    TUSD: state.contracts.TUSD,
    PAX: state.contracts.PAX,
    Reserve: state.contracts.Reserve,
    Manager: state.contracts.Manager,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    drizzleStatus: state.drizzleStatus,
  };
};

const MyContainer = drizzleConnect(MyComponent, mapStateToProps);

export default MyContainer;
