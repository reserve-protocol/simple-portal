import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Modal from '@material-ui/core/Modal';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import CloseRounded from '@material-ui/icons/CloseRounded';
import Pause from '@material-ui/icons/Pause';
import { green } from '@material-ui/core/colors';
import * as util from "../util.js";

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    border: '0px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3, 6, 1),
  },
}));

export default function MyModal(props) {
  const classes = useStyles();
  var texts = props.texts ? props.texts : [];
  var image = <img src={props.image} width={200} height={200} alt="drizzle-logo" />;
  if (!props.image) {
    image = "";
  }

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
          <div className={classes.paper} style={{ height: props.height, width: props.width }}>
            <CloseRounded fontSize="small" style={{color: util.PURPLE}} onClick={props.onExited} />
            <h2 id="transition-modal-title" className="modal_title">{props.title}</h2>
            <p style={{textAlign: "center"}}>
              {image}
            </p>
            <p className="modal_oneline_text">
              <label>{props.text}</label>
            </p>
            <ol>
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
                return <li className="modal_multiline_text" key={ index }>{text}{symbolHTML}</li>;
              })}
            </ol>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
