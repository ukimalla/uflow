import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";

import queryString from "query-string";
import { Redirect } from "react-router-dom";
import CreateModule from "../createModule";
import UserMessage from "../userMessage";

// Firebase
let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

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

class EditChapter extends Component {
  componentDidMount() {
    const value = queryString.parse(this.props.location.search);
    this.state.chapterID = value.cid;
    this.getChapter(value.cid);
  }

  state = {
    redirect: null,
    chapterID: "",
    chapterName: "",
    modules: {},
    moduleIDArray: [],
    processingSave: false,

    message: "",
    messageType: "default",

    savedModules: {},

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

  // When something is typed in the module
  onChangeHandler = (position, header, content) => {
    const modules = { ...this.state.modules };
    const id = this.state.moduleIDArray[position];
    modules[id].header = header;
    modules[id].content = content;
    this.setState({
      modules: modules,
    });
  };
  onSaveSuccess = () => {
    this.setState({
      errorMessage: this.state.chapterName + "successfully saved.",
      messageType: "success",
      redirect: "/chapter?cid=" + this.state.chapterID,
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
    // Default Render
    return (
      <div className="main container">
        <div className="main-child row card border-0 shadow my-5">
          <div className="container">
            <UserMessage
              type={this.state.messageType}
              message={this.state.errorMessage}
            ></UserMessage>
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
              value={this.state.chapterName}
            ></input>
            {this.state.moduleIDArray.map((moduleID, index) => {
              let module = this.state.modules[moduleID];
              if (module != null) {
                return (
                  <CreateModule
                    onChange={this.onChangeHandler}
                    key={module.id}
                    position={index}
                    module={module}
                    onRemovePressed={this.onRemovePressed}
                  ></CreateModule>
                );
              }
              return <React.Fragment key={index}></React.Fragment>;
            })}
            {this.getButtons()}
          </div>
        </div>
      </div>
    );
  }

  // Render functions
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
      const moduleIDArray = this.state.moduleIDArray;
      const modules = this.state.modules;

      for (let i = 0; i < moduleIDArray.length; ++i) {
        const moduleID = moduleIDArray[i];
        let keyWords = modules[moduleID].header.keyWords();
        keyWords = keyWords.concat(modules[moduleID].content.keyWords());
        let data = {
          creator: uid,
          header: modules[moduleID].header,
          content: modules[moduleID].content,
          keyWords: keyWords,
        };
        // Adding data to the database
        db.collection("modules")
          .doc(moduleID)
          .set(data, { merge: true })
          .then(() => this.onModuleAdded(i))
          .catch(this.onDbFail);
      }
    } else {
      console.log("uid is null.");
    }
  };

  // When a module is succesfully added to the database.
  onModuleAdded = (position) => {
    let savedModules = { ...this.state.savedModules };
    savedModules[position] = this.state.moduleIDArray[position];

    this.setState({
      savedModules: savedModules,
    });

    if (Object.keys(savedModules).length == this.state.moduleIDArray.length) {
      this.saveChapter();
    } else {
      console.log("Not equal");
    }
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
        .doc(this.state.chapterID)
        .update({
          creator: uid,
          chapterName: this.state.chapterName,
          modules: modules,
          keyWords: keyWords,
        })
        .catch(this.onDbFail)
        .then(this.onSaveSuccess);
    }
  };

  onRemovePressed = (position) => {
    let db = firebase.firestore();
    let id = this.state.moduleIDArray[position];

    db.collection("chapters")
      .doc(this.state.chapterID)
      .update({
        modules: firebase.firestore.FieldValue.arrayRemove(id),
      })
      .then(() => {
        this.setState({
          redirect: null,
          chapterID: "",
          chapterName: "",
          modules: {},
          moduleIDArray: [],
          processingSave: false,

          message: "",
          messageType: "default",

          savedModules: {},

          chapterDoc: null,
        });

        const value = queryString.parse(this.props.location.search);
        this.state.chapterID = value.cid;
        this.getChapter(value.cid);
      })
      .catch(() => {
        this.setState({
          message: "Error removing module. Please reload the page and retry.",
          messageType: "error",
        });
      });
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
        <button className="btn btn-secondary">Discard Changes</button>
      </React.Fragment>
    );
  };
}

export default EditChapter;
