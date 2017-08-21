import React, {Component} from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-roboto";

import AppBar from "material-ui/AppBar";
import Button from "material-ui/Button";
import Grid from "material-ui/Grid";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";

import {flatMap} from "lodash";

import Editor from "./components/Editor";

import dot from "dot-object";
import {pd} from "pretty-data";

class App extends Component {
  constructor(props) {
    super(props);

    document.addEventListener("paste", event => {
      console.log("event", event);
      console.log(
        "var clipboardText = clipboardData.getData('Text')",
        event.clipboardData.getData("Text"),
      );

      const clipboardText = event.clipboardData.getData("Text");

      if (clipboardText.toLowerCase().includes("curl")) {
        event.preventDefault();

        this.handleParsedCurl(clipboardText);
      }
    });

    this.state = {
      authorization: localStorage.getItem("authorization"),
      filter: "",
      results: "",
      selectedText: localStorage.getItem("selectedText"),
      queries: localStorage.getItem("queries"),
    };
  }

  handleParsedCurl(text) {
    let url = "";
    let authorization = "";

    const tokens = text.trim().split(" ");

    console.log("tokens", tokens);

    for (var index = 0; index < tokens.length; index++) {
      var element = tokens[index];

      if (element.toLowerCase().includes("http") && !url) {
        url = element;
        url = url.replace("'", "").replace('"', "");
        url = url.replace("'", "").replace('"', "");
      }

      if (element.toLowerCase().includes("authorization")) {
        authorization = tokens[index + 1] + " " + tokens[index + 2];
        authorization = authorization.replace("'", "").replace('"', "");
        authorization = authorization.replace("'", "").replace('"', "");
      }

      console.log("element", element);
    }

    const newQueries = localStorage.getItem("queries") + "GET " + url;
    authorization = authorization || this.state.authorization;

    this.setState({
      authorization,
      queries: newQueries,
      selectedText: newQueries,
    });

    localStorage.setItem("queries", newQueries);
    localStorage.setItem("authorization", authorization);

    this.sendRequest(url, "get", authorization);
  }

  handleClick = () => {
    let url;
    let method;
    const authorization = this.state.authorization;

    var ranges = [];

    if (this.state.selectedText) {
      const tokens = this.state.selectedText.trim().split(" ");
      method = tokens[0];
      url = tokens[1];
    } else {
      const tokens = this.state.queries.split(" ");
      method = tokens[0];
      url = tokens[1];
    }

    if (!url) {
      return;
    }

    if (url.indexOf("http") === -1) {
      url = `http://${url}`;
    }

    this.sendRequest(url, method, authorization);
  };

  sendRequest = (url, method, authorization) => {
    console.log("url, method, authorization", url, method, authorization);

    fetch(url, {
      method: method,
      mode: "cors",
      headers: {
        Authorization: authorization,
      },
    }).then(response => {
      response.json().then(json => {
        this.setState({
          results: json,
          filteredResults: this.filter(json, this.state.filter),
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
          style={{cursor: "pointer", margin: 8}}
          onClick={() => {
            const newFilter = this.state.filter
              ? `${this.state.filter}.${key}`
              : key;
            this.setState({
              filter: newFilter,
              filteredResults: this.filter(this.state.results, newFilter),
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

    const sortedPrimitives = Object.keys(results)
      .filter(key => typeof results[key] !== "object" || results[key] === null)
      .sort();

    const primitivesWithValues = flatMap(sortedPrimitives, key => [
      <div
        style={{
          textDecoration: "underline green",
        }}
      >
        {key}
      </div>,
      <div
        style={{
          color: "#777",
          margin: "2px 0 8px 16px",
        }}
      >
        {results[key]}
      </div>,
    ]);

    const objects = Object.keys(results)
      .filter(key => typeof results[key] === "object" && results[key] !== null)
      .sort()
      .map(key => this.renderJsonPartButton(key));

    return (
      <Grid container>
        <Grid item xs={7}>
          <Paper style={{padding: "8px", textAlign: "left", minHeight: 20}}>
            <div style={{color: "#ea4"}}>Primitives</div>
            {primitivesWithValues}
          </Paper>
        </Grid>
        <Grid item xs={5}>
          <Paper style={{padding: "8px", textAlign: "left", minHeight: 20}}>
            <div style={{color: "#ea4"}}>Objects</div>
            {objects}
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
      filteredResults: this.filter(this.state.results, newFilter),
    });
  };

  removeFilter = () => {
    this.setState({
      filter: "",
      filteredResults: this.filter(this.state.results, ""),
    });
  };

  render() {
    return (
      <div className="App">
        <AppBar
          style={{
            webkitAppRegion: "drag",
            cursor: "pointer",
          }}
          position="static"
          color="default"
        >
          <Toolbar>
            <Typography type="title" color="inherit">
              Parkway
            </Typography>
          </Toolbar>
        </AppBar>

        <div className="container">
          <Grid container style={{padding: 16}}>
            <Grid item xs={6}>
              <div>
                <TextField
                  placeholder="Authorization"
                  style={{width: 400}}
                  value={this.state.authorization}
                  onChange={event => {
                    this.setState({
                      authorization: event.target.value,
                    });
                    localStorage.setItem("authorization", event.target.value);
                  }}
                />
              </div>

              <Editor
                value={this.state.queries}
                onChange={event => {
                  this.setState({
                    queries: event.target.value,
                  });

                  localStorage.setItem("queries", event.target.value);
                }}
                onSelectionChanged={selectedTextFunc => {
                  const selectedText = selectedTextFunc();
                  if (selectedText) {
                    this.setState({selectedText});
                    localStorage.setItem("selectedText", selectedText);
                  }
                }}
              />
              <Button onClick={this.handleClick}>Send Request</Button>
              <TextField
                style={{width: 400}}
                value={this.state.filter}
                onChange={event =>
                  this.setState({
                    filter: event.target.value,
                    filteredResults: this.filter(
                      this.state.results,
                      event.target.value,
                    ),
                  })}
              />
              <div>
                <Button onClick={this.removeFilterLevel}>
                  {"<"}
                </Button>
                <Button onClick={this.removeFilter}>
                  {"X"}
                </Button>
              </div>
              {this.renderJsonParts()}
            </Grid>

            <Grid item xs={6}>
              <pre style={{textAlign: "left"}}>
                {this.format(this.state.filteredResults)}
              </pre>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
