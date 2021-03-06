import React, {Component} from "react";

import {getWebGLContext} from "assets/js/cuon-utils"

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class RotatedTriangle extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // RotatedTriangle.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE =
        // x' = x cosβ - y sinβ
        // y' = x sinβ + y cosβ　Equation 3.3
        // z' = z
        'attribute vec4 a_Position;\n' +
        'uniform float u_CosB, u_SinB;\n' +
        'void main() {\n' +
        '  gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
        '  gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n' +
        '  gl_Position.z = a_Position.z;\n' +
        '  gl_Position.w = 1.0;\n' +
        '}\n';

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE =
        'void main() {\n' +
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '}\n';

    // The rotation angle
    ANGLE = 90.0;

    // @link http://rodger.global-linguist.com/webgl/ch03/RotatedTriangle.html
    componentDidMount() {

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // Write the positions of vertices to a vertex shader
        const n = this.initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        // // Pass the data required to rotate the shape to the vertex shader
        const radian = Math.PI * this.ANGLE / 180.0; // Convert to radians

        const cosB = Math.cos(radian);

        const sinB = Math.sin(radian);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program'
        }

        const u_CosB = gl.getUniformLocation(program, 'u_CosB');

        const u_SinB = gl.getUniformLocation(program, 'u_SinB');

        if (!u_CosB || !u_SinB) {

            console.log('Failed to get the storage location of u_CosB or u_SinB');

            return;

        }

        gl.uniform1f(u_CosB, cosB);

        gl.uniform1f(u_SinB, sinB);

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

