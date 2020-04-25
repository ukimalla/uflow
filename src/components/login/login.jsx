import React, { Component } from "react";
import UserMessage from "../userMessage";
import { Redirect } from "react-router-dom";

/*
Component credit: 
https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
*/

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");

export default class Login extends Component {
  state = {
    username: "",
    password: "",

    message: "",
    type: "default",
    redirect: null,
  };

  onSubmitPressed = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.username, this.state.password)
      .then(() => {
        if (firebase.auth().currentUser != null) {
          this.setState({ redirect: "/" });
        }
      })
      .catch((error) => {
        this.setState({
          message: error.message,
          type: "error",
        });
      });
  };

  render() {
    if (this.state.redirect != null) {
      return <Redirect to={this.redirect}> </Redirect>;
    }

    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <h3>Sign In</h3>

          <UserMessage
            message={this.state.message}
            type={this.state.type}
          ></UserMessage>

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

          <button
            onClick={this.onSubmitPressed}
            className="btn btn-primary btn-block"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}
