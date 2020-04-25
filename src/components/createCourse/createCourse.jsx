import React, { Component } from "react";
import UserMessage from "../userMessage";
import Spinner from "react-bootstrap/Spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

class CreateCourse extends Component {
  // Getting content on component mount
  componentDidMount() {
    this.setState({
      myChapters: [],
    });
    this.getMyContent();
  }

  state = {
    courseName: "",
    courseChapters: [],
    myChapters: [],

    processingSave: false,

    message: "", // Gets displayed on set
    messageType: "default",
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
    if (this.state.myChapters.length == 0) {
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
    let courseChapters = [...this.state.courseChapters];

    console.log(index);

    courseChapters.push(myChapters[index]);
    myChapters.splice(index, 1);

    this.setState({
      myChapters: myChapters,
      courseChapters: courseChapters,
    });
  };

  // When Remove is pressed on a chpater
  onDeletePressed = (index) => {
    let myChapters = [...this.state.myChapters];
    let courseChapters = [...this.state.courseChapters];

    console.log(index);

    myChapters.push(courseChapters[index]);
    courseChapters.splice(index, 1);

    this.setState({
      myChapters: myChapters,
      courseChapters: courseChapters,
    });
  };

  getCourseChapters() {
    // If course is null
    if (this.state.courseChapters.length == 0) {
      return (
        <React.Fragment>
          {" "}
          Add the chapters that you have created to this course.{" "}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {this.state.courseChapters.map((chapter, index) => {
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
      console.log("processing save");

      this.setState({
        message: "Course name cannot be left blank!",
        messageType: "error",
        processingSave: false,
      });
      return;
    } else if (this.state.courseChapters.length == 0) {
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
    const courseChapters = this.state.courseChapters;

    let chaptersIDList = [];
    let keyWords = this.state.courseName.keyWords();

    for (let i = 0; i < courseChapters.length; ++i) {
      chaptersIDList.push(courseChapters[i].id);
      keyWords = keyWords.concat(courseChapters[i].keyWords);
    }

    let course = {
      creator: uid,
      courseName: this.state.courseName,
      chapters: chaptersIDList,
      keyWords: keyWords,
    };

    let ref = db.collection("courses").add(course);
  };

  render() {
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
              placeholder="Course Name"
              className="form-control form-control-lg"
              disabled={this.state.processingSave}
            ></input>

            {/* Chapters to be included */}
            <div className="module">
              <h3> Course Chapters </h3>
              {this.getCourseChapters()}
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

export default CreateCourse;
