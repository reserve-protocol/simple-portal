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
import { merge } from 'lodash/fp';
import * as util from "../util.js";

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    borderRadius: "10px",
    backgroundColor: theme.palette.background.paper,
    border: '0px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(0, 10, 0, 10),
  },
}));

export default function MyModal(props) {
  const classes = useStyles();
  var texts = props.texts ? props.texts : [];
  var image = <img 
    src={props.image} 
    width={200} 
    height={200} 
    style={{ paddingBottom: "0px" }} 
    alt="drizzle-logo" 
  />;
  if (!props.image) {
    image = "";
  }

  var link = <p className="whats_this_text"><label><a href={props.link}>Whats this?</a></label></p>;
  if (!props.link) {
    link = "";
  }

  var title = <h2 className="modal_title" style={{ paddingTop: "30px", paddingBottom: "20px" }} >{props.title}</h2>;
  if (!props.title) {
    title = "";
  }

  const iconStyling = { float: "right", paddingLeft: "150px", paddingRight: "40px" };
  const greenIconStyling = merge(iconStyling, { color: green[500] });


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
            <CloseRounded fontSize="small" style={{color: util.PURPLE, marginLeft: "-65px", marginTop: "15px"}} onClick={props.onExited} />
            {title}
            <p style={{textAlign: "center"}}>
              {image}
            </p>
            <p className="modal_oneline_text">
              <label>{props.text}</label>
            </p>
            <ol style={{ paddingBottom: "50px" }}>
              {texts.map(function(text, index) {
                var symbolHTML;
                switch (props.txStatuses[index]) {
                  case "success":
                    symbolHTML = <Check fontSize="large" style={greenIconStyling}/>;
                    break;
                  case "pending":
                    symbolHTML = <CircularProgress style={iconStyling} />;
                    break;
                  case "failure":
                    symbolHTML = <Close fontSize="large" color="secondary" style={iconStyling} />;
                    break;
                  default:
                    symbolHTML = <Pause fontSize="large" style={iconStyling}/>;

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
