import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-roboto";

import Button from "material-ui/Button";
import TextField from "material-ui/TextField";
import Typography from "material-ui/Typography";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { results: "" };
  }

  handleClick = () => {
    fetch("http://jsonplaceholder.typicode.com/posts", {
      method: "GET",
      mode: "cors"
    }).then(response => {
      response.json().then(json => {
        console.log("RESPONSE", json);
        this.setState({ results: JSON.stringify(json) });
      });
    });
  };

  render() {
    return (
      <div className="App">
        <TextField multiline rowsMax="12" />
        <Button onClick={this.handleClick}>Send Request</Button>
        <Typography>
          {this.state.results}
        </Typography>
      </div>
    );
  }
}

export default App;
