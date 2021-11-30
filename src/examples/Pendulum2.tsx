import React, {Component} from "react";
import {getWebGLContext, iWebGLRenderingContext} from "../assets/js/cuon-utils";
import { Matrix4 } from "assets/js/cuon-matrix";


//  R. Miles ;)
//
//  pendulum2.js:  2D pendulum
//  R. Renka
//  07/25/2016
//  This program displays a hexagonal pendulum bob attached by a wire
//  to an anchor point at the origin and rotating with an angular
//  velocity that may be increased or decreased by button presses.
//
//  The pendulum bob is rendered as a triangle fan.  The wire is a
//  line segment, and the anchor point is a small square.
//
//  This code was adapted from RotatingTriangle_withButtons.js in
//  matsuda/ch04.
// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Pendulum2 extends Component<{}, { }> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE = `
        //
        // Vertex shader program (GLSL code) in the form of a script
        //
        attribute vec4 a_Position;
        uniform float u_PointSize;
        uniform mat4 u_ModelMatrix;
        void main() {
            gl_PointSize = u_PointSize;
            gl_Position = u_ModelMatrix * a_Position;
        }
    `;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE = `
        //
        // Fragment shader program
        //
        precision mediump float;
        uniform vec4 u_FragColor;
        void main() {
            gl_FragColor = u_FragColor;
        }
    `;

    //  Global variables:
    //
    //  asize = anchor width and height
    //  currentAngle = angle defining current configuration
    //  da = angular velocity in degrees/second
    //  pause = true iff animation is inactive
    //  radius = radius of pendulum bob
    //  restart = true iff animation was paused and restarted since the
    //            previous update
    //  tick = rendering function defined in main
    //  Lmin, Lmax = Minimum and maximum wire lengths
    asize = 0.03;
    ca = 0.0;
    currentAngle = 0.0;
    da = 45.0;
    Lmin = 0.10;
    Lmax = 0.80;
    pause = false;
    radius = 0.10;
    restart = false;

    a_Position : number = -1;

    gl: iWebGLRenderingContext | null = null;

    u_FragColor: WebGLUniformLocation | null = null;

    u_ModelMatrix: WebGLUniformLocation | null = null;

    //  Model matrix
    modelMatrix : Matrix4 = new Matrix4(undefined);

    componentDidMount() {
        //  Get the rendering context for WebGL
        this.gl = getWebGLContext("webgl", [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        //  Specify the color for clearing <canvas>
        this.gl.clearColor(0, 0, 0, 1);

        //  Write the positions of vertices to the vertex shader
        if (!this.initVertexBuffers(this.gl)) {
            console.log("Failed to set the positions of the vertices");
            return;
        }

        const program = this.gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program in pend'
        }

        //  Get the storage locations of attribute and uniform variables
        this.a_Position = this.gl.getAttribLocation(program, "a_Position");

        this.u_FragColor = this.gl.getUniformLocation(program, "u_FragColor");

        this.u_ModelMatrix = this.gl.getUniformLocation(program, "u_ModelMatrix");

        if (this.a_Position < 0 || !this.u_FragColor || !this.u_ModelMatrix) {
            console.log("Failed to get the storage location of an attribute " +
                "or uniform variable");
            return;
        }

        //  Specify the color for clearing <canvas>
        this.gl.clearColor(0, 0, 0, 1);

        //  Start drawing
        this.tick();
        // end of main

    }

    tick = () => {

        //  Update the rotation angle, and draw the pendulum.
        if (this.pause) {

            this.ca = this.currentAngle;

            return;

        }

        if (!this.restart) {

            this.currentAngle = this.animate(this.currentAngle);

        } else {

            this.currentAngle = this.ca;

            this.g_last = Date.now();

            this.restart = false;

        }

        this.draw(
            this.gl,
            this.currentAngle,
            this.a_Position,
            this.modelMatrix,
            this.u_ModelMatrix,
            this.u_FragColor);

        //  Request that the browser call tick
        requestAnimationFrame(this.tick);

    };


    //  Global variables:  buffer objects
    g_bobBuffer : WebGLBuffer | null = null;
    g_wireBuffer : WebGLBuffer | null = null;
    g_anchorBuffer : WebGLBuffer | null = null;

    /******************************************************************************/
    initVertexBuffers = (gl : iWebGLRenderingContext) => {

//  Compute vertices defining a hexagonal pendulum bob

        const r = this.radius;                      // radius of hexagonal bob
        const xp = 0.5 * r;                    // r*cos(pi/6)
        const yp = (Math.sqrt(3.0) / 2.0) * r;   // r*sin(pi/6)
        let vertices = new Float32Array([
            0.0, 0.0, r, 0.0, xp, yp, -xp, yp, -r, 0.0,
            -xp, -yp, xp, -yp, r, 0.0
        ]);

        //  Create buffer objects
        this.g_bobBuffer = gl.createBuffer();
        this.g_wireBuffer = gl.createBuffer();
        this.g_anchorBuffer = gl.createBuffer();

        if (!this.g_bobBuffer || !this.g_wireBuffer || !this.g_anchorBuffer) {
            console.log("Failed to create a buffer object");
            return -1;
        }

        //  Set the number of vertices property nv, bind the buffer objects
        //  to targets, and write the data for the bob and anchor.  The wire
        //  is altered by draw.

        // @ts-ignore
        this.g_bobBuffer.nv = 8;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.g_bobBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        vertices = new Float32Array([-this.asize / 2.0, -this.asize / 2.0,
            this.asize / 2.0, -this.asize / 2.0,
            this.asize / 2.0, this.asize / 2.0,
            -this.asize / 2.0, this.asize / 2.0]);

        // @ts-ignore
        this.g_anchorBuffer.nv = 4;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.g_anchorBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        return true;
    } // end of initVertexBuffers


    /******************************************************************************/
    draw = (gl, currentAngle, a_Position, modelMatrix, u_ModelMatrix,
         u_FragColor) => {

        //  Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        //  Define the wire length as a function of currentAngle.
        let wireLength = (this.Lmax - this.Lmin) / 180.0;
        if (currentAngle <= 180.0) {
            wireLength = this.Lmin + wireLength * currentAngle;
        } else {
            wireLength = this.Lmax - wireLength * (currentAngle - 180.0);
        }

//  Process the pendulum bob

        gl.bindBuffer(gl.ARRAY_BUFFER, this.g_bobBuffer);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

//  Set the model matrix for the pendulum bob

        modelMatrix.setRotate(currentAngle, 0, 0, 1);
        modelMatrix.translate(0.0, -wireLength, 0.0);

//  Pass the model matrix to the vertex shader

        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

//  Set the fragment color.

        gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);

//  Draw the pendulum bob

        // @ts-ignore
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.g_bobBuffer.nv);

        //  Process the pendulum wire
        const vertices = new Float32Array([
            0.0, 0.0, 0.0, Math.sqrt(3.0) * this.radius / 2.0 - wireLength]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.g_wireBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        //  Set the model matrix for the pendulum wire
        modelMatrix.setRotate(currentAngle, 0, 0, 1);

        //  Pass the model matrix to the vertex shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        //  Set the fragment color.
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

        //  Draw the pendulum wire
        gl.drawArrays(gl.LINES, 0, 2);

        //  Process the pendulum anchor
        gl.bindBuffer(gl.ARRAY_BUFFER, this.g_anchorBuffer);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        //  Set the model matrix for the pendulum anchor
        modelMatrix.setIdentity();

        //  Pass the model matrix to the vertex shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        //  Set the fragment color.
        gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);

        //  Draw the pendulum anchor
        // @ts-ignore
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.g_anchorBuffer.nv);
    } // end of draw


    //  Global variable:  g_last = last time that animate was called
    g_last = Date.now();

    /******************************************************************************/
    animate = (angle) => {

        //  Calculate the elapsed time (in milliseconds)
        const now = Date.now();
        const elapsed = now - this.g_last;
        this.g_last = now;

        //  Update the current rotation angle
        let newAngle = angle + (this.da * elapsed) / 1000.0;
        newAngle %= 360;
        if (newAngle < 0) {
            newAngle += 360;
        }
        return newAngle;
    } // end of animate


//  Button functions

    /******************************************************************************/
    down = () => {
        if (this.da > 0) {
            this.da = Math.max(this.da - 15.0, 5.0);
        } else {
            this.da = Math.min(this.da + 15.0, -5.0);
        }
    }


    /******************************************************************************/
    up = () => {
        if (this.da > 0) {
            this.da += 15.0;
        } else {
            this.da -= 15.0;
        }
    }


    /******************************************************************************/
    stop = () => {
        this.pause = true;
    }


    /******************************************************************************/
    resume = () => {
        if (!this.pause) {
            return;
        }
        this.pause = false;
        this.restart = true;
        this.tick();
    }


    /******************************************************************************/
    reverse = () => {
        this.da = -this.da;
    }


    render() {

        return (
            <div>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight - 40}/>
                <p>
                    <button type="button" onClick={this.up}>Speed-up</button>
                    <button type="button" onClick={this.down}>Slow down</button>
                    <button type="button" onClick={this.stop}>Pause</button>
                    <button type="button" onClick={this.resume}>Resume</button>
                    <button type="button" onClick={this.reverse}>Reverse direction</button>
                </p>
            </div>
        );
    }

}

