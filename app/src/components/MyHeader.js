import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Check from '@material-ui/icons/Check';
import reserveName from "../assets/reserve_name.png";
import * as util from "../util.js";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    display: "flex",
  },
  image: {
    width: "108px",
    height: "14px",
    marginLeft: theme.spacing(6)
  },
  button: {
    position: "absolute",
    right: 0,
    marginRight: theme.spacing(9),
    float: "right",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: "bold",
    fontStyle: "normal",
    fontFamily: "Roboto",
    textTransform: "lowercase",
    border: "1px solid " + util.GREEN,
    padding: "8px"
  },
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();
  var check = <div><Check style={{ color: util.GREEN, height: "15px", marginBottom: "-3px"  }}/>&nbsp;</div>;
  if (!props.initialized) {
    check = "";
  } 

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{backgroundColor: util.BLACK}}>
        <Toolbar>
          <a href="https://reserve.org"><img className={classes.image} alt="alt-text" src={reserveName} /></a>
          <Button className={classes.button}
            variant={!props.initialized ? "contained" : "text"} 
            style={{
              backgroundColor: !props.initialized ? util.GREEN : util.BLACK, 
              color: !props.initialized ? util.BLACK : util.GREEN,
              paddingLeft: !props.initialized ? "15px" : "10px",
              paddingRight: !props.initialized ? "15px" : "20px",
            }} 
            onClick={() => {
              if (!props.initialized) {
                window.location.reload();
              }
            }}
            disabled={props.initialized}
          >
            {check}
            {!props.initialized ? "connect" : "connected"}
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
