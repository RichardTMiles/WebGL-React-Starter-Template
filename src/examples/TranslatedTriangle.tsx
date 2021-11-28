import React, {Component} from "react";

import {getWebGLContext} from "assets/js/cuon-utils"
import {Matrix4} from "assets/js/cuon-matrix";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class RotatedTriangleMatrix extends Component<any, any> {
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
        'uniform mat4 u_ModelMatrix;\n' +
        'void main() {\n' +
        '  gl_Position = u_ModelMatrix * a_Position;\n' +
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
        const gl = getWebGLContext('webgl', this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        // Write the positions of vertices to a vertex shader
        const n = this.initVertexBuffers(gl);

        if (false === n || n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        // Create Matrix4 object for model transformation
        const modelMatrix = new Matrix4(undefined);

        // Calculate a model matrix
        const ANGLE = 60.0; // The rotation angle

        const Tx = 0.5;     // Translation distance

        modelMatrix.setRotate(ANGLE, 0, 0, 1);  // Set rotation matrix

        modelMatrix.translate(Tx, 0, 0);        // Multiply modelMatrix by the calculated translation matrix

        // Pass the model matrix to the vertex shader
        const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

        if (!u_ModelMatrix) {
            console.log('Failed to get the storage location of u_xformMatrix');
            return;
        }

        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Specify the color for clearing <canvas>
        gl.clearColor(0, 0, 0, 1);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);

    }

    initVertexBuffers(gl) {

        const vertices = new Float32Array([
            0, 0.3, -0.3, -0.3, 0.3, -0.3
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

        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');

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

