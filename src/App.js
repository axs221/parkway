import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-roboto";

import Button from "material-ui/Button";
import Grid from "material-ui/Grid";
import TextField from "material-ui/TextField";

import Editor from "./components/Editor";

import dot from "dot-object";
import { pd } from "pretty-data";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      text: "GET https://jsonplaceholder.typicode.com/comments",
      results: ""
    };
  }

  handleClick = () => {
    let url;
    let method;

    var ranges = [];

    if (this.state.selectedText) {
      const tokens = this.state.selectedText.trim().split(" ");
      method = tokens[0];
      url = tokens[1];
    } else {
      const tokens = this.state.text.split(" ");
      method = tokens[0];
      url = tokens[1];
    }

    if (url.indexOf("http") === -1) {
      url = `http://${url}`;
    }

    fetch(url, {
      method: method,
      mode: "cors"
    }).then(response => {
      response.json().then(json => {
        this.setState({ results: json });
      });
    });
  };

  filterAndFormat = () => {
    let results = this.state.results;

    if (this.state.filter) {
      const filteredResults = dot.pick(this.state.filter, results);

      if (
        filteredResults &&
        JSON.stringify(filteredResults) !== JSON.stringify({})
      ) {
        this.lastSuccessfulFilter = this.state.filter;
        results = filteredResults;
      } else if (this.lastSuccessfulFilter) {
        results = dot.pick(this.lastSuccessfulFilter, results);
      }
    }

    try {
      const formatted = pd.json(results || {});

      return formatted || results;
    } catch (error) {
      return results;
    }
  };

  render() {
    return (
      <div className="App">
        <Grid container>
          <Grid item xs={5}>
            <Editor
              value={this.state.text}
              onChange={event =>
                this.setState({
                  text: event.target.value
                })}
              onSelectionChanged={selectedText => {
                this.setState({ selectedText: selectedText() });
              }}
            />
            <Button onClick={this.handleClick}>Send Request</Button>
            <TextField
              value={this.state.filter}
              onChange={event => this.setState({ filter: event.target.value })}
            />
          </Grid>
          <Grid item xs={7}>
            <pre style={{ textAlign: "left" }}>
              {this.filterAndFormat(this.state.results)}
            </pre>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
