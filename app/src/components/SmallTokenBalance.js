import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import * as util from "../util.js";

class SmallTokenBalance extends Component {
  render() {
    return (
      <Grid container direction="column" justify="center" alignItems="center" >
        <Grid item>
          <img src={this.props.image} alt="alt-text"/>
        </Grid>
        <Grid item>
          <label style={{color: this.props.onBlack ? util.WHITE : util.BLACK}}>
            {util.formatNumber(this.props.nativeDecimals, this.props.showDecimals)(this.props.value)}
          </label>
        </Grid>
      </Grid>
    );

  }
}

export default SmallTokenBalance;
