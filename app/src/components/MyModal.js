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
  CloseRounded,
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
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    border: '0px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3, 3, 3),
  },
}));

export default function MyModal(props) {
  const classes = useStyles();
  var texts = props.texts ? props.texts : [];

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
            <CloseRounded fontSize="small" style={{color: "#6B1CD1"}} onClick={props.onExited} />
            <h2 id="transition-modal-title" className="modal_title">{props.title}</h2>
            <p style={{textAlign: "center"}}>
              <img src={props.image} width={200} height={200} alt="drizzle-logo" />
            </p>
            <p className="modal_text">
              <label>{props.text}</label>
            </p>
            <ul>
              {texts.map(function(text, index) {
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
                return <li className="modal_text" key={ index }>{text}{symbolHTML}</li>;
              })}
            </ul>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
