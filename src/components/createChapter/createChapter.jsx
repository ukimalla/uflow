import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import { Redirect } from "react-router-dom";

import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import UserMessage from "../userMessage";
import CreateModule from "../createModule";
import ExternalModule from "../editModule/externalModule";

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

// Module prototype
class ModuleP {
  constructor(position, header, contnet) {
    this.position = position;
    this.header = header;
    this.content = contnet;
  }
}

// Defining a keyword function for string
String.prototype.keyWords = function () {
  const replaceRegEx = /[^a-zA-Z0-9\s]/g;
  let retVal = this.toLowerCase().replace(replaceRegEx, "").split(" ");

  // Removing ""
  let i = 0;
  while (i < retVal.length) {
    if (retVal[i] === "") {
      retVal.splice(i, 1);
    } else {
      ++i;
    }
  }
  return retVal;
};

// CreateChapter Component
class CreateChapter extends Component {
  state = {
    chapterName: "",
    modules: [new ModuleP(0, "", "")],

    savedModules: {},
    processingSave: false,

    errorMessage: "",
    messageType: "",

    redirect: null,
  };

  // When something is typed in the module
  onChangeHandler = (position, header, content) => {
    const modules = [...this.state.modules];
    modules[position].header = header;
    modules[position].content = content;
    this.setState({
      modules: modules,
    });
  };

  // When the add module button is pressed
  onAddModulePressed = () => {
    let modules = [...this.state.modules];
    modules.push(new ModuleP(modules.length, "", ""));
    this.setState({
      modules: modules,
    });
  };

  // When Save is pressed
  onSavePressed = () => {
    this.setState({
      processingSave: true,
    });

    let db = firebase.firestore();
    let uid;

    // Verifying login and getting the uid
    if (firebase.auth().currentUser != null) {
      console.log(firebase.auth().currentUser);
      uid = firebase.auth().currentUser.uid;
    } else {
      console.log("current user is null");
    }

    // Inserting the modules
    if (uid != null) {
      const modules = [...this.state.modules];

      for (let i = 0; i < modules.length; ++i) {
        let keyWords = modules[i].header.keyWords();
        keyWords = keyWords.concat(modules[i].content.keyWords());
        let data = {
          creator: uid,
          header: modules[i].header,
          content: modules[i].content,
          keyWords: keyWords,
        };
        // Adding data to the database
        db.collection("modules")
          .add(data)
          .then((docRef) => this.onModuleAdded(modules[i].position, docRef))
          .catch(this.onDbFail);
      }
    } else {
      console.log("uid is null.");
    }
  };

  // When a module is succesfully added to the database.
  onModuleAdded = (position, docRef) => {
    let id = docRef.id == null ? docRef : docRef.id;

    let savedModules = { ...this.state.savedModules };
    savedModules[position] = id;

    this.setState({
      savedModules: savedModules,
    });

    if (Object.keys(savedModules).length == this.state.modules.length) {
      this.saveChapter();
    } else {
      console.log("Not equal");
    }
  };

  getKeyWords = () => {
    const modules = this.state.modules;

    let keyWords = this.state.chapterName.keyWords();

    for (let i = 0; i < modules.length; ++i) {
      keyWords = keyWords.concat(modules[i].header.keyWords());
      keyWords = keyWords.concat(modules[i].content.keyWords());
    }

    return keyWords;
  };

  saveChapter = () => {
    let savedModules = { ...this.state.savedModules };
    let db = firebase.firestore();
    let uid;

    // Verifying login and getting the uid
    if (firebase.auth().currentUser != null) {
      uid = firebase.auth().currentUser.uid;
    }

    // Inserting the modules
    if (uid != null) {
      let modules = [];

      for (let i = 0; i < Object.keys(savedModules).length; ++i) {
        console.log(savedModules[i]);
        modules.push(savedModules[i]);
      }

      let keyWords = this.getKeyWords();

      console.log("Inserting ", modules);
      db.collection("chapters")
        .add({
          creator: uid,
          chapterName: this.state.chapterName,
          modules: modules,
          keyWords: keyWords,
        })
        .catch(this.onDbFail)
        .then(this.onSaveSuccess);
    }
  };

  onSaveSuccess = (dbRef) => {
    this.setState({
      errorMessage: this.state.chapterName + "successfully saved.",
      messageType: "success",
      redirect: "/chapter?cid=" + dbRef.id,
    });
  };

  // When Db operation Fails
  onDbFail = (error) => {
    this.setState({
      errorMessage: error.message,
      messageType: "error",
      processingSave: false,
    });
  };

  render() {
    // Checking if redirection is needed
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    return (
      <div className="main container">
        <div className="main-child row card border-0 shadow my-5">
          <div className="container">
            {/* Chapter Name Input box */}
            <input
              onChange={(e) =>
                this.setState({
                  chapterName: e.target.value,
                })
              }
              placeholder="Chapter Name"
              className="form-control form-control-lg"
              disabled={this.state.processingSave}
            ></input>

            <UserMessage
              type={this.state.messageType}
              message={this.state.errorMessage}
            ></UserMessage>

            {/* CreateModule Components  */}
            <div className="main-child col">
              {this.state.modules.map((module, index) =>
                module.position == -1 ? (
                  <ExternalModule
                    key={index}
                    position={index}
                    onModuleFound={this.onModuleAdded}
                  ></ExternalModule>
                ) : (
                  <CreateModule
                    key={module.position}
                    position={module.position}
                    onChange={this.onChangeHandler}
                    isEditable={this.state.processingSave}
                  ></CreateModule>
                )
              )}
            </div>

            {this.getAddModuleButton()}

            {/* Save/Discard Buttons */}
            <div className="row btn-bar justify-content-end">
              {this.getButtons()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  getButtons = () => {
    return this.state.processingSave ? (
      <div>
        <Spinner animation="border" role="status">
          {" "}
        </Spinner>
      </div>
    ) : (
      <React.Fragment>
        <button className="btn btn-primary" onClick={this.onSavePressed}>
          Save Chapter
        </button>
        <button className="btn btn-secondary">Discard Chapter</button>
      </React.Fragment>
    );
  };

  onExternalModulePressed = () => {
    let modules = [...this.state.modules];
    modules.push(new ModuleP(-1, "", ""));

    this.setState({ modules: modules });
  };

  getAddModuleButton = () => {
    return this.state.processingSave ? (
      <React.Fragment></React.Fragment>
    ) : (
      <React.Fragment>
        <button
          onClick={this.onAddModulePressed}
          className="btn btn-primary btn-lg btn-block"
        >
          + Create New Module
        </button>{" "}
        <button
          onClick={this.onExternalModulePressed}
          className="btn btn-info btn-lg btn-block"
        >
          + Place External Module
        </button>
      </React.Fragment>
    );
  };
}

export default CreateChapter;
