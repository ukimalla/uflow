import React, { Component } from "react";
import Module from "../module";

import queryString from "query-string";
import { Redirect } from "react-router-dom";

// Firebase
let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

class Chapter extends Component {
  componentDidMount() {
    let cid = this.props.cid;

    if (cid == null) {
      const value = queryString.parse(this.props.location.search);
      cid = value.cid;
    }

    console.log(cid);
    this.state.chapterID = cid;
    this.getChapter(cid);
  }

  state = {
    redirect: null,
    chapterID: "",
    chapterName: "",
    modules: {},
    moduleIDArray: [],

    chapterDoc: null,
  };

  getChapter = (cid) => {
    let db = firebase.firestore();
    if (cid != null) {
      let docRef = db.collection("chapters").doc(cid);
      docRef.get().then((doc) => {
        this.setState({ chapterDoc: doc });
        this.onChapterAvailable();
      });
    } else {
      console.log("Redirecting");
      this.setState({ redirect: "/" });
    }
  };

  // When a chapter doc is available.
  onChapterAvailable = () => {
    const doc = this.state.chapterDoc;
    if (doc.exists) {
      let chapterName = doc.data().chapterName;
      if (chapterName) {
        // Setting Chapter name
        this.setState({ chapterName: doc.data().chapterName });
        // Getting chapter modules.
        this.getChapterModules();
      } else {
        // Invalid Chapter. Redirecting
        this.setState({ redirect: "/" });
      }
    }
  };

  getChapterModules = () => {
    let docRef = this.state.chapterDoc;
    let moduleIDArray = docRef.data().modules;
    let db = firebase.firestore();

    // Reading module id
    if (moduleIDArray != null) {
      this.setState({ moduleIDArray: moduleIDArray });

      // Iterating through each module id
      for (let i = 0; i < moduleIDArray.length; ++i) {
        const currentID = moduleIDArray[i];
        let docRef = db.collection("modules").doc(currentID);
        docRef.get().then((doc) => {
          this.appendModule(doc);
        });
      }
    }
  };

  appendModule = (doc) => {
    let modules = { ...this.state.modules };
    if (doc.exists) {
      let header = doc.data().header;
      let content = doc.data().content;
      if (header != null && content != null) {
        modules[doc.id] = {
          id: doc.id,
          header: header,
          content: content,
        };
        this.setState({ modules: modules });
      }
    } else {
      // Badly formed module
      // Redirecting to home
      this.setState({ redirect: "/" });
    }
  };

  render() {
    // Checking if redirection is needed
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }
    // Default Render
    return (
      <div className="main container">
        <div className="main-child row card border-0 shadow my-5">
          <div className="container">
            <h1> {this.state.chapterName} </h1>
            {this.state.moduleIDArray.map((moduleID, index) => {
              let module = this.state.modules[moduleID];
              if (module != null) {
                return (
                  <Module
                    id={module.id}
                    key={module.id}
                    position={index}
                    module={module}
                  ></Module>
                );
              }
              return <React.Fragment key={index}></React.Fragment>;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Chapter;
