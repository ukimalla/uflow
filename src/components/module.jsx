import React, { Component } from "react";
import queryString from "query-string";

// Firebase
let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

class Module extends Component {
  // on component mount
  componentDidMount() {
    if (this.props.location) {
      const value = queryString.parse(this.props.location.search);
      if (value.mid != null) {
        this.setState({
          id: value.mid,
        });
        this.getModule(value.mid);
      }
    } else {
      this.setState({
        id: this.props.module.id,
        header: this.props.module.header,
        content: this.props.module.content,
      });
    }
  }

  state = {
    id: "",
    header: "",
    content: "",
    fromDb: false,
    moduleDoc: null,
  };

  // get module from db
  getModule = (mid) => {
    let db = firebase.firestore();
    if (mid != null) {
      let docRef = db.collection("modules").doc(mid);
      docRef.get().then((doc) => {
        this.setState({ moduleDoc: doc });
        this.onModuleAvailable();
      });
    }
  };

  // When a chapter doc is available.
  onModuleAvailable = () => {
    const doc = this.state.moduleDoc;
    if (doc.exists) {
      let header = doc.data().header;
      let content = doc.data().content;

      if (header && content) {
        // Setting Chapter name
        this.setState({
          header: header,
          content: content,
          fromDb: true,
        });
      } else {
        // Invalid Chapter. Redirecting
        this.setState({ redirect: "/" });
      }
    }
  };

  render() {
    return this.getContent();
  }

  // Get the main content
  getContent = () => {
    if (this.state.fromDb) {
      return (
        <div className="main container">
          <div className="main-child d-flex justify-content-start card border-0 shadow my-5">
            <div className="container">
              <div className="module">
                <h3>{this.state.header}</h3>
                <div className="did"> {this.state.id}</div>
                <hr></hr>
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.state.content,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="module">
          <h3>{this.state.header}</h3>
          <div className="did">{this.state.id}</div>
          <hr></hr>
          <div
            dangerouslySetInnerHTML={{
              __html: this.state.content,
            }}
          ></div>
        </div>
      );
    }
  };
}

export default Module;
