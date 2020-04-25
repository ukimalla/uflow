import React, { Component } from "react";
import AuthNavBar from "./authNavBar";
import UserNavBar from "./userNavBar";

// Firebase
let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

class NavBar extends Component {
  state = {
    intiFirebase: false,
    navBar: <AuthNavBar> </AuthNavBar>,
  };

  componentWillMount() {
    if (!this.state.initFirebase) {
      firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
    }
  }

  onAuthStateChanged = (user) => {
    this.setState({
      initFirebase: true,
    });
    if (firebase.auth().currentUser != null) {
      this.setState({ navBar: <UserNavBar> </UserNavBar> });
    } else {
      this.setState({
        navbar: <AuthNavBar></AuthNavBar>,
      });
    }
  };

  initFirebase = () => {
    return this.state.navBar;
  };

  render() {
    return <div>{this.initFirebase()}</div>;
  }
}

export default NavBar;
