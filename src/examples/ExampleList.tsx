import React, {Component} from "react";
import { Link } from "react-router-dom";
import {iCustomRoute} from "../Bootstrap";


export default class ExampleList extends Component<{
    Routes: iCustomRoute[]
}, { }> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }

    render() {

        return (
            <div>
                {this.props.Routes.map(value => value?.redirect === true ? '' :
                    <><Link to={value.path}>{value?.name}</Link><br/></>
                )}
            </div>
        );
    }

}

