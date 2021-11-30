import React, {Component} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import swal from '@sweetalert/with-react';
import Qs from "qs";
import axios, {AxiosInstance} from "axios";
import { setupCache } from 'axios-cache-adapter'

import PageNotFound from 'PageNotFound';
// This is our ajax class
import {CodeBlock, dracula, googlecode} from 'react-code-blocks';
import WebGl from "./WebGl";

export interface iCustomRoute {
    component?: any,
    name?: string,
    path: string,
    pathTo?: string,
    redirect?: boolean
}

class bootstrap extends Component<any, {
    axios: AxiosInstance,
    authenticate: string,
    isAppLocal?: boolean,
    authenticated?: boolean,
    alert?: boolean,
    operationActive: boolean,
    isLoaded: boolean,
    darkMode: boolean,
    alertsWaiting: Array<any>,
    versions: Array<any>,
    id: string
}> {
    constructor(props) {

        super(props);

        const cache = setupCache({
            maxAge: 0
        });

        this.state = {
            isAppLocal: '3000' === window.location.port,
            axios: axios.create({
                baseURL: '',
                adapter: cache.adapter,
                /**
                 * These headers are important to use here at dig.
                 * XMLHttpRequest - is a standard header all jquery ajax requests send by default. This allows our php side to return
                 *                  nothing while running the get_header() and get_footer() functions with (bool) DropVariables::$ajax;
                 *
                 * application/json - is for the error catcher in php; this header will cause a JSON response instead of the default HTML
                 */
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },

                // `params` are the URL parameters to be sent with the request
                // Must be a plain object or a URLSearchParams object
                paramsSerializer: function(params) {
                    // Nested get params [][][,,,] do not serialize correctly without Qs
                    return Qs.stringify(params, { arrayFormat: 'indices', indices: true })
                },
                // `data` is the data to be sent as the request body
                // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
                // When no `transformRequest` is set, must be of one of the following types:
                // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
                // - Browser only: FormData, File, Blob
                // - Node only: Stream, Buffer
                data: {},
                timeout: 10000,
                withCredentials: false, // default
                responseType: 'json', // default
                onUploadProgress: function () { // progressEvent
                    // Do whatever you want with the native progress event
                },
                onDownloadProgress: function () { // progressEvent
                    // Do whatever you want with the native progress event
                },
                maxRedirects: 0, // default
            }),
            authenticate: '/carbon/authenticated',
            alert: false,
            operationActive: false,
            isLoaded: false,
            alertsWaiting: [],
            darkMode: true,
            versions: [],
            id: ''
        };

        this.switchDarkAndLightTheme = this.switchDarkAndLightTheme.bind(this);
        this.handleResponseCodes = this.handleResponseCodes.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.subRoutingSwitch = this.subRoutingSwitch.bind(this);
        this.semaphoreLock = this.semaphoreLock.bind(this);
        this.testRestfulPostPutDeleteResponse = this.testRestfulPostPutDeleteResponse.bind(this);
        this.codeBlock = this.codeBlock.bind(this);
    }

    codeBlock = (markdown: String, highlight: String = "", language: String = "php", dark: boolean = true) => {
        return <CodeBlock
            text={markdown}
            language={language}
            showLineNumbers={true}
            theme={dark ? dracula : googlecode}
            highlight={highlight}
        />
    };

    switchDarkAndLightTheme = () => {
        this.setState({
            darkMode: !this.state.darkMode
        });
    };

    semaphoreLock = <T extends Component>(context ?: T): Function => {
        return (callback: Function, localLock: boolean = false): Function => (opt ?: any): boolean => {

            const criticalSection = async (): Promise<void> => {
                console.time("Critical Section");
                try {
                    if (context === undefined) {
                        await callback(opt);
                    } else {
                        console.log('opActive: true');
                        await context.setState({operationActive: true}, async () => {
                            await callback(opt);
                            console.log('opActive: false');
                            context.setState({
                                operationActive: false
                            })
                        })
                    }
                } finally {
                    console.timeEnd("Critical Section")
                }
                if (!localLock) {
                    this.setState({
                        operationActive: false
                    })
                }
            };

            const lockError = () => {
                swal({
                    text: 'An issue with out system has occurred.',
                    buttons: {
                        cancel: "Close",
                    }
                })
            };

            if (!this.state.operationActive) {
                if (!localLock) {
                    this.setState({operationActive: true},
                        () => criticalSection().catch(lockError))
                } else {
                    criticalSection().catch(lockError)
                }
                return true;
            }
            return false;
        }
    };


    changeLoggedInStatus = () => {
        this.setState({authenticated: !this.state.authenticated});
    };

    startInputChangeUpdateRoutine(
        shouldContinueAfterTimeout: () => boolean,
        cb: () => void,
        timeoutMs: number = 3000): () => void {

        const timer = () => setTimeout(() => {

            if (false === shouldContinueAfterTimeout()) {

                return;

            }

            cb();

        }, timeoutMs);

        const timerId = timer();

        return () => {
            clearTimeout(timerId);
        };

    }

    passPropertiesAndRender(PassComponent : React.ComponentType | React.FunctionComponent, props) {

        console.log(PassComponent, props)

        return <PassComponent
            startInputChangeUpdateRoutine={this.startInputChangeUpdateRoutine}
            changeLoggedInStatus={this.changeLoggedInStatus}
            codeBlock={this.codeBlock}
            semaphoreLock={this.semaphoreLock}
            subRoutingSwitch={this.subRoutingSwitch}
            switchDarkAndLightTheme={this.switchDarkAndLightTheme}
            testRestfulPostPutDeleteResponse={this.testRestfulPostPutDeleteResponse}
            {...this.state}
            {...props} />

    }

    subRoutingSwitch = (route, rest) => {
        if (rest === undefined) {
            rest = [];
        }
        return <Switch>
            {route.map((prop, key) => {
                if (prop.redirect) {
                    if (!prop.pathTo) {
                        console.log('bad route redirect,', prop);
                        return "Bad redirect route passed to subRoutingSwitch";
                    }
                    return <Redirect
                        exact
                        from={prop.path}
                        to={prop.pathTo}
                        key={key}/>;
                }
                if (prop.views) {
                    return prop.views.map((x, key) => {
                        return (
                            <Route
                                exact
                                path={x.path}
                                render={y => this.passPropertiesAndRender(x.component, {...x, ...rest, ...y})}
                                key={key}/>
                        );
                    });
                }
                return <Route
                    path={prop.path}
                    render={props => this.passPropertiesAndRender(prop.component, {...prop, ...rest, ...props})}
                    key={key}/>;
            })}
            <Route component={PageNotFound}/>
        </Switch>
    };

    authenticate = () => {
        this.setState({
            isLoaded: true
        });

        /*this.state.axios.get(this.state.authenticate).then(res => {
            console.log("authenticate data: ", res);
            this.setState({
                id: res?.data?.id || '',
                authenticated: res?.data?.success || false,
                versions: Object.values(res?.data?.versions || {}).sort((v1: any, v2: any) => {
                    let lexicographical = false,
                        zeroExtend = false,
                        v1parts = v1.split('.'),
                        v2parts = v2.split('.');

                    function isValidPart(x) {
                        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
                    }

                    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                        return NaN;
                    }

                    if (zeroExtend) {
                        while (v1parts.length < v2parts.length) v1parts.push("0");
                        while (v2parts.length < v1parts.length) v2parts.push("0");
                    }

                    if (!lexicographical) {
                        v1parts = v1parts.map(Number);
                        v2parts = v2parts.map(Number);
                    }

                    for (let i = 0; i < v1parts.length; ++i) {
                        if (v2parts.length === i) {
                            return 1;
                        }

                        if (v1parts[i] === v2parts[i]) {
                            // noinspection UnnecessaryContinueJS - clarity call
                            continue;
                        } else if (v1parts[i] > v2parts[i]) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }

                    if (v1parts.length !== v2parts.length) {
                        return -1;
                    }

                    return 0;

                }).reverse(),
                isLoaded: true
            });
        });*/
    };

    testRestfulPostPutDeleteResponse = (response, success, error) => {
        if (('data' in response) && ('rest' in response.data) &&
            (('created' in response.data.rest) ||
                ('updated' in response.data.rest) ||
                ('deleted' in response.data.rest))
        ) {
            if (typeof success === 'function') {
                return success(response);
            }
            if (success === null || typeof success === 'string') {
                swal("Success!", success, "success");
            }

            return response.data.rest?.created ?? response.data.rest?.updated ?? response.data.rest?.deleted ?? true;
        }

        if (typeof error === 'function') {
            return error(response);
        }

        if (error === null || typeof error === 'string') {
            swal("Whoops!", error, "error");
        }

        return false;
    };

    handleResponseCodes = data => {
        console.log("handleResponseCodes data", data);

        interface iAlert {
            intercept?: boolean,
            message?: string,
            title?: string,
            type?: string,
        }

        let handleAlert = (alert: iAlert): void => {

            console.log("alert", Object.assign({}, alert));

            if (alert.intercept === false) {
                return; // recursive ending condition
            }

            swal({
                title: alert.title || 'Danger! You didn\'t set a title in your react alert.',
                text: alert.message || 'An alert was encountered, but no message could be parsed.',
                icon: alert.type || 'error',
            }).then(() => {
                let alertsWaiting = this.state.alertsWaiting;
                let nextAlert = alertsWaiting?.pop();
                this.setState({
                    alert: nextAlert !== undefined,
                    alertsWaiting: alertsWaiting
                }, () => nextAlert !== undefined && handleAlert(nextAlert));     // this is another means to end. note: doesn't hurt
            });

            //
        };

        if (data?.data?.alert) {
            console.log("handleResponseCodes ∈ Bootstrap");

            let a: iAlert = data.data.alert, stack: Array<iAlert> = [];

            // C6 Public Alerts

            ['info', 'success', 'warning', 'danger'].map(value => {
                if (value in a) {
                    a[value].map(message => {
                        stack.push({
                            'intercept': true,    // for now lets intercept all
                            'message': message,
                            'title': value,
                            'type': value,
                        });
                        return null;
                    });
                    console.log("stack", Object.assign({}, stack));
                }
                return false; // free up memory through a map
            });

            if (stack.length === 0) {
                return null;
            }

            if (this.state.alert === true) {
                let alertsWaiting = this.state.alertsWaiting;
                alertsWaiting.push(stack);
                this.setState({
                    alertsWaiting: alertsWaiting
                });
                return null;
            }

            let alert = stack.pop();

            console.log("alert", Object.assign({}, alert));

            this.setState({
                alert: true,
                alertsWaiting: stack
            });

            if (undefined !== alert) {
                handleAlert(alert);
            }
        }
    };

    componentDidMount() {
        this.state.axios.interceptors.request.use(req => {
                if (req.method === 'get' && req?.url?.match(/^\/rest\/.*$/)) {
                    req.params = JSON.stringify(req.params)
                }
                return req;
            }, error => {
                return Promise.reject(error);
            }
        );
        this.state.axios.interceptors.response.use(
            response => {
                // Do something with response data
                console.log(
                    "Every Axios response is logged in login.jsx :: ",
                    response
                );
                if (response?.data?.alert) {
                    console.log("alert ∈ response");
                    this.handleResponseCodes(response);
                    return (response?.data?.alert?.error || response?.data?.alert?.danger) ?
                        Promise.reject(response) :
                        response;
                }
                return response;
            },
            error => {
                /* Do something with response error
                   this changes from project to project depending on how your server uses response codes.
                   when you can control all errors universally from a single api, return Promise.reject(error);
                   is the way to go.
                */
                this.handleResponseCodes(error.response);
                console.log("Carbon Axios Caught A Response Error response :: ", error.response);
                return Promise.reject(error);
                // return error.response;
            }
        );

        this.authenticate();
    }


    render() {
        console.log("LOGIN JSX RENDER");

        const {alert} = this.state;

        // Routes that belong to the public and private sector
        let Routes : iCustomRoute[] = [
            {
                path: "/WebGl",
                name: "Example List",
                component: WebGl
            },
            {
                path: "/",
                pathTo: "/WebGl",
                redirect: true
            }
        ];


        return <>

            {this.subRoutingSwitch(Routes, {
                Routes: Routes
            })}

            {alert}

        </>;

    }

}

export default bootstrap;
