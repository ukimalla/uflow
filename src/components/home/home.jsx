import React, { Component } from "react";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

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

class Home extends Component {
  state = {
    courses: [],
    modules: [],
    chapters: [],
  };

  search = (searchText) => {
    if (searchText != "") {
      let db = firebase.firestore();
      let modulesRef = db.collection("modules");
      let chaptersRef = db.collection("chapters");
      let coursesRef = db.collection("courses");

      modulesRef
        .where("keyWords", "array-contains-any", searchText.keyWords())
        .get()
        .then((qS) => this.handleModuleResults(qS));

      chaptersRef
        .where("keyWords", "array-contains-any", searchText.keyWords())
        .get()
        .then((qs) => this.handleChaptersResults(qs));

      coursesRef
        .where("keyWords", "array-contains-any", searchText.keyWords())
        .get()
        .then((qs) => this.handleCoursesResults(qs));
    }
  };

  // Handels db module querry
  handleModuleResults = (querrySnapshot) => {
    querrySnapshot.forEach((doc) => {
      let modules = [];

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
      let chapters = [];

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
    if (e.key == "Enter") {
      const searchText = e.target.value;
      this.search(searchText);
    }
  };

  render() {
    return (
      <div className="main container">
        <div className="main-child d-flex justify-content-start card border-0 shadow my-5">
          <div className="container">
            {this.getSearchBar()}
            {/* Courses */}
            <div className="module">
              <h3> Courses </h3>
              {this.getCourses()}
            </div>

            {/* Chapters */}
            <div className="module">
              <h3> Chapters </h3>
              {this.getChapters()}
            </div>

            {/* Modules */}
            <div className="module">
              <h3> Modules </h3>
              {this.getModules()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to return the search bar
  getSearchBar = () => {
    return (
      <div className="form-inline d-flex justify-content-center md-form form-sm active-cyan active-cyan-2 mt-2">
        <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
        <input
          className="form-control form-control-sm ml-3 w-75"
          type="text"
          placeholder="Search"
          aria-label="Search"
          onKeyPress={this.onSearchKeyPress}
        />
      </div>
    );
  };

  getCourses = () => {
    // If course is null
    if (this.state.courses.length == 0) {
      return <React.Fragment> No courses to display. </React.Fragment>;
    }

    return (
      <div className="container">
        {this.state.courses.map((course) => {
          return (
            <a href={"/course?cid=" + course.id} key={course.id}>
              {course.courseName}
            </a>
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
      <div className="container">
        {this.state.modules.map((module) => {
          return (
            <a href={"/module?mid=" + module.id} key={module.id}>
              {" "}
              {module.header}
            </a>
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
      <div className="container">
        {this.state.chapters.map((chapter) => {
          return (
            <a href={"/chapter?cid=" + chapter.id} key={chapter.id}>
              {" "}
              {chapter.chapterName}
            </a>
          );
        })}
      </div>
    );
  };
}

export default Home;
