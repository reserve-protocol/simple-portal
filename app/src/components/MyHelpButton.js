import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import * as util from "../util.js";


export default function MyHelpButton(props) {
  return (
    <Grid container direction="row" justify="flex-end" >
      <Grid item xs={1} style={{ marginRight: "-10px" }}>
        <label style={{
          fontFamily: "Roboto", 
          fontStyle: "normal", 
          fontWeight: "normal",
          fontSize: "12px",
          fontHeight: "16px",
          letterSpacing: "1px",
          textDecorationLine: "underline",
          textAlign: "center",
          color: "#ACAAAA"
        }}>
          Need help ?
        </label>
      </Grid>
      <Grid item xs={1} style={{ marginTop: "-17px" }}>
        <Fab 
          onClick={props.openHelp} 
          style={{
            backgroundColor: "#E4F14D", 
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.25)"
          }}
        >
          <label style={{ 
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "500",
            fontSize: "20px",
            fontHeight: "23px",
            textAlign: "center",
            color: util.BLACK
          }}>
            ?
          </label>
        </Fab>
      </Grid>
    </Grid>
  );
}
