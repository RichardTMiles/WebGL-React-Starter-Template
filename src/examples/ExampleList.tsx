import React, {Component} from "react";
import {Link} from "react-router-dom";
import {iCustomRoute} from "../Bootstrap";
import Nest from "./Nest";


export default class ExampleList extends Component<{
    Routes: iCustomRoute[]
}, {}> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }

    render() {

        return (
            <Nest position={"absolute"}>
                <div style={{textAlign: "center"}}>
                    <h1><a
                        href={"https://github.com/RichardTMiles/WebGL-React-Starter-Template"}>https://github.com/RichardTMiles/WebGL-React-Starter-Template</a>
                    </h1>
                    {this.props.Routes.map((value, key) => value?.redirect === true ? '' :
                        <div key={key}><Link to={value.path}>{value?.name}</Link><br/></div>
                    )}
                </div>
            </Nest>

        );
    }

}

