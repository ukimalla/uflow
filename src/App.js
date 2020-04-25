import React, { Component } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Login from "./components/login/login";
import SignUp from "./components/signup/signup";

import NavBar from "./components/navBar/navBar";
import Home from "./components/home/home";
import CreateChapter from "./components/createChapter/createChapter";
import CreateCourse from "./components/createCourse/createCourse";
import Chapter from "./components/chapter/chapter";
import MyContent from "./components/myContent/myContent";
import Module from "./components/module";
import EditChapter from "./components/editChapter/editChapter";
import Course from "./components/course/course";
import EditCourse from "./components/editCourse/editCourse";
import Logout from "./components/logout/logout";

// Firebase
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

/*
Component credit: 
https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
*/

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <NavBar></NavBar>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/sign-in" component={Login} />
            <Route path="/sign-up" component={SignUp} />

            <Route path="/chapter" component={Chapter} />
            <Route path="/chapter-edit" component={EditChapter} />

            <Route path="/module" component={Module} />

            <Route path="/course" component={Course} />
            <Route path="/course-edit" component={EditCourse} />

            <Route path="/create-chapter" component={CreateChapter} />
            <Route path="/create-course" component={CreateCourse} />
            <Route path="/my-content" component={MyContent} />
            <Route path="/logout" component={Logout} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
