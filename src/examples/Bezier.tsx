import React, {Component} from "react";
import {getWebGLContext, iWebGLRenderingContext} from "../assets/js/cuon-utils";
import { Matrix4 } from "assets/js/cuon-matrix";
import { Orientation } from "Orientation";

//  bezier.js:  Bezier curve drawing
//  R. Renka
//  12/05/2016
//
//  This program constructs a two-segment G^1 piecewise cubic Bezier
//  space curve.  Control points P0, P1, ..., P6 may be dragged in the
//  projection plane (with the left mouse button), but P2, P3, and P4
//  are forced to remain collinear in order to retain continuity of the
//  tangent vector.  Keypresses allow rotation and zoom in or out.
// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Bezier extends Component<any, any> {
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
        //  Vertex shader program (GLSL code)
        //
        //  a_Position = vertex position in world coordinates
        //  u_MvpMatrix = Modelview-projection matrix

        attribute vec3 a_Position;

        uniform mat4 u_MvpMatrix;

        void main(void) {

            //  gl_Position = vertex position in clip coordinates

            gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
            gl_PointSize = 7.0;
        }
    `;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE = `
        //
        // Fragment shader program
        //
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec4 u_Color;

        void main() {
            gl_FragColor = u_Color;
        }
    `;

    cp3 : Array<any> = [];

    cpts = [[-6, -6, 0], [-4, 6, 0], [-2, -6, 0], [0, 0, 0],
        [2, 6, 0], [4, -6, 0], [6, 6, 0]];

    icp : number = -1;

    gl?: iWebGLRenderingContext;

    mvpi;
    nseg = 30;

    orient_curve : Orientation = new Orientation(0.0, [1.0, 0.0, 0.0]);

    prg;

    psize : number = 8;

    radius : number = 0;

    vsf : number = 1.2;

    xv : Array<any> = [];

    yv : Array<any> = [];

    zv : Array<any> = [];

    componentDidMount() {

        //  Global variables:
        //
        //  cp3 = Saved initial value of P3 used to move P2 and P4 in parallel
        //        with P3 when P3 is dragged
        //  cpts = Control points [x,y,z]
        //  icp = Index (0 to 6) of the currently selected control point (being
        //        dragged with the mouse) or -1 if none selected
        //  gl = webGL context
        //  mvpi = Inverse of the modelview-projection matrix
        //  nseg = Number of segments in the polygonal approximation (piecewise 
        //         linear interpolant) of each Bezier curve segment
        //  orient_curve = Curve orientation (angle/axis pair)
        //  prg = gl.program
        //  psize = Point size (in pixels) for mouse selection of a control point
        //  radius = Radius of an axis-aligned bounding box
        //  vsf = Scale factor for radius of bounding box, used to zoom in or out
        //  xv,yv,zv = Viewport coordinates and depths of control points computed
        //             in draw for current modelview matrix:  [0,w] X [0,h] 
        //             X [-1,1] for canvas dimensions w by h
        /******************************************************************************/

        const canvasId = "webgl"

        //  Get the rendering context for WebGL
        this.gl = getWebGLContext(canvasId, [{
                vertexShader: this.VSHADER_SOURCE,
                fragmentShader: this.FSHADER_SOURCE
            }]);

        //  Specify the color for clearing <canvas> (background color)
        this.gl.clearColor(0, 0, 0, 1);

        //  Get the storage locations of attribute and uniform variables
        this.prg = this.gl.program?.value;

        this.prg.a_Position = this.gl.getAttribLocation(this.prg, 'a_Position');

        this.prg.u_MvpMatrix = this.gl.getUniformLocation(this.prg, 'u_MvpMatrix');

        this.prg.u_Color = this.gl.getUniformLocation(this.prg, 'u_Color');

        if (this.prg.a_Position < 0 || !this.prg.u_MvpMatrix || !this.prg.u_Color) {

            console.log('Failed to get the storage location of attribute ' +
                'or uniform variable');

            return;

        }

        //  Register event handlers
        document.onkeydown =  (ev) => {
            this.keydown(ev);
        };

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        this.initMouseEvents(canvas);

        //  Draw the initial curve
        this.draw();

    }


    /******************************************************************************/
    computePoints(nseg : number, cpts) {

        //  Use recursive deCasteljau to evaluate a two-segment degree-3
        //  Bezier curve on nseg+1 uniformly distributed parameter values t in
        //  [0,1] for each segment, returning array points with 2*nseg+1 [x,y,z]
        //  triples.  The array cpts of control points [x,y,z] must have length 7.

        const cpt1 = [cpts[0], cpts[1], cpts[2], cpts[3]];

        const cpt2 = [cpts[3], cpts[4], cpts[5], cpts[6]];

        let points : Array<number> = [];

        let t;

        for (let i = 0; i <= nseg; i++) {

            t = i / nseg;

            points[i] = this.deCasteljau(cpt1, 3, 0, t);

        }

        for (let i = 1; i <= nseg; i++) {

            t = i / nseg;

            points[nseg + i] = this.deCasteljau(cpt2, 3, 0, t);

        }

        return points;

    }


    /******************************************************************************/
    // recursive functions have extra cost not normally associated in javascript
    // @link https://stackoverflow.com/questions/37224520/are-functions-in-javascript-tail-call-optimized
    deCasteljau(cpts, r, i, t) {
        //  Recursive for evaluation of a degree-n Bezier space curve C.
        //  cpts = Array of length n+1 containing control points [x,y,z]
        //  r = index in the range 1 to n (n in the external call)
        //  i = index in the range 0 to n-r (0 in the external call)
        //  t = evaluation point in [0,1]
        //  return value = point C(t) = [x,y,z] on the curve
        if (r === 0) {

            return cpts[i];

        }

        const p1 = this.deCasteljau(cpts, r - 1, i, t);

        const p2 = this.deCasteljau(cpts, r - 1, i + 1, t);

        return [(1 - t) * p1[0] + t * p2[0], (1 - t) * p1[1] + t * p2[1],
            (1 - t) * p1[2] + t * p2[2]];

    }


    /******************************************************************************/
    draw() {

        if (undefined === this.gl) {
            return ;// this is for Typescript
        }

        //  Resize the canvas if necessary, and clear the color buffers
        this.resize(this.gl);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        let r = this.radius;

        if (this.icp < 0) {

            //  Compute the radius r of an axis-aligned bounding box containing the
            //  control points, and store global variable radius
            r = 0;

            for (var i = 0; i < 7; i++) {

                r = Math.max(r, Math.abs(this.cpts[i][0]), Math.abs(this.cpts[i][1]),
                    Math.abs(this.cpts[i][2]));

            }

            r = 1.25 * r;

            this.radius = r;

            //  Construct the projection matrix
            const projMatrix = new Matrix4(undefined);

            projMatrix.setOrtho(-this.vsf * r, this.vsf * r, -this.vsf * r, this.vsf * r, 0, 5.0 * r);

            //  Construct the modelview matrix
            const mvMatrix = new Matrix4(undefined);

            mvMatrix.setTranslate(0.0, 0.0, -3.0 * r);

            mvMatrix.rotate(this.orient_curve.angle, this.orient_curve.axis[0],
                this.orient_curve.axis[1], this.orient_curve.axis[2]);

            //  Construct the modelview-projection matrix mvp and its inverse
            //  (global variables mvpi), and copy mvp to the shader location
            const mvpMatrix = new Matrix4(undefined);

            mvpMatrix.set(projMatrix);

            mvpMatrix.multiply(mvMatrix);

            const mvp = mvpMatrix.elements;

            this.gl.uniformMatrix4fv(this.prg.u_MvpMatrix, false, mvp);

            const mvpiMatrix = new Matrix4(undefined);

            mvpiMatrix.setInverseOf(mvpMatrix);

            this.mvpi = mvpiMatrix.elements;

            //  Transform the control points to clip coordinates (normalized device
            //  coordinates) (xv,yv,zv) in [-1,1]^3, and transform (xv,yv) to viewport
            //  coordinates [0,w] X [0,h] for canvas dimensions w and h.

            for (i = 0; i < 7; i++) {

                this.xv[i] = mvp[0] * this.cpts[i][0] + mvp[4] * this.cpts[i][1] +
                    mvp[8] * this.cpts[i][2] + mvp[12];

                this.yv[i] = mvp[1] * this.cpts[i][0] + mvp[5] * this.cpts[i][1] +
                    mvp[9] * this.cpts[i][2] + mvp[13];

                this.zv[i] = mvp[2] * this.cpts[i][0] + mvp[6] * this.cpts[i][1] +
                    mvp[10] * this.cpts[i][2] + mvp[14];

                this.xv[i] = (this.gl.canvas.width / 2) * (this.xv[i] + 1);

                this.yv[i] = (this.gl.canvas.height / 2) * (this.yv[i] + 1);

            }

        }

        //  Create buffer objects for the control points, the curve, and the
        //  bounding box
        const cptsBuffer = this.gl.createBuffer();

        const pointsBuffer = this.gl.createBuffer();

        const boxBuffer = this.gl.createBuffer();

        if (!cptsBuffer || !pointsBuffer || !boxBuffer) {
            console.log('Failed to create a buffer object');
            return -1;
        }

        //  *** Control points:  bind cptsBuffer to the target associated with vertex
        //                       attributes, write the data to the buffer, and assign
        //                       the buffer object to a_Position
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cptsBuffer);

        let vertices = new Float32Array(21);

        for (i = 0; i < 7; i++) {

            vertices[3 * i] = this.cpts[i][0];

            vertices[3 * i + 1] = this.cpts[i][1];

            vertices[3 * i + 2] = this.cpts[i][2];

        }

        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        if (undefined === this?.gl?.program?.value) {

            throw 'Failed; saw condition undefined === this?.gl?.program?.value (search me in code)';

        }

        const a_Position = this.gl.getAttribLocation(this.gl.program.value, 'a_Position');

        if (a_Position < 0) {

            console.log('Failed to get the storage location of a_Position');

            return -1;

        }

        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.enableVertexAttribArray(a_Position);


        //  Set the uniform variable defining the color, and render the
        //  control points
        this.gl.uniform4f(this.prg.u_Color, 1, 0, 0, 1);
        this.gl.drawArrays(this.gl.POINTS, 0, 4);

        this.gl.uniform4f(this.prg.u_Color, 0, 0, 1, 1);
        this.gl.drawArrays(this.gl.POINTS, 4, 3);

        //  *** Curve:  Compute an array of 2*nseg+1 points on the curve

        const points = this.computePoints(this.nseg, this.cpts);

        //  Bind pointsBuffer to the target associated with vertex attributes,
        //  write the data to the buffer, and assign the buffer object to a_Position

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, pointsBuffer);

        vertices = new Float32Array(6 * this.nseg + 3);

        for (i = 0; i < 2 * this.nseg + 1; i++) {

            vertices[3 * i] = points[i][0];

            vertices[3 * i + 1] = points[i][1];

            vertices[3 * i + 2] = points[i][2];

        }

        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);

        //  Set the uniform variable defining the color, and draw the curve
        this.gl.lineWidth(2.0);
        this.gl.uniform4f(this.prg.u_Color, 1, 0, 0, 1);
        this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.nseg + 1);

        this.gl.uniform4f(this.prg.u_Color, 0, 0, 1, 1);
        this.gl.drawArrays(this.gl.LINE_STRIP, this.nseg, this.nseg + 1);

        // *** Bounding box
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boxBuffer);

        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        vertices = new Float32Array([
            r, r, r, -r, r, r, -r, -r, r, r, -r, r,  // v0-v1, v2-v3
            r, -r, -r, -r, -r, -r, r, r, -r, -r, r, -r,  // v4-v7, v5-v6
            r, r, r, r, -r, r, -r, r, r, -r, -r, r,  // v0-v3, v1-v2
            r, -r, -r, r, r, -r, -r, r, -r, -r, -r, -r,  // v4-v5, v6-v7
            r, r, r, r, r, -r, -r, r, r, -r, r, -r,  // v0-v5, v1-v6
            -r, -r, r, -r, -r, -r, r, -r, r, r, -r, -r   // v2-v7, v3-v4
        ]);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);

        //  Set the uniform variables defining the color
        this.gl.uniform4f(this.prg.u_Color, 0.5, 0.5, 0.5, 1);

        //  Draw the wireframe box as line segments
        this.gl.lineWidth(1.0);

        this.gl.drawArrays(this.gl.LINES, 0, 24);

        return 0;
    }


    /******************************************************************************/
    initMouseEvents(canvas : HTMLCanvasElement) {

        //  Register event handlers for mouse button press, mouse motion, and
        //  mouse button release

        //  Global variable icp >= 0 iff a mouse button has been pressed with
        //  the mouse position on control point icp (0 to 6)
        let xc, yc, zc;

        canvas.onmousedown = (event : MouseEvent) => {

            let x = event.clientX, y = event.clientY;

            const target = event.target as HTMLElement;

            const rect = target.getBoundingClientRect();

            //  Convert the mouse coordinates from the client rectangle to the
            //  viewport
            x = (x - rect.left) * canvas.width / (rect.right - rect.left);

            y = (y - rect.top) * canvas.height / (rect.bottom - rect.top);

            y = canvas.height - y;

            this.icp = -1;

            for (let i = 0; i < 7; i++) {
                if (Math.abs(x - this.xv[i]) <= this.psize / 2 &&

                    Math.abs(y - this.yv[i]) <= this.psize / 2) {

                    this.icp = i;

                    break;

                }

            }

            if (this.icp == 3) {
                this.cp3[0] = this.cpts[3][0];
                this.cp3[1] = this.cpts[3][1];
                this.cp3[2] = this.cpts[3][2];
            }
        };

        canvas.onmouseup = () => {
            //  Move control points if necessary to maintain tangent continuity
            if (this.icp == 2 || this.icp == 4) {
                this.cpts[3][0] = (this.cpts[2][0] + this.cpts[4][0]) / 2;
                this.cpts[3][1] = (this.cpts[2][1] + this.cpts[4][1]) / 2;
                this.cpts[3][2] = (this.cpts[2][2] + this.cpts[4][2]) / 2;
            } else if (this.icp == 3) {
                this.cpts[2][0] = this.cpts[2][0] + this.cpts[3][0] - this.cp3[0];
                this.cpts[2][1] = this.cpts[2][1] + this.cpts[3][1] - this.cp3[1];
                this.cpts[2][2] = this.cpts[2][2] + this.cpts[3][2] - this.cp3[2];
                this.cpts[4][0] = this.cpts[4][0] + this.cpts[3][0] - this.cp3[0];
                this.cpts[4][1] = this.cpts[4][1] + this.cpts[3][1] - this.cp3[1];
                this.cpts[4][2] = this.cpts[4][2] + this.cpts[3][2] - this.cp3[2];
            }
            this.icp = -1;
            this.draw();
        };

        canvas.onmousemove = (event) => {
            let x = event.clientX,
                y = event.clientY;

            const target = event.target as HTMLElement;

            const rect = target.getBoundingClientRect();

            x = (x - rect.left) * canvas.width / (rect.right - rect.left);

            y = (y - rect.top) * canvas.height / (rect.bottom - rect.top);

            if (this.icp >= 0) {

                //  Compute clip coordinates (xc,yc,zc) of the mouse position,
                //  and apply the inverse modelview-projection matrix to get
                //  the new control point coordinates
                xc = 2 * x / canvas.width - 1;

                yc = 1 - 2 * y / canvas.height;

                zc = this.zv[this.icp];

                this.cpts[this.icp][0] = this.mvpi[0] * xc + this.mvpi[4] * yc + this.mvpi[8] * zc + this.mvpi[12];

                this.cpts[this.icp][1] = this.mvpi[1] * xc + this.mvpi[5] * yc + this.mvpi[9] * zc + this.mvpi[13];

                this.cpts[this.icp][2] = this.mvpi[2] * xc + this.mvpi[6] * yc + this.mvpi[10] * zc + this.mvpi[14];

                //  Update the viewport coordinates
                this.xv[this.icp] = x;

                this.yv[this.icp] = canvas.height - y;

                //  Display the altered curve
                this.draw();
            }
        };
    }


    /******************************************************************************/
    keydown(event) {

        let ad2, cd, cfac, code, mstep, sd;
        let q : number[] = [];
        const r : Array<number> = [];

        cfac = Math.PI / 180.0;  // Degrees to radians conversion factor
        mstep = 3.0 * cfac;      // Increment for curve rotation angle

        if (event.keyCode !== undefined) {
            code = event.keyCode;
        } else if (event.key !== undefined) {
            code = event.key;
        }

        switch (code) {
            case 37:                  // Left arrow:  y axis, increase
                ad2 = mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_curve.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle mstep or 5*mstep and axis [0, 1, 0]
                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];

                this.orient_curve.fromQuaternion(r);

                this.draw();

                break;

            case 38:                  // Up arrow:  x axis, increase
                ad2 = mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_curve.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle mstep or 5*mstep and axis [1, 0, 0]
                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_curve.fromQuaternion(r);
                this.draw();
                break;

            case 39:                  // Right arrow:  y axis, decrease
                ad2 = -mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_curve.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle -mstep or -5*mstep and axis [0, 1, 0]

                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];
                this.orient_curve.fromQuaternion(r);
                this.draw();
                break;

            case 40:                  // Down arrow:  x axis, decrease
                ad2 = -mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_curve.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle -mstep or -5*mstep and axis [1, 0, 0]

                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_curve.fromQuaternion(r);
                this.draw();
                break;

            case 82:                  // r:  Restore defaults
                this.setDefaults();
                break;

            case 188:                 // <:  Zoom in
                this.zoomIn();
                break;

            case 190:                 // >:  Zoom out
                this.zoomOut();
                break;

            default:
                return;
        }
    }

    /******************************************************************************/
    resize(gl) {

        // Get the canvas from the WebGL context

        const canvas = gl.canvas;

        // Lookup the size the browser is displaying the canvas.
        const displayWidth = canvas.clientWidth;

        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size
            canvas.width = displayWidth;

            canvas.height = displayHeight;

            // Set the viewport to match
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }


    /******************************************************************************/
    setDefaults() {

        //  Set default values
        this.cpts = [[-6, -6, 0], [-4, 6, 0], [-2, -6, 0], [0, 0, 0],
            [2, 6, 0], [4, -6, 0], [6, 6, 0]];

        this.orient_curve.angle = 0.0;

        this.orient_curve.axis = [1.0, 0.0, 0.0];

        this.vsf = 1.2;

        this.draw();

    }


    /******************************************************************************/
    zoomIn() {
        this.vsf *= 0.8;
        this.draw();
    }


    /******************************************************************************/
    zoomOut() {
        this.vsf *= 1.2;
        this.draw();
    }

    render() {

        return (
            <div>
                <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>
            </div>
        );
    }

}

