import React, {Component} from "react";
import {getWebGLContext} from "../assets/js/cuon-utils";
import {Matrix4} from "../assets/js/cuon-matrix";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Hud extends Component<any, any> {
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
        'attribute vec4 a_Color;\n' +
        'uniform mat4 u_MvpMatrix;\n' +
        'uniform bool u_Clicked;\n' + // Mouse is pressed
        'varying vec4 v_Color;\n' +
        'void main() {\n' +
        '  gl_Position = u_MvpMatrix * a_Position;\n' +
        '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed
        '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '  } else {\n' +
        '    v_Color = a_Color;\n' +
        '  }\n' +
        '}\n';

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE =
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n' +
        'varying vec4 v_Color;\n' +
        'void main() {\n' +
        '  gl_FragColor = v_Color;\n' +
        '}\n';

    ANGLE_STEP = 20.0;

    componentDidMount() {
        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', [{
            vertexShader: this.VSHADER_SOURCE,
            fragmentShader: this.FSHADER_SOURCE
        }]);

        // Retrieve <canvas> element
        const hud: HTMLCanvasElement | null = document.getElementById('hud') as HTMLCanvasElement;

        if (!hud) {
            console.log('Failed to get HTML elements');
            return false;
        }

        // Get the rendering context for 2DCG
        const ctx = hud.getContext('2d');

        if (!ctx) {
            console.log('Failed to get rendering context');
            return;
        }

        // Set the vertex information
        const n = this.initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to set the vertex information');
            return;
        }

        // Set the clear color and enable the depth test
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program in hud.tsx'
        }

        // Get the storage locations of uniform variables
        const u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');

        const u_Clicked = gl.getUniformLocation(program, 'u_Clicked');

        if (!u_MvpMatrix || !u_Clicked) {
            console.log('Failed to get the storage location of uniform variables');
            return;
        }

        // Calculate the view projection matrix
        const viewProjMatrix = new Matrix4(undefined);

        viewProjMatrix.setPerspective(30.0, window.innerWidth / window.innerHeight, 1.0, 100.0);

        viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

        gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked

        let currentAngle = 0.0; // Current rotation angle

        // Register the event handler
        hud.onmousedown = (ev) => {   // Mouse is pressed

            const x = ev.clientX, y = ev.clientY;

            const target = ev.target as HTMLElement;

            const rect = target?.getBoundingClientRect();

            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {

                // If pressed position is inside <canvas>, check if it is above object
                const x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;

                const picked = this.check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);

                if (picked) alert('The cube was selected! ');

            }
        }

        const tick = () => {

            // Start drawing
            currentAngle = this.animate(currentAngle);

            this.draw2D(ctx, currentAngle); // Draw 2D

            this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

            requestAnimationFrame(tick);

        };

        tick();

    }

    initVertexBuffers = (gl) => {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        const vertices = new Float32Array([   // Vertex coordinates
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
        ]);

        const colors = new Float32Array([   // Colors
            0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, // v0-v1-v2-v3 front
            0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
            0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
            0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v1-v6-v7-v2 left
            0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v7-v4-v3-v2 down
            0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 back
        ]);

        // Indices of the vertices
        const indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // down
            20, 21, 22, 20, 22, 23     // back
        ]);

        // Write the vertex property to buffers (coordinates and normals)
        if (!this.initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) {
            return -1;
        }

        // Coordinates
        if (!this.initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) {
            return -1;
        }      // Color Information

        // Create a buffer object
        const indexBuffer = gl.createBuffer();

        if (!indexBuffer) {
            return -1;
        }

        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return indices.length;

    }


    check = (gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) => {
        let picked = false;

        gl.uniform1i(u_Clicked, 1);  // Pass true to u_Clicked(Draw cube with red)

        this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

        // Read pixel at the clicked position
        const pixels = new Uint8Array(4); // Array for storing the pixel value

        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        if (pixels[0] == 255) // If red = 255, clicked on cube
            picked = true;


        gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked(Draw cube with specified color)

        this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

        return picked;
    }

    g_MvpMatrix = new Matrix4(undefined); // Model view projection matrix

    draw = (gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) => {

        // Calc The model view projection matrix and pass it to u_MvpMatrix
        this.g_MvpMatrix.set(viewProjMatrix);

        this.g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately

        this.g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);

        this.g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);

        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_MvpMatrix.elements);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers (color and depth)

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw

    }

    draw2D = (ctx, currentAngle) => {

        ctx.clearRect(0, 0, 400, 400); // Clear <hud>

        // Draw triangle with white lines
        ctx.beginPath();                      // Start drawing

        ctx.moveTo(120, 10);
        ctx.lineTo(200, 150);
        ctx.lineTo(40, 150);

        ctx.closePath();

        ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Set white to color of lines

        ctx.stroke();                           // Draw Triangle with white lines

        // Draw white letters
        ctx.font = '18px "Times New Roman"';

        ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters

        ctx.fillText('HUD: Head Up Display', 40, 180);

        ctx.fillText('Triangle is drawn by Canvas 2D API.', 40, 200);

        ctx.fillText('Cube is drawn by WebGL API.', 40, 220);

        ctx.fillText('Current Angle: ' + Math.floor(currentAngle), 40, 240);

    }

    last = Date.now(); // Last time that this function was called

    animate = (angle) => {

        const now = Date.now();   // Calculate the elapsed time

        const elapsed = now - this.last;

        this.last = now;

        // Update the current rotation angle (adjusted by the elapsed time)
        const newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;

        return newAngle % 360;

    }

    initArrayBuffer = (gl, data, num, type, attribute) => {

        // Create a buffer object
        const buffer = gl.createBuffer();

        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }

        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        const program = gl?.program?.value;

        if (program === undefined) {
            throw 'Failed to capture program'
        }

        // Assign the buffer object to the attribute variable
        const a_attribute = gl.getAttribLocation(program, attribute);

        if (a_attribute < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
        }

        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);

        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return true;
    }


    render() {
        return (
            <>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}
                        style={{position: "absolute", zIndex: 0}}>
                    Please use a browser that supports "canvas"
                </canvas>
                <canvas id="hud" width={window.innerWidth} height={window.innerHeight}
                        style={{position: "absolute", zIndex: 1}}/>
            </>
        );
    }

}

