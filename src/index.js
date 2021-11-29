// noinspection NpmUsedModulesInstalled
import React from "react";
// noinspection NpmUsedModulesInstalled
import ReactDOM from "react-dom";
import {createBrowserHistory} from "history";
import {HashRouter, Router} from "react-router-dom";

// Custom CarbonPHP Context Switch
import Bootstrap from "Bootstrap.tsx";

const hist = createBrowserHistory();

const APP_ROOT = process.cwd();

const isAppLocal = '3000' === window.location.port;

const UriStyling = isAppLocal ? Router : HashRouter;

console.log(APP_ROOT);

// @link https://sites.google.com/site/webglbook/home
// @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
ReactDOM.render(
    <UriStyling
        basename={isAppLocal?'':'/WebGL-React-Starter-Template'}
        history={hist}>
        <Bootstrap/>
    </UriStyling>,
    document.getElementById("root")
);
