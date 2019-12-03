import React, { Component } from "react";

function formatNumber (nativeDecimals, showDecimals) {
  return function(arg) {
    return Math.round(arg / Math.pow(10, nativeDecimals)).toFixed(showDecimals);
  }
};

class TokenBalance extends Component {
  render() {
    return (
      <div>
        <img src={this.props.logo} alt="alt-text"/>
        <label>
          {formatNumber(this.props.nativeDecimals, this.props.showDecimals)(this.props.value)}
        </label>
      </div>
    );

  }
}

export default TokenBalance;
