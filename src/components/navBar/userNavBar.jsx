import React, { Component } from "react";
import { Link } from "react-router-dom";

class UserNavBar extends Component {
  state = {};
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <Link className="navbar-brand" to={"/"}>
            uFlow
          </Link>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to={"/"}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={"/my-content"}>
                  My Content
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={"/create-course"}>
                  Create Course
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={"/create-chapter"}>
                  Create Chapter
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={"/logout"}>
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default UserNavBar;
