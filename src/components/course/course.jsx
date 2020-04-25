import React, { Component } from "react";
import queryString from "query-string";
import { Redirect } from "react-router-dom";

import Chapter from "../chapter/chapter";

// Firebase
let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

class Course extends Component {
  componentDidMount() {
    const value = queryString.parse(this.props.location.search);
    this.state.courseID = value.cid;
    this.getCourse(value.cid);
  }

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
        console.log(doc.data().courseName);
        console.log(doc.data().chapters);
        this.setState({
          courseName: doc.data().courseName,
          chapters: doc.data().chapters,
        });
        // Getting course modules.
      } else {
        // Invalid course. Redirecting
        this.setState({ redirect: "/" });
      }
    }
  };

  state = {
    redirect: null,
    courseID: "",
    courseName: "",
    modules: {},
    moduleIDArray: [],

    chapters: [],
    courseDoc: null,
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
            <h1> {this.state.courseName} </h1>
            {this.state.chapters.map((chapter, index) => {
              return (
                <Chapter key={chapter} position={index} cid={chapter}></Chapter>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Course;
