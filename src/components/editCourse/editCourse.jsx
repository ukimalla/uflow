import React, { Component } from "react";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";

import queryString from "query-string";
import { Redirect } from "react-router-dom";

import Chapter from "../chapter/chapter";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import UserMessage from "../userMessage";
import Spinner from "react-bootstrap/Spinner";

import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../iconButton/iconButton";

// Firebase
var firebase = require("firebase/app");
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

class EditCourse extends Component {
  // Getting content on component mount
  componentDidMount() {
    const value = queryString.parse(this.props.location.search);
    this.state.courseID = value.cid;
    this.getCourse(value.cid);

    this.setState({
      myChapters: [],
    });
    this.getMyContent();
  }

  state = {
    redirect: null,
    courseID: "",
    courseName: "",
    CCs: {},
    ccIDs: [],
    myChapters: [],

    processingSave: false,

    message: "", // Gets displayed on set
    messageType: "default",
  };

  getCourse = (cid) => {
    let db = firebase.firestore();
    if (cid != null) {
      let docRef = db.collection("courses").doc(cid);
      docRef.get().then((doc) => {
        this.setState({ courseDoc: doc });
        this.onCourseAvailable();
      });
    } else {
      console.log("Redirecting");
      this.setState({ redirect: "/" });
    }
  };

  // When a course doc is available.
  onCourseAvailable = () => {
    const doc = this.state.courseDoc;
    if (doc.exists) {
      let courseName = doc.data().courseName;
      if (courseName) {
        // Setting course name
        this.setState({
          courseName: courseName,
          ccIDs: doc.data().chapters,
        });

        this.fetchCCs();
      } else {
        // Invalid course. Redirecting
        this.setState({ redirect: "/" });
      }
    }
  };

  // Fetches course chapters from the db
  fetchCCs = () => {
    let ccIDs = this.state.ccIDs;
    let CCs = { ...this.state.CCs };
    let db = firebase.firestore();

    for (let i = 0; i < ccIDs.length; ++i) {
      const curID = ccIDs[i];
      db.collection("chapters")
        .doc(curID)
        .get()
        .then((doc) => {
          console.log(doc);
          const chapter = {
            chapterName: doc.data().chapterName,
            id: doc.id,
            keyWords: doc.data().keyWords,
          };
          CCs[curID] = chapter;
          let myChapters = [...this.state.myChapters];
          for (let i = 0; i < myChapters.length; ++i) {
            if (myChapters[i].id == chapter.id) {
              myChapters.splice(i, 1);
            }
          }

          this.setState({ CCs: CCs, myChapters: myChapters });
        });
    }
  };

  // Handels db chap querry
  handleChaptersResults = (querrySnapshot) => {
    querrySnapshot.forEach((doc) => {
      let myChapters = [...this.state.myChapters];

      let docData = doc.data();
      let chapter = {
        id: doc.id,
        chapterName: docData.chapterName,
        keyWords: docData.keyWords,
      };

      myChapters.push(chapter);
      this.setState({ myChapters: myChapters });
    });
  };

  getMyContent = () => {
    let uid;

    // Verifying login and getting the uid
    if (firebase.auth().currentUser != null) {
      console.log(firebase.auth().currentUser);
      uid = firebase.auth().currentUser.uid;
    }

    // If the user is logged in
    if (uid != null) {
      let db = firebase.firestore();

      let chaptersRef = db.collection("chapters");

      chaptersRef
        .where("creator", "==", uid)
        .get()
        .then((qs) => this.handleChaptersResults(qs));
    } else {
      firebase.auth().onAuthStateChanged(this.getMyContent);
    }
  };

  // Gets the save and discard buttons
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
          Save Course
        </button>
        <button className="btn btn-secondary">Discard Course</button>
      </React.Fragment>
    );
  };

  // Getting myChapters
  getMyChapters = () => {
    // If course is null
    if (
      this.state.myChapters.length == 0 ||
      this.state.ccIDs.length != Object.keys(this.state.CCs).length
    ) {
      return <React.Fragment> No chapters to display. </React.Fragment>;
    }

    return (
      <React.Fragment>
        {this.state.myChapters.map((chapter, index) => {
          return (
            <div key={chapter.id}>
              <a
                style={{ padding: "15px" }}
                href={"/chapter?cid=" + chapter.id}
              >
                {chapter.chapterName}
              </a>
              <IconButton
                className="ico-button"
                did={index}
                icon={faPlus}
                onButtonPressed={this.onAddPressed}
              ></IconButton>

              <br />
              <br />
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  // When add is pressed on a chapter
  onAddPressed = (index) => {
    let myChapters = [...this.state.myChapters];
    let CCs = { ...this.state.CCs };
    let ccIDs = [...this.state.ccIDs];

    const id = myChapters[index].id;

    ccIDs.push(id);

    CCs[id] = myChapters[index];

    this.setState({
      CCs: CCs,
      ccIDs: ccIDs,
    });

    myChapters.splice(index, 1);

    this.setState({ myChapters: myChapters });
  };

  // When Remove is pressed on a chpater
  onDeletePressed = (index) => {
    let myChapters = [...this.state.myChapters];
    let CCs = { ...this.state.CCs };
    let ccIDs = [...this.state.ccIDs];

    const id = ccIDs[index];

    myChapters.push(CCs[id]);
    ccIDs.splice(index, 1);

    delete CCs[id];
    this.setState({
      myChapters: myChapters,
      CCs: CCs,
      ccIDs: ccIDs,
    });
  };

  getCCs() {
    // If course is null
    if (
      this.state.CCs.length == 0 ||
      this.state.ccIDs.length != Object.keys(this.state.CCs).length
    ) {
      console.log(this.state.ccIDs.length);
      console.log(Object.keys(this.state.CCs).length);
      return (
        <React.Fragment>
          Add the chapters that you have created to this course.{" "}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {this.state.ccIDs.map((chapterID, index) => {
          let chapter = this.state.CCs;
          return (
            <div key={chapter[chapterID].id}>
              <a
                style={{ padding: "15px" }}
                href={"/chapter?cid=" + chapter[chapterID].id}
              >
                {chapter[chapterID].chapterName}
              </a>
              <IconButton
                className="ico-button"
                did={index}
                icon={faMinus}
                onButtonPressed={this.onDeletePressed}
              ></IconButton>

              <br />
              <br />
            </div>
          );
        })}
      </React.Fragment>
    );
  }

  // When Save Course Button is Pressed
  onSavePressed = () => {
    let db = firebase.firestore();

    this.setState({
      processingSave: true,
    });

    if (this.state.courseName == "") {
      this.setState({
        message: "Course name cannot be left blank!",
        messageType: "error",
        processingSave: false,
      });
      return;
    } else if (this.state.ccIDs.length == 0) {
      this.setState({
        message: "Course needs at least one chapter!",
        messageType: "error",
        processingSave: false,
      });
      return;
    }

    // Verifying login and getting the uid
    if (firebase.auth().currentUser == null) {
      this.setState({
        message: "Please make sure you're logged in.",
        messageType: "error",
        processingSave: false,
      });
      return;
    }

    let uid = firebase.auth().currentUser.uid;
    const ccIDs = this.state.ccIDs;

    let keyWords = this.state.courseName.keyWords();

    let course = {
      creator: uid,
      courseName: this.state.courseName,
      chapters: ccIDs,
      keyWords: keyWords,
    };

    db.collection("courses")
      .doc(this.state.courseID)
      .update(course)
      .then(() => {
        this.setState({ redirect: "course?cid=" + this.state.courseID });
      })
      .catch((e) => {
        this.setState({
          message: e,
          type: "error",
        });
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
            <UserMessage
              type={this.state.messageType}
              message={this.state.message}
            ></UserMessage>

            {/* course Name Input box */}
            <input
              onChange={(e) =>
                this.setState({
                  courseName: e.target.value,
                })
              }
              value={this.state.courseName}
              placeholder="Course Name"
              className="form-control form-control-lg"
              disabled={this.state.processingSave}
            ></input>

            {/* Chapters to be included */}
            <div className="module">
              <h3> Course Chapters </h3>
              {this.getCCs()}
            </div>
            {/* User's chapters */}
            <div className="module">
              <h3> My Chapters </h3>
              {this.getMyChapters()}
            </div>
            {/* Save/Discard Buttons */}
            <div className="row btn-bar justify-content-end">
              {this.getButtons()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditCourse;
