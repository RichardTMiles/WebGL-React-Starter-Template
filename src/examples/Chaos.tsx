import React, {Component} from "react";
import {getWebGLContext} from "../assets/js/cuon-utils";

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Chaos extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE = `
        //
        // Vertex shader program (GLSL code) in the form of a script
        //
        attribute vec4 a_Position;
        void main() {
            gl_Position = a_Position;
            gl_PointSize = 1.0;
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

    componentDidMount() {

        //  chaos.js:  Michael Barnsley's chaos game
        //  R. Renka
        //  10/14/2016
        //
        //  The game is this:  given a triangle and a starting point p,
        //  choose one of the three vertices at random, and move p half
        //  way from its current position to the chosen vertex.  Render
        //  the point, and repeat the procedure until no new pixels are
        //  lit.  The image so generated represents a Sierpinski triangle.

        // Get the rendering context for WebGL
        const gl = getWebGLContext('webgl', this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        if (!gl) {
            console.log("Failed to get the rendering context for WebGL.");
            return;
        }


        // Get the index of a_Position
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');

        if (a_Position < 0) {
            console.log("Failed to get the storage location of a_Position.");
            return;
        }

        // Get the storage location of u_FragColor
        const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

        if (!u_FragColor) {
            console.log('Failed to get the storage location of u_FragColor');
            return;
        }

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Create the image in a triangle with vertices (vx,vy) in the
        // clip coordinate space [-1,1] X [-1,1].

        let i, j, n;

        const vx = [0.0, -0.5, 0.5];    // vertex positions

        const vy = [0.5, -0.5, -0.5];

        const c = [[1.0, 0.0, 0.0],     // vertex colors
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0]];

        let px = 0;                    // coordinates of initial point p

        let py = 0;

        n = 40000;                     // number of points p

        for (i = 0; i < n; i++) {

            j = Math.floor(3.0 * Math.random());

            px = 0.5 * (px + vx[j]);

            py = 0.5 * (py + vy[j]);

            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, px, py, 0.0);

            // Pass the color of a point to u_FragColor variable
            gl.uniform4f(u_FragColor, c[j][0], c[j][1], c[j][2], 1.0);

            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);
        }

    }

    render() {

        return (
            <>
                
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </>
        );
    }

}

