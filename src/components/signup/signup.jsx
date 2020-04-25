import React, { Component } from "react";
import UserMessage from "../userMessage";

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

/*
Component credit: 
https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
*/

export default class SingUp extends Component {
  state = {
    username: "",
    password: "",
    message: "",
    messageType: "default",
  };
  go = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.username, this.state.password)
      .then(this.handleSignup)
      .catch(this.showError);
  };

  handleSignup = (auth) => {
    // console.log(auth);
  };

  showError = (error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorMessage);
    this.setState({
      message: errorMessage,
      messageType: "error",
    });
  };

  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <h3>Sign Up</h3>
          <span>
            <UserMessage
              type={this.state.messageType}
              message={this.state.message}
            ></UserMessage>
          </span>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={(e) => {
                this.setState({
                  username: e.target.value,
                });
              }}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              onChange={(e) => {
                this.setState({
                  password: e.target.value,
                });
              }}
            />
          </div>

          <button onClick={this.go} className="btn btn-primary btn-block">
            Submit
          </button>
        </div>
      </div>
    );
  }
}
