import React, {Component} from "react";
import {getWebGLContext} from "../assets/js/cuon-utils";
import { Matrix4 } from "assets/js/cuon-matrix";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class RotatingTriangle extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
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

    // Rotation angle (degrees/second)
    ANGLE_STEP = 45.0;

    componentDidMount() {
        // Get the rendering context for WebGL
        var gl = getWebGLContext('webgl', [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        // Write the positions of vertices to a vertex shader
        var n = this.initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program'
        }

        // Get storage location of u_ModelMatrix
        var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');

        if (!u_ModelMatrix) {
            console.log('Failed to get the storage location of u_ModelMatrix');
            return;
        }

        // Current rotation angle
        var currentAngle = 0.0;

        // Model matrix
        var modelMatrix = new Matrix4(undefined);

        // Start drawing
        const tick = () => {
            currentAngle = this.animate(currentAngle);  // Update the rotation angle
            this.draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
            requestAnimationFrame(tick); // Request that the browser calls tick
        };
        tick();
    }

    initVertexBuffers(gl) {
        var vertices = new Float32Array ([
            0, 0.5,   -0.5, -0.5,   0.5, -0.5
        ]);
        var n = 3;   // The number of vertices

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

        // Assign the buffer object to a_Position variable
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if(a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        return n;
    }

    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
        // Set the rotation matrix
        modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)

        // Pass the rotation matrix to the vertex shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }

    // Last time that this function was called
    g_last = Date.now();

    animate(angle) {
        // Calculate the elapsed time
        var now = Date.now();
        var elapsed = now - this.g_last;
        this.g_last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;
        return newAngle %= 360;
    }

    render() {

        return (
            <>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </>
        );
    }

}

