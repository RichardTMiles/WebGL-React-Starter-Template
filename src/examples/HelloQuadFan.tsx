import React, {Component} from "react";

import {getWebGLContext, initShaders} from "assets/cuon-utils"

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class HelloQuadFan extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'void main() {\n' +
        '  gl_Position = a_Position;\n' +
        '}\n';

    // Fragment shader program
    FSHADER_SOURCE =
        'void main() {\n' +
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '}\n';

    componentDidMount() {

        // Retrieve <canvas> element
        var canvas = document.getElementById('webgl');

        // Get the rendering context for WebGL
        var gl = getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // Initialize shaders
        if (!initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }

        // Write the positions of vertices to a vertex shader
        var n = this.initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        // Specify the color for clearing <canvas>
        gl.clearColor(0, 0, 0, 1);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    }

    initVertexBuffers(gl) {
        var vertices = new Float32Array([
            -0.5, 0.5,   -0.5, -0.5,   0.5, 0.5,　0.5, -0.5
        ]);
        var n = 4; // The number of vertices

        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        return n;
    }


    render() {

        return (
            <div>
                <h4>Orb Defence</h4>
                {/** @link https://algassert.com/quirk# */}
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </div>
        );
    }

}
