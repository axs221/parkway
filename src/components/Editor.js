import React, { Component } from "react";

import Textarea from "material-ui/Input/Textarea";

export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = { value: "" };
  }

  hasFocus = () => {
    window.getSelection().toString();
    const selection = document.getSelection();
    var ranges = [];

    for (var i = 0; i < selection.rangeCount; i++) {
      ranges[i] = selection.getRangeAt(i);
    }

    if (ranges && ranges.length > 0) {
      const range = ranges[0];
      return range.startContainer === this.textarea.parentElement;
    }

    return false;
  };

  getSelectedText = target => {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  };

  onChange = (event, value) => {
    console.log("TARGET", event.target.selectionStart);

    this.setState({
      value: event.target.value
    });

    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  };

  componentDidMount() {
    document.addEventListener("selectionchange", event => {
      if (this.hasFocus()) {
        this.setState({
          selectedText: window.getSelection().toString()
        });

        this.props.onSelectionChanged(this.getSelectedText);
      }
    });
  }

  render() {
    return (
      <Textarea
        className="editor"
        textareaRef={ref => (this.textarea = ref)}
        rows={12}
        style={{ border: "thin solid black", height: "100%" }}
        value={
          this.props.value !== undefined ? this.props.value : this.state.value
        }
        onChange={this.onChange}
      />
    );
  }
}
