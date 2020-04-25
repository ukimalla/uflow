import React, { Component } from "react";
import Home from "../home/home";
import { Redirect } from "react-router-dom";

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");

class Logout extends Component {
  state = {};
  componentDidMount() {
    firebase
      .auth()
      .signOut()
      .then(() => {});
  }

  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          {" "}
          "You have been logged out. Please close this tab and use another tab
          to log back in."
        </div>
      </div>
    );
  }
}

export default Logout;
