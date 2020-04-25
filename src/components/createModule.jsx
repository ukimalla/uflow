import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";

class CreateModule extends Component {
  state = {
    id: "",
    header: "",
    content: "",
    position: this.props.position,
  };

  componentDidMount = () => {
    if (this.props.module != null) {
      this.setState({
        header: this.props.module.header,
        content: this.props.module.content,
        id: this.props.module.id,
      });
    }
  };

  // When the header is changed
  headerChangeHandler = (e) => {
    this.setState({
      header: e.target.value,
    });
    this.props.onChange(
      this.state.position,
      e.target.value,
      this.state.content
    );
  };

  // When the content is changed
  contentChangeHandler = (e) => {
    this.setState({
      content: e.target.value,
    });
    this.props.onChange(this.state.position, this.state.header, e.target.value);
  };

  getButtons = () => {
    return this.props.onRemovePressed == null ? (
      <React.Fragment></React.Fragment>
    ) : (
      <React.Fragment>
        <button
          className="btn btn-danger"
          onClick={(e) => {
            this.props.onRemovePressed(this.state.position);
            e.disabled = true;
          }}
        >
          Remove Module
        </button>
      </React.Fragment>
    );
  };

  render() {
    return (
      <div className="module">
        {/* Header */}
        <input
          placeholder="Module Header"
          className="form-control form-control-lg"
          onChange={this.headerChangeHandler}
          disabled={this.props.isEditable}
          value={this.state.header}
        ></input>
        <hr></hr>
        {/* Content */}
        <textarea
          value={this.state.content}
          placeholder=""
          className="form-control"
          onChange={this.contentChangeHandler}
          disabled={this.props.isEditable}
        ></textarea>
        <div className="row btn-bar justify-content-end">
          {this.getButtons()}
        </div>
      </div>
    );
  }
}

export default CreateModule;
