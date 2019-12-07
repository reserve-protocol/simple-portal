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
        <Grid item xs={2}>
          <img src={this.props.image} alt="alt-text" style={{width: "100px", height: "100px"}}/>
        </Grid>
        <Grid item xs={1}>
          <label style={{color: util.WHITE}}>
            {util.formatNumber(this.props.nativeDecimals, this.props.showDecimals)(this.props.value)}
          </label>
          </Grid>
        </Grid>
    );

  }
}

export default BigTokenBalance;
