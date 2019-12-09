import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FloatAnchor from 'react-float-anchor';
import { makeStyles } from '@material-ui/core/styles';
import * as util from "../util.js";

const useStyles = makeStyles(theme => ({
  root: {
    height: "177px",
    border: "2px solid #F0F0F0",
    borderRadius: "10px",
    marginTop: "-88px",
    marginRight: "5px",
    marginLeft: "5px",
  },
  textField: {
    border: "1px solid #DCDCDC",
    borderRadius: "5px",
  }
}));

const inputHeight = 36;

export default function MyInputCard(props) {
  const classes = useStyles();

  return (
    <Paper className={classes.root} >
      <Grid container align="center" style={{ marginTop: "68px", marginLeft: "30px" }}>
        <Grid item xs={6} align="right">
          <FloatAnchor
            options={{ position: 'bottom', hAlign: "right" }}
            anchor={anchorRef => (
              <div ref={anchorRef}><TextField className={classes.textField} style={{ height: inputHeight }}
                variant="outlined"
                type="number"
                InputProps={{ style: { height: inputHeight }}}
                onChange={props.onChange}
              /></div>
            )}
            float={
              <label style={{ 
                fontFamily: "Roboto", 
                fontSize: "12px", 
                color: util.GREY,
                marginRight: "15px"
              }}>
                {"Max " + props.max}
              </label>
            }
          />
        </Grid>
        <Grid item xs={4} align="left" style={{ marginTop: "1px", marginLeft: "10px" }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={props.onSubmit} 
            style={{ backgroundColor: util.PURPLE }}
          >
            <label style={{ fontFamily: "Roboto", color: util.WHITE, fontSize: "10px" }}>
            {props.text}
            </label>
            {props.arrow}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
