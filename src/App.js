import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-roboto";

import Button from "material-ui/Button";
import Grid from "material-ui/Grid";
import pre from "material-ui/Typography";

import Editor from "./components/Editor";

import { pd } from "pretty-data";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { text: "", results: "" };
  }

  handleClick = () => {
    let url;
    let method;

    var ranges = [];

    console.log("this.state.selectedText", this.state.selectedText);

    if (this.state.selectedText) {
      const tokens = this.state.selectedText.trim().split(" ");
      console.log("tokens1", tokens);
      method = tokens[0];
      url = tokens[1];
    } else {
      const tokens = this.state.text.split(" ");
      console.log("tokens2", this.state);
      method = tokens[0];
      url = tokens[1];
      console.log("tokens2", url, method);
    }

    if (url.indexOf("http") === -1) {
      url = `http://${url}`;
    }

    fetch(url, {
      method: method,
      mode: "cors"
    }).then(response => {
      response.json().then(json => {
        console.log("RESPONSE", pd.json(json));
        this.setState({ results: pd.json(json) });
      });
    });
  };

  render() {
    return (
      <div className="App">
        <Grid container>
          <Grid item xs={5}>
            <Editor
              onChange={event => this.setState({ text: event.target.value })}
              onSelectionChanged={selectedText => {
                console.log("selectedText", selectedText());

                this.setState({ selectedText: selectedText() });
              }}
            />
            <Button onClick={this.handleClick}>Send Request</Button>
          </Grid>
          <Grid item xs={7}>
            <pre style={{ textAlign: "left" }}>
              {pd.json(this.state.results || {})}
            </pre>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
