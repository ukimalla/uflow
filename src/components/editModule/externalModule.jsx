import React, { Component } from "react";

import "../../../node_modules/bootstrap/dist/css/bootstrap.css";

import Module from "../module";

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

class ExternalModule extends Component {
  state = {
    id: "",
    module: {
      id: -1,
      header: "",
      content: "",
    },
    position: this.props.position,
  };

  onIDChange = (e) => {
    this.setState({
      id: e.target.value,
    });

    let db = firebase.firestore();

    if (e.target.value != "") {
      db.collection("modules")
        .doc(e.target.value)
        .get()
        .then((doc) => {
          if (doc.exists) {
            module = {
              id: doc.id,
              header: doc.data().header,
              content: doc.data().content,
            };

            this.setState({ id: doc.id, module: module }, () => {
              this.props.onModuleFound(this.props.position, this.state.id);
            });
          }
        });
    }
  };

  getRender = () => {
    if (this.state.module.id == -1) {
      return (
        <div className="module">
          <input
            onChange={this.onIDChange}
            placeholder="Module ID"
            className="form-control form-control-lg"
          ></input>
        </div>
      );
    } else {
      return (
        <Module
          did={this.state.id}
          position={this.props.position}
          module={this.state.module}
        ></Module>
      );
    }
  };

  render() {
    return this.getRender();
  }
}

export default ExternalModule;
