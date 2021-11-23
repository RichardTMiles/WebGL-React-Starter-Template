import React from "react";

import {getWebGLContext, initShaders} from "assets/cuon-utils"

const WALL = 'WALL';
const BASE = 'BASE';
const ENTRY = 'ENTRY';
const PATH = 'PATH';
const PLAY = 'PLAY';

/// WHAT WE KNOW???
// We're doing simple.. Keep it simple..
// This is a one 2 one map; a dynamic map builder tool would be easy but out of scope
// the 'paths' the 'enemies' may travel must be 3 tiles in either x / y
//      The upper and lower paths are 2 SPACES
// PLAY and PATH may not be adjacent
// PLAY and BASE may not be adjacent
// It appears only one ENEMY may occupy a single PATH position at a time

/// WHAT WE DONT???
// moving the ENEMIES is actually an interesting problem the requires a clever solution..
//  At first we can assume every WAVE will travel on a fixed path to the BASE
//  When a BASE is destroyed with multiple enemies already going for that fixed position, the next step may be to back-
//   track to advance. In many cases the new path is likely to be diverge.
// The CS approach has me thinking "Dijkstra's" shortest path algorithm. But things change in computer science and I'm
// not sure how computationally expensive running this for every monster would be... We might try searching "Dijkstra's vs"
// on google and seeing if a better algorithm works in our use case... Were not exactly using a graph, and one monster may
// only occupy a space (i think) so handling that will not be fun.. Maybe it could all be hard coded...

/// STARTING FOCUS
// We can start with a single BASE objective
// Basic layout, I'd like to SPACES to scale to the full page?
//   This might require we have all the ENEMIES be SVG format so they scale..
//   loading this many svgs and moving dynamically them might cause perform issues; but we will find out.
// We can start with each CELL of the MATRIX (SPACE) is a different color; kyle is color blind so .... im actually not sure what to do
//        https://www.tableau.com/about/blog/examining-data-viz-rules-dont-use-red-green-together
//
// We can stick to the original color pallet and maybe keep some accessibility features in our mind
//

/// Projectile motion is an interesting one too ( ENEMY BOMBS )
//      if you google "linear splines" I think this math might help, but I could be overcomplicating too


// noinspection DuplicatedCode
const basicMap = [
    //                         5                             10                            15                            20                            25                            30                            35                            40                            45                            50                            55
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL,],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL,],
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL,],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL,],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL,],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, BASE, BASE, BASE, BASE, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, BASE, BASE, BASE, BASE, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, BASE, BASE, BASE, BASE, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, BASE, BASE, BASE, BASE, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, BASE, BASE, BASE, BASE, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL],
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL],
    [ENTRY, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, WALL, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, PATH, WALL, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, PLAY, WALL],
    [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,],
    //                         5                             10                            15                            20                            25                            30                            35                            40                            45                            50                            55
]


export default class OrbDefence extends React.Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }

    g_points : Array<number> = []; // The array for the position of a mouse press

    // ClickedPints.js (c) 2012 matsuda
    // Vertex shader program
    VSHADER_SOURCE =
        'attribute vec4 a_Position;\n' +
        'void main() {\n' +
        '  gl_Position = a_Position;\n' +
        '  gl_PointSize = 10.0;\n' +
        '}\n';

    // Fragment shader program
    FSHADER_SOURCE =
        'void main() {\n' +
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '}\n';


    // @link https://sites.google.com/site/webglbook/home/chapter-2
    // @link http://rodger.global-linguist.com/webgl/ch02/ClickedPoints.html
    componentDidMount() {

        // Retrieve <canvas> element
        const canvas = document.getElementById('webgl');

        if (null === canvas) {

            alert('Failed to find the canvas element on the page!')

            return;

        }

        // Get the rendering context for WebGL
        const gl = getWebGLContext(canvas, false);

        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // Initialize shaders
        const program = initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);

        if (!program) {
            console.log('Failed to initialize shaders.');
            return;
        }

        // // Get the storage location of a_Position
        const a_Position = gl.getAttribLocation(program, 'a_Position');

        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        // Register function (event handler) to be called on a mouse press
        canvas.onmousedown = (ev) => {
            this.click(ev, gl, canvas, a_Position);
        };

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

    }

    click(ev, gl, canvas, a_Position) {

        let x = ev.clientX; // x coordinate of a mouse pointer

        let y = ev.clientY; // y coordinate of a mouse pointer

        const rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);

        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        // Store the coordinates to g_points array
        this.g_points.push(x);

        this.g_points.push(y);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        const len = this.g_points.length;

        for (let i = 0; i < len; i += 2) {

            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, this.g_points[i], this.g_points[i + 1], 0.0);

            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);

        }

    }


    render() {

        console.log(basicMap);

        return (
            <div>
                <h4>Orb Defence</h4>
                {/** @link https://algassert.com/quirk# */}
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </div>
        );
    }

}

