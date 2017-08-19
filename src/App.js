import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-roboto";

import Button from "material-ui/Button";
import Grid from "material-ui/Grid";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";

import Editor from "./components/Editor";

import dot from "dot-object";
import { pd } from "pretty-data";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      text: localStorage.getItem("queries"),
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
      mode: "cors",
      headers: {
        Authorization: localStorage.getItem("authorization")
      }
    }).then(response => {
      response.json().then(json => {
        this.setState({
          results: json,
          filteredResults: this.filter(json, this.state.filter)
        });
      });
    });
  };

  filter = (results, filter) => {
    if (filter) {
      const filteredResults = dot.pick(filter, results);

      if (
        filteredResults !== undefined &&
        JSON.stringify(filteredResults) !== JSON.stringify({})
      ) {
        results = filteredResults;
      } else {
        return this.lastFilteredResults;
      }

      console.log("results, filteredResults", results, filteredResults);
    }

    return results;
  };

  format = results => {
    if (results === null) {
      return "null";
    }

    try {
      const formatted = pd.json(results || {});
      results = formatted || results;

      this.lastFilteredResults = results;
      return results;
    } catch (error) {
      this.lastFilteredResults = results;
      return results;
    }
  };

  renderJsonPartButton = key => {
    const keyTrimmed = key.slice(0, Math.min(key.length, 25));

    return (
      <div>
        <div
          style={{ cursor: "pointer", margin: 8 }}
          onClick={() => {
            const newFilter = this.state.filter
              ? `${this.state.filter}.${key}`
              : key;
            this.setState({
              filter: newFilter,
              filteredResults: this.filter(this.state.results, newFilter)
            });
          }}
        >
          {keyTrimmed === key ? key : `${keyTrimmed}...`}
        </div>
      </div>
    );
  };

  renderJsonParts = () => {
    const results = this.state.filteredResults;

    if (
      typeof results !== "object" ||
      results === null ||
      results === undefined
    ) {
      return null;
    }

    const primitives = Object.keys(results)
      .filter(key => typeof results[key] !== "object")
      .sort()
      .map(key => this.renderJsonPartButton(key));

    const objects = Object.keys(results)
      .filter(key => typeof results[key] === "object")
      .sort()
      .map(key => this.renderJsonPartButton(key));

    return (
      <Grid container style={{ margin: 16 }}>
        <Grid item xs={6}>
          <Paper style={{ padding: "8px", textAlign: "left" }}>
            <div style={{ color: "#ea4" }}>Objects</div>
            {objects}
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper style={{ padding: "8px", textAlign: "left" }}>
            <div style={{ color: "#ea4" }}>Primitives</div>
            {primitives}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  removeFilterLevel = () => {
    let newFilter;
    const lastPeriod = this.state.filter.lastIndexOf(".");

    if (lastPeriod >= 0) {
      newFilter = this.state.filter.slice(0, lastPeriod);
    } else {
      newFilter = "";
    }

    this.setState({
      filter: newFilter,
      filteredResults: this.filter(this.state.results, newFilter)
    });
  };

  removeFilter = () => {
    this.setState({
      filter: "",
      filteredResults: this.filter(this.state.results, "")
    });
  };

  render() {
    return (
      <div className="App">
        <Grid container style={{ padding: 16 }}>
          <Grid item xs={6}>
            <div>
              <TextField
                placeholder="Authorization"
                style={{ width: 400 }}
                value={localStorage.getItem("authorization")}
                onChange={event =>
                  localStorage.setItem("authorization", event.target.value)}
              />
            </div>

            <Editor
              value={this.state.text}
              onChange={event => {
                this.setState({
                  text: event.target.value
                });

                localStorage.setItem("queries", event.target.value);
              }}
              onSelectionChanged={selectedText => {
                this.setState({ selectedText: selectedText() });
              }}
            />
            <Button onClick={this.handleClick}>Send Request</Button>
            <TextField
              style={{ width: 400 }}
              value={this.state.filter}
              onChange={event =>
                this.setState({
                  filter: event.target.value,
                  filteredResults: this.filter(
                    this.state.results,
                    event.target.value
                  )
                })}
            />
            <Button onClick={this.removeFilterLevel}>
              {"<"}
            </Button>
            <Button onClick={this.removeFilter}>
              {"X"}
            </Button>
            {this.renderJsonParts()}
          </Grid>

          <Grid item xs={6}>
            <pre style={{ textAlign: "left" }}>
              {this.format(this.state.filteredResults)}
            </pre>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
