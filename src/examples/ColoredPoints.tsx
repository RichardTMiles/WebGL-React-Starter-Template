import React, {Component} from "react";

import {getWebGLContext, initShaders} from "assets/js/cuon-utils"

export default class ColoredPoints extends Component<any, {
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


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'void main() {\n' +
        '  gl_Position = a_Position;\n' +
        '  gl_PointSize = 10.0;\n' +
        '}\n';

    // Fragment shader program
    FSHADER_SOURCE =
        'precision mediump float;\n' +
        'uniform vec4 u_FragColor;\n' +  // uniform変数
        'void main() {\n' +
        '  gl_FragColor = u_FragColor;\n' +
        '}\n';

    componentDidMount() {
        // Retrieve <canvas> element
        const canvas = document.getElementById('webgl');

        if (null === canvas) {

            alert('Failed to get canvas element');

            return;

        }

        // Get the rendering context for WebGL
        const gl = getWebGLContext(canvas);

        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // Initialize shaders
        const program = initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        if (!program) {
            console.log('Failed to intialize shaders.');
            return;
        }

        // // Get the storage location of a_Position
        const a_Position = gl.getAttribLocation(program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        // Get the storage location of u_FragColor
        const u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
        if (!u_FragColor) {
            console.log('Failed to get the storage location of u_FragColor');
            return;
        }

        // Register function (event handler) to be called on a mouse press
        canvas.onmousedown = (ev) => {
            this.click(ev, gl, canvas, a_Position, u_FragColor)
        };

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


    g_points: number[][] = [];  // The array for the position of a mouse press

    g_colors: number[][] = [];  // The array to store the color of a point

    click(ev, gl, canvas, a_Position, u_FragColor) {
        let x = ev.clientX; // x coordinate of a mouse pointer
        let y = ev.clientY; // y coordinate of a mouse pointer
        const rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        // Store the coordinates to g_points array
        this.g_points.push([x, y]);

        this.setState({x,y});

        // Store the coordinates to g_points array
        if (x >= 0.0 && y >= 0.0) {      // First quadrant
            this.g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
        } else if (x < 0.0 && y < 0.0) { // Third quadrant
            this.g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
        } else {                         // Others
            this.g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
        }

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        const len = this.g_points.length;
        for (let i = 0; i < len; i++) {
            const xy = this.g_points[i];
            const rgba = this.g_colors[i];

            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
            // Pass the color of a point to u_FragColor variable
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }


    render() {

        // @link https://sites.google.com/site/webglbook/home/chapter-3
        return (
            <div>
                <h1>{this.state.x}, {this.state.y}</h1>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </div>
        );
    }

}

