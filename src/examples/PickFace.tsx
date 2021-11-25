import React, {Component} from "react";
import {Matrix4} from "assets/js/cuon-matrix";
import {getWebGLContext} from "../assets/js/cuon-utils";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class PickFace extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Color;\n' +
        'attribute float a_Face;\n' +   // Surface number (Cannot use int for attribute variable)
        'uniform mat4 u_MvpMatrix;\n' +
        'uniform int u_PickedFace;\n' + // Surface number of selected face
        'varying vec4 v_Color;\n' +
        'void main() {\n' +
        '  gl_Position = u_MvpMatrix * a_Position;\n' +
        '  int face = int(a_Face);\n' + // Convert to int
        '  vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;\n' +
        '  if(u_PickedFace == 0) {\n' + // In case of 0, insert the face number into alpha
        '    v_Color = vec4(color, a_Face/255.0);\n' +
        '  } else {\n' +
        '    v_Color = vec4(color, a_Color.a);\n' +
        '  }\n' +
        '}\n';

    // Fragment shader program
    FSHADER_SOURCE =
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n' +
        'varying vec4 v_Color;\n' +
        'void main() {\n' +
        '  gl_FragColor = v_Color;\n' +
        '}\n';

    ANGLE_STEP = 20.0; // Rotation angle (degrees/second)

    currentAngle = 0.0; // Current rotation angle

    componentDidMount() {

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        // Set the vertex information
        const n = this.initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to set the vertex information');
            return;
        }

        // Set the clear color and enable the depth test
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.enable(gl.DEPTH_TEST);

        // Get the storage locations of uniform variables
        const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

        const u_PickedFace = gl.getUniformLocation(gl.program, 'u_PickedFace');

        if (!u_MvpMatrix || !u_PickedFace) {
            console.log('Failed to get the storage location of uniform variable');
            return;
        }

        // Calculate the view projection matrix
        const viewProjMatrix = new Matrix4(undefined);

        viewProjMatrix.setPerspective(30.0, window.innerWidth / window.innerHeight, 1.0, 100.0);

        viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

        // Initialize selected surface
        gl.uniform1i(u_PickedFace, -1);

        // Register the event handler
        gl.canvas.onmousedown = (ev) => {   // Mouse is pressed

            const target = ev.target as HTMLElement;

            const x = ev.clientX,
                y = ev.clientY;

            const rect = target.getBoundingClientRect();

            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {

                // If Clicked position is inside the <canvas>, update the selected surface
                const x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;

                const face = this.checkFace(gl, n, x_in_canvas, y_in_canvas, this.currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix);

                gl.uniform1i(u_PickedFace, face); // Pass the surface number to u_PickedFace

                this.draw(gl, n, this.currentAngle, viewProjMatrix, u_MvpMatrix);

            }

        }

        const tick = () => {   // Start drawing

            this.currentAngle = this.animate(this.currentAngle);

            this.draw(gl, n, this.currentAngle, viewProjMatrix, u_MvpMatrix);

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
            0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v0-v1-v2-v3 front
            0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
            0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v0-v5-v6-v1 up
            0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
            0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, // v7-v4-v3-v2 down
            0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 back
        ]);

        const faces = new Uint8Array([   // Faces
            1, 1, 1, 1,     // v0-v1-v2-v3 front
            2, 2, 2, 2,     // v0-v3-v4-v5 right
            3, 3, 3, 3,     // v0-v5-v6-v1 up
            4, 4, 4, 4,     // v1-v6-v7-v2 left
            5, 5, 5, 5,     // v7-v4-v3-v2 down
            6, 6, 6, 6,     // v4-v7-v6-v5 back
        ]);

        const indices = new Uint8Array([   // Indices of the vertices
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // down
            20, 21, 22, 20, 22, 23     // back
        ]);

        // Create a buffer object
        const indexBuffer = gl.createBuffer();

        if (!indexBuffer) {
            return -1;
        }

        // Write vertex information to buffer object
        if (!this.initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1; // Coordinates Information

        if (!this.initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;      // Color Information

        if (!this.initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, 'a_Face')) return -1;// Surface Information

        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return indices.length;

    }

    checkFace = (gl, n, x, y, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix) => {
        const pixels = new Uint8Array(4); // Array for storing the pixel value
        gl.uniform1i(u_PickedFace, 0);  // Draw by writing surface number into alpha value
        this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        // Read the pixel value of the clicked position. pixels[3] is the surface number
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        return pixels[3];
    }

    g_MvpMatrix = new Matrix4(undefined); // Model view projection matrix

    draw = (gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) => {
        // Caliculate The model view projection matrix and pass it to u_MvpMatrix
        this.g_MvpMatrix.set(viewProjMatrix);
        this.g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
        this.g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
        this.g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_MvpMatrix.elements);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw
    }

    last = Date.now();  // Last time that this function was called

    animate = (angle) => {

        const now = Date.now(); // Calculate the elapsed time

        const elapsed = now - this.last;

        this.last = now;

        // Update the current rotation angle (adjusted by the elapsed time)
        const newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;

        return newAngle % 360;

    }

    initArrayBuffer = (gl, data, type, num, attribute) => {

        // Create a buffer object
        const buffer = gl.createBuffer();

        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }

        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        // Assign the buffer object to the attribute variable
        const a_attribute = gl.getAttribLocation(gl.program, attribute);

        if (a_attribute < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
        }

        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

        // Enable the assignment to a_attribute variable
        gl.enableVertexAttribArray(a_attribute);

        return true;
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

