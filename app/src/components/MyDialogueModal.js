import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Backdrop,
  Fade,
  Modal
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';


const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    border: '0px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function MyDialogueModal(props) {
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
            <h2 id="transition-modal-title">{props.title}</h2>
            <p>
              <img src={props.image} width={200} height={200} alt="drizzle-logo" />
            </p>
            <p>
              <label>{props.text}</label>
            </p>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
