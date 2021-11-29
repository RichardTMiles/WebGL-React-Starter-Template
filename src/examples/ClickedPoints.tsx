import React, {Component} from "react";

import {getWebGLContext} from "assets/js/cuon-utils"

export default class ClickedPoints extends Component<any, {
    x: number,
    y: number
}> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {
            x: 0,
            y: 0
        };
    }

    g_points: Array<number> = []; // The array for the position of a mouse press

    // ClickedPints.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main() {
            gl_Position = a_Position;
            gl_PointSize = 10.0;
        }`;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`;


    // @link https://sites.google.com/site/webglbook/home/chapter-2
    // @link http://rodger.global-linguist.com/webgl/ch02/ClickedPoints.html
    componentDidMount() {

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        // // Get the storage location of a_Position
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');

        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        // Register function (event handler) to be called on a mouse press
        gl.canvas.onmousedown = (ev) => {
            this.click(ev, gl, gl.canvas, a_Position);
        };

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

    }

    click(ev, gl, canvas, a_Position) {

        let x = ev.clientX; // x coordinate of a mouse pointer

        let y = ev.clientY; // y coordinate of a mouse pointer

        const rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);

        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        // Store the coordinates to g_points array
        this.g_points.push(x);

        this.g_points.push(y);

        this.setState({x, y});

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        const len = this.g_points.length;

        for (let i = 0; i < len; i += 2) {

            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, this.g_points[i], this.g_points[i + 1], 0.0);

            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);

        }

    }

    render() {

        return (
            <>
                <h1>{this.state.x}, {this.state.y}</h1>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </>
        );
    }

}

