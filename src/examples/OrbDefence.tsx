import React, {Component} from "react";
import {Matrix4} from "assets/js/cuon-matrix";
import {getWebGLContext, iWebGLRenderingContext} from "assets/js/cuon-utils";


const a_Face = 'a_Face';
const a_Color = 'a_Color';


// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class OrbDefence extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }



    render() {
        // render needs to return an empty element while redirecting to https://github.com/RichardTMiles/GameDefense
        window.location.href = 'https://github.com/RichardTMiles/GameDefense';
        return <></>; // return an empty element
    }

}

