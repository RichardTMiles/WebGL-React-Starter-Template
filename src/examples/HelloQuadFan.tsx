import React, {Component} from "react";

import {getWebGLContext} from "assets/js/cuon-utils"

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class HelloQuadFan extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main() {
          gl_Position = a_Position;
        }`;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`;

    componentDidMount() {

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        // Write the positions of vertices to a vertex shader
        const n = this.initVertexBuffers(gl);

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
        const vertices = new Float32Array([
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5
        ]);
        const n = 4; // The number of vertices

        // Create a buffer object
        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program'
        }

        const a_Position = gl.getAttribLocation(program, 'a_Position');

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
            <>
                
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </>
        );
    }

}

