import React, { Component } from "react";

class UserMessage extends Component {
  getColor = (color) => {
    switch (color.toLowerCase()) {
      case "normal":
        return "black";
      case "error":
        return "red";
      case "success":
        return "green";
      default:
        return "black";
    }
  };

  getStyle = (type) => {
    return {
      color: this.getColor(type),
    };
  };

  render() {
    return (
      <span style={this.getStyle(this.props.type)}> {this.props.message} </span>
    );
  }
}

export default UserMessage;
