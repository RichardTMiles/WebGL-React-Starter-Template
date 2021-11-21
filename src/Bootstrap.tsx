import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import swal from '@sweetalert/with-react';

import axios from "axios";

import PageNotFound from 'PageNotFound';
// This is our ajax class
import {CodeBlock, dracula, googlecode} from 'react-code-blocks';

class bootstrap extends React.Component<any, {
  axios: import("axios").AxiosInstance,
  authenticate: string,
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
    this.state = {
      axios: axios.create({
        // `url` is the server URL that will be used for the request
        /*
        url: '/user',
           */
        // `method` is the request method to be used when making the request
        /*
        method: 'get', // default
        */
        // `baseURL` will be prepended to `url` unless `url` is absolute.
        // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
        // to methods of that instance.
        baseURL: '',

        // `transformRequest` allows changes to the request data before it is sent to the server
        // This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
        // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
        // FormData or Stream
        // You may modify the headers object.
        /*transformRequest: [function (data, headers) {
            // Do whatever you want to transform the data
            console.log(data, headers);
            return data;
        }],*/
        // `transformResponse` allows changes to the response data to be made before
        // it is passed to then/catch
        /*transformResponse: [function (data) {
            // Do whatever you want to transform the data
            console.log('Every Axios response is logged in Context.jsx :: ');
            console.log(data);
            return data;
        }],*/
        // `headers` are custom headers to be sent

        // headers: {'X-Requested-With': 'XMLHttpRequest'},

        // `params` are the URL parameters to be sent with the request
        // Must be a plain object or a URLSearchParams object
        /*
        params: {
            ID: 12345
        },
        */
        // `paramsSerializer` is an optional function in charge of serializing `params`
        // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
        /*
        paramsSerializer: function(params) {
            return Qs.stringify(params, {arrayFormat: 'brackets'})
        },
        */
        // `data` is the data to be sent as the request body
        // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
        // When no `transformRequest` is set, must be of one of the following types:
        // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
        // - Browser only: FormData, File, Blob
        // - Node only: Stream, Buffer
        /*
        data: {
            firstName: 'Fred'
        },
        */
        // `timeout` specifies the number of milliseconds before the request times out.
        // If the request takes longer than `timeout`, the request will be aborted.
        timeout: 1000,

        // `withCredentials` indicates whether or not cross-site Access-Control requests
        // should be made using credentials
        withCredentials: false, // default

        // `adapter` allows custom handling of requests which makes testing easier.
        // Return a promise and supply a valid response (see lib/adapters/README.md).

        /*// This is not what I thought it was
        adapter: function (config) {

            return new Promise(function(resolve, reject) {

                let response = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeaders,
                    config: config,
                    request: request
                };

                settle(resolve, reject, response);

                // From here:
                //  - response transformers will run
                //  - response interceptors will run
            });
        },
        */

        // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
        // This will set an `Authorization` header, overwriting any existing
        // `Authorization` custom headers you have set using `headers`.
        /*
        auth: {
            username: 'janedoe',
            password: 's00pers3cret'
        },
        */
        // `responseType` indicates the type of data that the server will respond with
        // options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: 'json', // default

        // `responseEncoding` indicates encoding to use for decoding responses
        // Note: Ignored for `responseType` of 'stream' or client-side requests
        responseEncoding: 'utf8', // default

        // `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
        //xsrfCookieName: 'XSRF-TOKEN', // default

        // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
        //xsrfHeaderName: 'X-XSRF-TOKEN', // default

        // `onUploadProgress` allows handling of progress events for uploads
        onUploadProgress: function () { // progressEvent
          // Do whatever you want with the native progress event
        },

        // `onDownloadProgress` allows handling of progress events for downloads
        onDownloadProgress: function () { // progressEvent
          // Do whatever you want with the native progress event
        },

        // `maxContentLength` defines the max size of the http response content in bytes allowed
        /*maxContentLength: 2000,
    */
        // `validateStatus` defines whether to resolve or reject the promise for a given
        // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
        // or `undefined`), the promise will be resolved; otherwise, the promise will be
        // rejected.
        /* validateStatus: function (status) {
             return status >= 200 && status < 300; // default
         },*/

        // `maxRedirects` defines the maximum number of redirects to follow in node.js.
        // If set to 0, no redirects will be followed.
        maxRedirects: 0, // default

        // `socketPath` defines a UNIX Socket to be used in node.js.
        // e.g. '/var/run/docker.sock' to send requests to the docker daemon.
        // Only either `socketPath` or `proxy` can be specified.
        // If both are specified, `socketPath` is used.
        socketPath: null, // default

        // `httpAgent` and `httpsAgent` define a custom agent to be used when performing http
        // and https requests, respectively, in node.js. This allows options to be added like
        // `keepAlive` that are not enabled by default.

        /*
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        */


        // 'proxy' defines the hostname and port of the proxy server
        // Use `false` to disable proxies, ignoring environment variables.
        // `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
        // supplies credentials.
        // This will set an `Proxy-Authorization` header, overwriting any existing
        // `Proxy-Authorization` custom headers you have set using `headers`.
        /*proxy: {
            host: '127.0.0.1',
            port: 9000,
            auth: {
                username: 'mikeymike',
                password: 'rapunz3l'
            }
        },*/

        // `cancelToken` specifies a cancel token that can be used to cancel the request
        // (see Cancellation section below for details)
        /*cancelToken: new CancelToken(function (cancel) {
        })*/
      }),
      authenticate: '/carbon/authenticated',
      authenticated: null,
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

  semaphoreLock = <T extends React.Component>(context ?: T): Function =>
    (callback: Function, localLock: boolean = false): Function => (opt ?: any): boolean => {

      const criticalSection = async (): Promise<void> => {
        console.time("Critical Section");
        try {
          if (context === undefined) {
            await callback(opt);
          } else {
            console.log('opActive: true');
            await context.setState({ operationActive: true }, async () => {
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
          this.setState({ operationActive: true },
            () => criticalSection().catch(lockError))
        } else {
          criticalSection().catch(lockError)
        }
        return true;
      }
      return false;
    };


  changeLoggedInStatus = () => {
    this.setState({ authenticated: !this.state.authenticated });
  };

  subRoutingSwitch = (route, rest) => {
    if (rest === undefined) {
      rest = [];
    }
    return <Switch>
      {route.map((prop, key) => {
        if (prop.redirect) {
          if (!prop.pathTo) {
            console.log('bad route redirect,', prop);
            return "";
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
                render={y => (
                  <x.component
                    id={this.state.id}
                    axios={this.state.axios}
                    subRoutingSwitch={this.subRoutingSwitch}
                    authenticated={this.state.authenticated}
                    authenticate={this.authenticate}
                    changeLoggedInStatus={this.changeLoggedInStatus}
                    testRestfulPostPutDeleteResponse={this.testRestfulPostPutDeleteResponse}
                    path={prop.path}
                    {...x}
                    {...y}
                    {...rest} />
                )}
                key={key}/>
            );
          });
        }
        return <Route
          path={prop.path}
          render={props => (
            <prop.component
              id={this.state.id}
              axios={this.state.axios}
              subRoutingSwitch={this.subRoutingSwitch}
              authenticated={this.state.authenticated}
              authenticate={this.authenticate}
              changeLoggedInStatus={this.changeLoggedInStatus}
              path={prop.path}
              {...prop}
              {...props}
              {...rest} />
          )}
          key={key}/>;
      })}
      <Route component={PageNotFound}/>
    </Switch>
  };

  authenticate = () => {

    this.state.axios.get(this.state.authenticate).then(res => {
      console.log("authenticate data: ", res);
      this.setState({
        id: res?.data?.id || '',
        authenticated: res?.data?.success || false,
        versions: Object.values(res?.data?.versions || {}).sort((v1 : string, v2 : string) => {
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
    });
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
        return null; // recursive ending condition
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

      handleAlert(alert);
    }
  };

  componentDidMount() {
    this.state.axios.interceptors.request.use(req => {
        if (req.method === 'get' && req.url.match(/^\/rest\/.*$/)) {
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

    const { isLoaded, authenticated, alert } = this.state;

    if (!isLoaded) {
      return <h2>Loading...</h2>;
    } else {
      //DO NOT DELETE; WILL USE LATER;
      // get the first element in the uri /{first}/
      let path = this.props.location.pathname;

      // // Remove the context root from the uri
      path = path.substr(context.contextHost.length, path.length).split("/")[1];

      // Routes that belong to the public and private sector
      let Routes = [];

      // const Route
      // @ts-ignore
      Routes = Routes.concat([
        key => (
          <Route
            key={key}
            path="/"
            render={props => (authenticated ?
                <Private
                  darkMode={this.state.darkMode}
                  versions={this.state.versions}
                  switchDarkAndLightTheme={this.switchDarkAndLightTheme}
                  codeBlock={this.codeBlock}
                  axios={this.state.axios}
                  subRoutingSwitch={this.subRoutingSwitch}
                  authenticated={authenticated}
                  authenticate={this.authenticate}
                  changeLoggedInStatus={this.changeLoggedInStatus}
                  testRestfulPostPutDeleteResponse={this.testRestfulPostPutDeleteResponse}
                  path={path}
                  {...props}
                /> :
                <Public
                  darkMode={this.state.darkMode}
                  versions={this.state.versions}
                  switchDarkAndLightTheme={this.switchDarkAndLightTheme}
                  codeBlock={this.codeBlock}
                  axios={this.state.axios}
                  subRoutingSwitch={this.subRoutingSwitch}
                  authenticated={authenticated}
                  authenticate={this.authenticate}
                  changeLoggedInStatus={this.changeLoggedInStatus}
                  testRestfulPostPutDeleteResponse={this.testRestfulPostPutDeleteResponse}
                  path={path}
                  {...props}
                />
            )}
          />
        )
      ]);

      return (
        <div>
          {alert}
          {Routes.map((closure, key) => closure(key))}
        </div>
      );
    }
  }
}

export default bootstrap;
