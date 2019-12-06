import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import reserveName from "../assets/reserve_name.png";

const black = "#252525";
const green = "#4DF1A1";
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  image: {
    width: "108px",
    height: "14px",
    marginLeft: theme.spacing(6)
  },
  button: {
    width: "75px",
    height: "30px",
    position: "absolute",
    right: 0,
    marginRight: theme.spacing(9),
    float: "right",
  },
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{backgroundColor: black}}>
        <Toolbar>
          <img className={classes.image} src={reserveName} />
          <Button className={classes.button}
            variant={!props.initialized ? "contained" : "outlined"} 
            style={{
              backgroundColor: !props.initialized ? green : black, 
              color: !props.initialized ? black : green, 
              fontSize: "8px" 
            }} 
            onClick={() => {
              if (!props.initialized) {
                window.location.reload();
              }
            }}
            disabled={props.initialized}
          >
            {!props.initialized ? "connect" : "connected"}
            
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
