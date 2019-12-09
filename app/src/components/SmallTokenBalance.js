import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import * as util from "../util.js";

class SmallTokenBalance extends Component {
  render() {
    return (
      <Grid container direction="column" justify="center" alignItems="center" >
        <Grid item xs={12}>
          <img src={this.props.image} style={{width: this.props.width, height: this.props.height}}/>
        </Grid>
        <Grid item xs={12} style={{ marginTop: "5px" }}>
          <label style={{ 
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "500",
            fontSize: "10px",
            fontHeight: "12px",
            textAlign: "center",
            color: util.DARK_GREY,
          }}>
          Available Balance
          </label>
        </Grid>
        <Grid item xs={12} style={{ marginTop: "5px" }}>
          <label style={{
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "normal",
            fontSize: "15px",
            fontHeight: "16px",
            textAlign: "center",
            color: util.LIGHT_BLACK
          }}>
            {util.formatNumber(this.props.nativeDecimals)(this.props.value) + " " + this.props.suffix}
          </label>
          </Grid>
      </Grid>
    );

  }
}

export default SmallTokenBalance;
