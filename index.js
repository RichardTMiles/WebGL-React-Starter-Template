// noinspection NpmUsedModulesInstalled
import React, {StrictMode} from "react";
// noinspection NpmUsedModulesInstalled
import ReactDOM from "react-dom";
import {createBrowserHistory} from "history";
import {Router} from "react-router-dom";

// Custom CarbonPHP Context Switch
import Bootstrap from "Bootstrap.tsx";

import "assets/css/material-dashboard-react.css?v=1.5.0";

const hist = createBrowserHistory();

const APP_ROOT = process.cwd();

ReactDOM.render(
  <StrictMode>
    <Router history={hist}>
      <Bootstrap/>
    </Router>
  </StrictMode>,
  document.getElementById("root")
);
