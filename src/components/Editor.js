import React, {Component} from "react";

import Textarea from "material-ui/Input/Textarea";
import "./Editor.css";

const hlghtta = require("highlight-ta");

export default class Editor extends Component {
  constructor(props) {
    super(props);

    this.state = {value: ""};
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
      value: event.target.value,
    });

    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  };

  removeSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty();
    }
  }

  componentDidMount() {
    this.highlight();

    document.addEventListener("mouseup", event => {
      if (this.hasFocus() && this.getSelectedText().length > 0) {
        document.execCommand("copy");
        this.removeSelection();
      }
    });

    document.addEventListener("selectionchange", event => {
      if (this.hasFocus()) {
        this.setState({
          selectedText: window.getSelection().toString(),
        });

        this.props.onSelectionChanged(this.getSelectedText);
      }
    });
  }

  highlight() {
    if (this.props.selectedText) {
      var div = document.getElementById("highlight-div");
      var ta = document.getElementById("highlight-ta");
      var patterns = {
        pattern1: {pattern: this.props.selectedText, css: "highlight"},
      };

      hlghtta(div, ta, patterns);
    }
  }

  componentDidUpdate() {
    // TODO: this is slow, wait for input to stop? Only update highlighting on selection change?
    this.highlight();
  }

  render() {
    return (
      <div id="highlight-div">
        <textarea
          id="highlight-ta"
          className="editor"
          ref={ref => (this.textarea = ref)}
          style={{
            border: "thin solid black",
            height: "100%",
            width: "100%",
            fontFamily: "Roboto",
            fontSize: 14,
          }}
          rows={4}
          value={
            this.props.value !== undefined ? this.props.value : this.state.value
          }
          onChange={this.onChange}
        />
      </div>
    );
  }
}
