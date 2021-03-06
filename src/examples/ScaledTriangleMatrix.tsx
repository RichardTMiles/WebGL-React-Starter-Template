import React, {Component} from "react";

import {getWebGLContext} from "assets/js/cuon-utils"

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class ScaledTriangleMatrix extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // RotatedTriangle_Matrix.js (c) matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'uniform mat4 u_xformMatrix;\n' +
        'void main() {\n' +
        '  gl_Position = u_xformMatrix * a_Position;\n' +
        '}\n';

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE =
        'void main() {\n' +
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '}\n';

    // The scaling factor
    Sx = 1.0;
    Sy = 1.5;
    Sz = 1.0;

    // @link http://rodger.global-linguist.com/webgl/ch03/RotatedTriangle.html
    componentDidMount() {

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        // Write the positions of vertices to a vertex shader
        const n = this.initVertexBuffers(gl);

        if (false === n || n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        // Note: WebGL is column major order
        const xformMatrix = new Float32Array([
            this.Sx, 0.0, 0.0, 0.0,
            0.0, this.Sy, 0.0, 0.0,
            0.0, 0.0, this.Sz, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program'
        }

        // Pass the rotation matrix to the vertex shader
        const u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');

        if (!u_xformMatrix) {

            console.log('Failed to get the storage location of u_xformMatrix');

            return;

        }

        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

        // Specify the color for clearing <canvas>
        gl.clearColor(0, 0, 0, 1);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);

    }

    initVertexBuffers(gl) {

        const vertices = new Float32Array([
            0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);

        const n = 3; // The number of vertices

        // Create a buffer object
        const vertexBuffer = gl.createBuffer();

        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return false;
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

