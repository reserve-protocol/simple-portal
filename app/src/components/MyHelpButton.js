import React from "react";
import Fab from '@material-ui/core/Fab';
import FloatAnchor from 'react-float-anchor';
import * as util from "../util.js";


export default function MyHelpButton(props) {
  return (
    <div style={{ float: "right", paddingRight: "25px", paddingBottom: "10px" }}>
      <FloatAnchor
        options={{ position: "left", vAlign: "center" }}
        anchor={anchorRef => (
          <div ref={anchorRef}>
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
          </div>
        )}
        float={
          <label style={{
            fontFamily: "Roboto", 
            fontStyle: "normal", 
            fontWeight: "normal",
            fontSize: "12px",
            fontHeight: "16px",
            letterSpacing: "1px",
            textDecorationLine: "underline",
            paddingRight: "10px",
            textAlign: "right",
            color: "#ACAAAA"
          }}>
            Need help ?
          </label>
        }
      />
    </div>
  );
}
