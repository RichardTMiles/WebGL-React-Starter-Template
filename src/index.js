// noinspection NpmUsedModulesInstalled
import React from "react";
// noinspection NpmUsedModulesInstalled
import ReactDOM from "react-dom";
import {createBrowserHistory} from "history";
import {Router} from "react-router-dom";

// Custom CarbonPHP Context Switch
import Bootstrap from "Bootstrap.tsx";

const hist = createBrowserHistory();

const APP_ROOT = process.cwd();


// @link https://sites.google.com/site/webglbook/home
// @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
ReactDOM.render(
    <Router history={hist}>
        <Bootstrap/>
    </Router>,
    document.getElementById("root")
);
