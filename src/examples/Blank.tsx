import React, {Component} from "react";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Blank extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE = `
        void main() {
        }`;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE = `
        void main() {
        }`;

    componentDidMount() {

    }

    render() {

        return (
            <div>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </div>
        );
    }

}

