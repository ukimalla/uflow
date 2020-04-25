import React, { Component } from "react";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
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

class MyContent extends Component {
  componentDidMount() {
    this.setState({
      courses: [],
      modules: [],
      chapters: [],
    });
    this.getMyContent();
  }

  state = {
    courses: [],
    modules: [],
    chapters: [],
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
      let modulesRef = db.collection("modules");
      let chaptersRef = db.collection("chapters");
      let coursesRef = db.collection("courses");

      modulesRef
        .where("creator", "==", uid)
        .get()
        .then((qS) => this.handleModuleResults(qS));

      chaptersRef
        .where("creator", "==", uid)
        .get()
        .then((qs) => this.handleChaptersResults(qs));

      coursesRef
        .where("creator", "==", uid)
        .get()
        .then((qs) => this.handleCoursesResults(qs));
    } else {
      firebase.auth().onAuthStateChanged(this.getMyContent);
    }
  };

  // Handels db module querry
  handleModuleResults = (querrySnapshot) => {
    console.log(querrySnapshot);
    querrySnapshot.forEach((doc) => {
      let modules = [...this.state.modules];

      let docData = doc.data();
      let module = {
        id: doc.id,
        header: docData.header,
      };

      modules.push(module);
      this.setState({ modules: modules });
    });
  };

  // Handels db chap querry
  handleChaptersResults = (querrySnapshot) => {
    querrySnapshot.forEach((doc) => {
      let chapters = [...this.state.chapters];

      let docData = doc.data();
      let chapter = {
        id: doc.id,
        chapterName: docData.chapterName,
      };

      chapters.push(chapter);
      this.setState({ chapters: chapters });
    });
  };

  // Handels db course querry
  handleCoursesResults = (querrySnapshot) => {
    console.log(querrySnapshot);
    querrySnapshot.forEach((doc) => {
      let courses = [];

      let docData = doc.data();
      console.log(docData);
      let course = {
        id: doc.id,
        courseName: docData.courseName,
      };

      courses.push(course);
      this.setState({ courses: courses });
    });
  };

  // Search key press handler
  onSearchKeyPress = (e) => {
    console.log(e.key);
    if (e.key == "Enter") {
      const searchText = e.target.value;
      this.search(searchText);
    }
  };

  onChapterDeletePressed = (id) => {
    let db = firebase.firestore();
    db.collection("chapters")
      .doc(id)
      .delete()
      .then(() => {
        this.setState({
          courses: [],
          modules: [],
          chapters: [],
        });
        this.getMyContent();
      });
  };

  onCourseDeletePressed = (id) => {
    let db = firebase.firestore();
    db.collection("courses")
      .doc(id)
      .delete()
      .then(() => {
        this.setState({
          courses: [],
          modules: [],
          chapters: [],
        });
        this.getMyContent();
      });
  };

  render() {
    return (
      <div className="main container">
        <div className="main-child d-flex justify-content-start card border-0 shadow my-5">
          <div className="container">
            <h1> My Content</h1>

            {/* Courses */}
            <div class="module">
              <h3> Courses </h3>
              {this.getCourses()}
            </div>

            {/* Chapters */}
            <div class="module">
              <h3> Chapters </h3>
              {this.getChapters()}
            </div>

            {/* Modules */}
            <div class="module">
              <h3> Modules </h3>
              {this.getModules()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  getCourses = () => {
    // If course is null
    if (this.state.courses.length == 0) {
      return <React.Fragment> No courses to display. </React.Fragment>;
    }

    return (
      <div className="container">
        {this.state.courses.map((course) => {
          return (
            <div>
              <a href={"/course?cid=" + course.id} key={course.id}>
                {course.courseName}
              </a>
              <a href={"/course-edit?cid=" + course.id} className="ico-button">
                <FontAwesomeIcon
                  className="icon-action"
                  icon={faEdit}
                ></FontAwesomeIcon>
              </a>
              <IconButton
                did={course.id}
                onButtonPressed={this.onCourseDeletePressed}
              ></IconButton>

              <br />
            </div>
          );
        })}
      </div>
    );
  };

  getModules = () => {
    // If course is null
    if (this.state.modules.length == 0) {
      return <React.Fragment> No modules to display. </React.Fragment>;
    }

    return (
      <div className="column">
        {this.state.modules.map((module) => {
          return (
            <div key={module.id}>
              <a href={"/module?mid=" + module.id} key={module.id}>
                {module.header}
                <br />
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  getChapters = () => {
    // If course is null
    if (this.state.chapters.length == 0) {
      return <React.Fragment> No chapters to display. </React.Fragment>;
    }

    return (
      <React.Fragment>
        {this.state.chapters.map((chapter) => {
          return (
            <div key={chapter.id}>
              <a href={"/chapter?cid=" + chapter.id}>{chapter.chapterName}</a>

              <a
                href={"/chapter-edit?cid=" + chapter.id}
                className="ico-button"
              >
                <FontAwesomeIcon
                  className="icon-action"
                  icon={faEdit}
                ></FontAwesomeIcon>
              </a>
              <IconButton
                did={chapter.id}
                onButtonPressed={this.onChapterDeletePressed}
              ></IconButton>

              <br />
            </div>
          );
        })}
      </React.Fragment>
    );
  };
}

export default MyContent;
