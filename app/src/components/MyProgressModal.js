import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Backdrop,
  CircularProgress,
  Fade,
  Modal
} from '@material-ui/core';
import {
  Check,
  Close,
  Pause
} from "@material-ui/icons";
import { green } from '@material-ui/core/colors';


const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function MyProgressModal(props) {
  const classes = useStyles();

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={props.on}
        onClose={props.onExited}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={props.on}>
          <div className={classes.paper}>
            <h2 id="transition-modal-title">Transition modal</h2>
            <ul>
              {props.texts.map(function(text, index) {
                var symbolHTML;
                switch (props.txStatuses[index]) {
                  case "success":
                    symbolHTML = <Check fontSize="large" style={{ color: green[500] }}/>;
                    break;
                  case "pending":
                    symbolHTML = <CircularProgress />;
                    break;
                  case "failure":
                    symbolHTML = <Close fontSize="large" color="secondary" />;
                    break;
                  default:
                    symbolHTML = <Pause fontSize="large" />;

                }
                return <li key={ index }>{text}{symbolHTML}</li>;
              })}
            </ul>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
