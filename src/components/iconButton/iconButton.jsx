import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faTrash } from "@fortawesome/free-solid-svg-icons";

class IconButton extends Component {
  render() {
    return (
      <a href="#">
        <FontAwesomeIcon
          className="icon-action"
          icon={this.props.icon == null ? faTrash : this.props.icon}
          onClick={() => {
            this.props.onButtonPressed(this.props.did);
          }}
        ></FontAwesomeIcon>{" "}
      </a>
    );
  }
}

export default IconButton;
