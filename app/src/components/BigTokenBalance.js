import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import * as util from "../util.js";

class BigTokenBalance extends Component {
  render() {
    return (
      <Grid 
        container 
        direction="column" 
        justify="center" 
        alignItems="center" 
        style={{paddingTop: "200px", paddingBottom: "200px"}} 
      >
        <Grid item xs={12}>
          <img src={this.props.image} alt="alt-text" style={{width: "100px", height: "100px"}}/>
        </Grid>
        <Grid item xs={12} style={{ marginTop: "20px" }}>
          <label style={{ 
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "500",
            fontSize: "12px",
            fontHeight: "14px",
            textAlign: "center",
            color: util.LIGHT_GREY
          }}>
          Available Balance
          </label>
        </Grid>
        <Grid item xs={12} style={{ marginTop: "5px" }}>
          <label style={{
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "bold",
            fontSize: "37px",
            fontHeight: "16px",
            textAlign: "center",
            color: util.WHITE
          }}>
            {util.formatNumber(this.props.nativeDecimals)(this.props.value) + " RSV"}
          </label>
          </Grid>
        </Grid>
    );

  }
}

export default BigTokenBalance;
