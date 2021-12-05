import {Component} from "react";
import {Matrix4, Vector3} from "assets/js/cuon-matrix";
import {
    getWebGLContext,
    iWebGLRenderingContext,
    iWebGLProgram, iProgramArgs
} from "../assets/js/cuon-utils";
import {Orientation} from "Orientation";

import bunny from "assets/json/bunny.json"
import cone from "assets/json/cone.json"
import cube from "assets/json/cube.json"
import e37 from "assets/json/e37.json"
import elephant from "assets/json/elephant.json"

// const logo = require('assets/img/webgl.png');

//  wglsurf2.js:  Surface renderer
//  R. Renka
//  04/04/2017
//
//  This program reads a json file containing a triangle mesh surface
//  (model) in the form of a vertex list and triangle list, and displays
//  the surface with a user-specified shading method:  flat, Gouraud,
//  Phong, or wireframe.


interface iProgramAdditionalAttributes {
    a_Position?: number;
    a_Normal?: number;
    a_BaryCoords?: WebGLUniformLocation | null,
    u_AmbientLight?: WebGLUniformLocation | null,
    u_BackColor?: WebGLUniformLocation | null,
    u_FrontColor?: WebGLUniformLocation | null,
    u_LightColor?: WebGLUniformLocation | null,
    u_LightDirection?: WebGLUniformLocation | null,
    u_MvMatrix?: WebGLUniformLocation | null,
    u_MvpMatrix?: WebGLUniformLocation | null,
    u_NormalMatrix?: WebGLUniformLocation | null,
    u_Perspective?: WebGLUniformLocation | null,
    u_Shininess?: WebGLUniformLocation | null,
}

type iProgramMultipleShaders = iWebGLProgram<iProgramAdditionalAttributes>;

type iWebGlWithAdditionalAttributes = iWebGLRenderingContext<{
    bbox: any
}>;


// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class RotateObjectWithMouse extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }


    // ColoredPoint.js (c) 2012 matsuda
    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE_PHONG_SHADING = `
        //
        //  *** Vertex shader program (GLSL code) for Phong shading
        //
        //  a_Position = vertex position in world coordinates
        //  a_Normal = vertex normal vector in world coordinates
        // 
        //  u_MvMatrix = Modelview matrix
        //  u_MvpMatrix = Modelview-projection matrix
        //  u_NormalMatrix = Inverse transpose of modelview matrix

        attribute vec3 a_Position;
        attribute vec3 a_Normal;

        uniform mat4 u_MvMatrix;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_NormalMatrix;

        varying vec3 v_Position;
        varying vec3 v_Normal;

        void main(void) {

            //  gl_Position = vertex position in clip coordinates
            //  v_Position = vertex position in eye coordinates
            //  v_Normal = vertex normal vector in eye coordinates

            gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
            vec4 vPosition = u_MvMatrix * vec4(a_Position, 1.0);
            v_Position = vec3(vPosition);
            v_Normal = vec3(u_NormalMatrix * vec4(a_Normal, 0.0));
        }
    `;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE_PHONG_SHADING = `
        //
        //  ### Fragment shader program for Phong shading
        //
        #ifdef GL_ES
        precision mediump float;
        #endif

        //  u_FrontColor = material front face color
        //  u_BackColor = material back face color
        //  u_AmbientLight = Color of ambient light
        //  u_LightDirection = Direction to point source in eye coordinates
        //  u_LightColor = Color of point light source
        //  u_Perspective = Perspective vs orthogonal projection option
        //  u_Shininess = Exponent in specular reflection term 

        uniform vec4 u_FrontColor;
        uniform vec4 u_BackColor;
        uniform vec3 u_AmbientLight;
        uniform vec3 u_LightDirection;
        uniform vec3 u_LightColor;
        uniform bool u_Perspective;
        uniform float u_Shininess;

        //  v_Position = interpolated fragment position in eye coordinates
        //  v_Normal = interpolated normal vector in eye coordinates

        varying vec3 v_Position;
        varying vec3 v_Normal;

        void main() {

            //  Determine whether the fragment lies on a front or back face, and
            //  choose the material color accordingly

            vec3 normal = normalize(v_Normal);
            vec4 matColor = u_FrontColor;
            vec3 viewDirection;
            if (u_Perspective) {
                viewDirection = normalize(-v_Position);
            } else {
                viewDirection = vec3(0.0, 0.0, 1.0);
            }
            if (dot(normal, viewDirection) <= 0.0) {
                matColor = u_BackColor;
                normal = -normal;
            }

            //  Compute fragment color from Phong's illumination model

            vec3 ambient = u_AmbientLight * matColor.rgb;
            float nDotL = max(dot(u_LightDirection, normal), 0.0);
            float specular = 0.0;
            if (nDotL > 0.0) {
                vec3 reflectDirection = reflect(-u_LightDirection, normal);
                float eDotR = max(dot(reflectDirection, viewDirection), 0.0);
                specular = pow(eDotR, u_Shininess);
            }
            vec3 diffuse = matColor.rgb * nDotL;
            gl_FragColor = vec4(diffuse + ambient + specular * u_LightColor,
            matColor.a);
        }
    `;

    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE_GOURAUD_SHADING = `
        //
        //  *** Vertex shader program (GLSL code) for Gouraud shading
        //

        //  a_Position = vertex position in world coordinates
        //  a_Normal = vertex normal vector in world coordinates

        attribute vec3 a_Position;
        attribute vec3 a_Normal;

        //  u_MvMatrix = Modelview matrix
        //  u_MvpMatrix = Modelview-projection matrix
        //  u_NormalMatrix = Inverse transpose of modelview matrix

        uniform mat4 u_MvMatrix;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_NormalMatrix;

        //  u_FrontColor = material front face color
        //  u_BackColor = material back face color
        //  u_AmbientLight = Color of ambient light
        //  u_LightDirection = Direction to point source in eye coordinates
        //  u_LightColor = Color of point light source
        //  u_Perspective = Perspective vs orthogonal projection option
        //  u_Shininess = Exponent in specular reflection term 

        uniform vec4 u_FrontColor;
        uniform vec4 u_BackColor;
        uniform vec3 u_AmbientLight;
        uniform vec3 u_LightDirection;
        uniform vec3 u_LightColor;
        uniform bool u_Perspective;
        uniform float u_Shininess;

        //  v_Color = Vertex color from illumination model

        varying vec4 v_Color;

        void main(void) {

            //  gl_Position = vertex position in clip coordinates

            gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);

            //  vPosition = vertex position in eye coordinates
            //  vNormal = vertex normal in eye coordinates

            vec3 vPosition = vec3(u_MvMatrix * vec4(a_Position, 1.0));
            vec3 vNormal = vec3(u_NormalMatrix * vec4(a_Normal, 0.0));

            //  Determine whether the vertex lies on a front or back face, and
            //  choose the material color accordingly

            vec3 normal = normalize(vNormal);
            vec4 matColor = u_FrontColor;
            vec3 viewDirection;
            if (u_Perspective) {
                viewDirection = normalize(-vPosition);
            } else {
                viewDirection = vec3(0.0, 0.0, 1.0);
            }
            if (dot(normal, viewDirection) <= 0.0) {
                matColor = u_BackColor;
                normal = -normal;
            }

            //  Compute vertex color from Phong's illumination model

            vec3 ambient = u_AmbientLight * matColor.rgb;
            float nDotL = max(dot(u_LightDirection, normal), 0.0);
            float specular = 0.0;
            if (nDotL > 0.0) {
                vec3 reflectDirection = reflect(-u_LightDirection, normal);
                float eDotR = max(dot(reflectDirection, viewDirection), 0.0);
                specular = pow(eDotR, u_Shininess);
            }
            vec3 diffuse = matColor.rgb * nDotL;
            v_Color = vec4(diffuse + ambient + specular * u_LightColor,
            matColor.a);
        }
    `;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE_GOURAUD_SHADING = `
        //
        //  ### Fragment shader program for Gouraud shading
        //
        #ifdef GL_ES
        precision mediump float;
        #endif

        //  v_Color = Interpolated fragment color

        varying vec4 v_Color;

        void main() {
            gl_FragColor = v_Color;
        }
    `;


    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE_FLAT_SHADING = `
        //
        //  *** Vertex shader program (GLSL code) for flat (faceted) shading
        //
        //  This shader is identical to "shader-vsG".


        //  a_Position = vertex position in world coordinates
        //  a_Normal = vertex normal vector in world coordinates

        attribute vec3 a_Position;
        attribute vec3 a_Normal;

        //  u_MvMatrix = Modelview matrix
        //  u_MvpMatrix = Modelview-projection matrix
        //  u_NormalMatrix = Inverse transpose of modelview matrix

        uniform mat4 u_MvMatrix;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_NormalMatrix;

        //  u_FrontColor = material front face color
        //  u_BackColor = material back face color
        //  u_AmbientLight = Color of ambient light
        //  u_LightDirection = Direction to point source in eye coordinates
        //  u_LightColor = Color of point light source
        //  u_Perspective = Perspective vs orthogonal projection option
        //  u_Shininess = Exponent in specular reflection term 

        uniform vec4 u_FrontColor;
        uniform vec4 u_BackColor;
        uniform vec3 u_AmbientLight;
        uniform vec3 u_LightDirection;
        uniform vec3 u_LightColor;
        uniform bool u_Perspective;
        uniform float u_Shininess;

        //  v_Color = Vertex color from illumination model

        varying vec4 v_Color;

        void main(void) {

            //  gl_Position = vertex position in clip coordinates

            gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);

            //  vPosition = vertex position in eye coordinates
            //  vNormal = vertex normal in eye coordinates

            vec3 vPosition = vec3(u_MvMatrix * vec4(a_Position, 1.0));
            vec3 vNormal = vec3(u_NormalMatrix * vec4(a_Normal, 0.0));

            //  Determine whether the vertex lies on a front or back face, and
            //  choose the material color accordingly

            vec3 normal = normalize(vNormal);
            vec4 matColor = u_FrontColor;
            vec3 viewDirection;
            if (u_Perspective) {
                viewDirection = normalize(-vPosition);
            } else {
                viewDirection = vec3(0.0, 0.0, 1.0);
            }
            if (dot(normal, viewDirection) <= 0.0) {
                matColor = u_BackColor;
                normal = -normal;
            }

            //  Compute vertex color from Phong's illumination model

            vec3 ambient = u_AmbientLight * matColor.rgb;
            float nDotL = max(dot(u_LightDirection, normal), 0.0);
            float specular = 0.0;
            if (nDotL > 0.0) {
                vec3 reflectDirection = reflect(-u_LightDirection, normal);
                float eDotR = max(dot(reflectDirection, viewDirection), 0.0);
                specular = pow(eDotR, u_Shininess);
            }
            vec3 diffuse = matColor.rgb * nDotL;
            v_Color = vec4(diffuse + ambient + specular * u_LightColor,
            matColor.a);
        }
    `;

    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE_FLAT_SHADING = `
        //
        //  ### Fragment shader program for flat shading
        //
        //  This shader is identical to "shader-fsG".

        #ifdef GL_ES
        precision mediump float;
        #endif

        //  v_Color = Interpolated fragment color

        varying vec4 v_Color;

        void main() {
            gl_FragColor = v_Color;
        }
    `;


    // Vertex shader program
    // language=GLSL
    VSHADER_SOURCE_WIRE_SHADING = `
        //
        //  *** Vertex shader program (GLSL code) for wireframe mesh
        //

        //  a_Position = vertex position in world coordinates
        //  a_Normal = vertex normal vector in world coordinates
        //  a_BaryCoords = vertex barycentric coordinates

        attribute vec3 a_Position;
        attribute vec3 a_Normal;
        attribute vec3 a_BaryCoords;

        //  u_MvMatrix = Modelview matrix
        //  u_MvpMatrix = Modelview-projection matrix
        //  u_NormalMatrix = Inverse transpose of modelview matrix

        uniform mat4 u_MvMatrix;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_NormalMatrix;

        //  u_FrontColor = material front face color
        //  u_BackColor = material back face color
        //  u_Perspective = Perspective vs orthogonal projection option

        uniform vec4 u_FrontColor;
        uniform vec4 u_BackColor;
        uniform bool u_Perspective;

        //  v_BaryCoords = Vertex barycentric coordinates
        //  v_Color = Vertex color

        varying vec3 v_BaryCoords;
        varying vec4 v_Color;

        void main(void) {

            //  gl_Position = vertex position in clip coordinates
            //  v_BaryCoords = vertex barycentric coordinates

            gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
            v_BaryCoords = a_BaryCoords;

            //  vPosition = vertex position in eye coordinates
            //  vNormal = vertex normal in eye coordinates

            vec3 vPosition = vec3(u_MvMatrix * vec4(a_Position, 1.0));
            vec3 vNormal = vec3(u_NormalMatrix * vec4(a_Normal, 0.0));

            //  Determine whether the vertex lies on a front or back face, and
            //  choose the line color accordingly

            v_Color = u_FrontColor;
            vec3 viewDirection;
            if (u_Perspective) {
                viewDirection = -vPosition;
            } else {
                viewDirection = vec3(0.0, 0.0, 1.0);
            }
            if (dot(vNormal, viewDirection) <= 0.0) {
                v_Color = u_BackColor;
            }
        }
    `


    // Fragment shader program
    // language=GLSL
    FSHADER_SOURCE_WIRE_SHADING = `
        //
        //  ### Fragment shader program for wireframe mesh
        //
        #ifdef GL_ES
        precision mediump float;
        #endif

        //  v_BaryCoords = Interpolated fragment barycentric coordinates
        //  v_Color = Interpolated fragment color

        varying vec3 v_BaryCoords;
        varying vec4 v_Color;

        void main() {

            //  The smallest barycentric coordinate is the minimum relative distance to
            //  an edge (relative to the distance from the opposite vertex to the line
            //  containing the edge)

            if (any(lessThan(v_BaryCoords, vec3(0.02)))) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                gl_FragColor = v_Color;
            }
        }
    `;


    //  Buffer objects created by handleLoadedModel and used by draw:

    buffers: any = {};

    modelLoaded = false;     // True iff the model has been loaded

    //  Camera, light, and model orientations (angle/axis pairs):
    orient_camera = new Orientation(0.0, [1.0, 0.0, 0.0]);
    orient_light = new Orientation(0.0, [1.0, 0.0, 0.0]);
    orient_model = new Orientation(0.0, [1.0, 0.0, 0.0]);

    //  Phong's illumination model:
    imodel = {
        frontColor: [0.5, 0.0, 0.0, 1.0],
        backColor: [0.0, 0.0, 0.5, 1.0],
        ambientLight: [0.4, 0.4, 0.4],
        lightColor: [1.0, 1.0, 1.0],
        shininess: 32
    };

    //  Miscellaneous options:
    opt = {
        perspective: true,       // Perspective vs orthographic projection
        vsf: 1.0                 // Scale factor for zoom
    };

    gl ?: iWebGlWithAdditionalAttributes;

    componentDidMount() {
        //  This function is invoked by the onLoad event of the web page.
        //  Retrieve <canvas> element.
        const canvas = document.getElementById("webgl");

        //  Get the rendering context for WebGL.
        this.gl = getWebGLContext<{
            bbox: any
        }>("webgl", [
            {
                vertexShader: this.VSHADER_SOURCE_FLAT_SHADING,
                fragmentShader: this.FSHADER_SOURCE_FLAT_SHADING,
                name: 'prgF'
            },{
                vertexShader: this.VSHADER_SOURCE_GOURAUD_SHADING,
                fragmentShader: this.FSHADER_SOURCE_GOURAUD_SHADING,
                name: 'prgG'
            },{
                vertexShader: this.VSHADER_SOURCE_PHONG_SHADING,
                fragmentShader: this.FSHADER_SOURCE_PHONG_SHADING,
                name: 'prgP'
            },{
                vertexShader: this.VSHADER_SOURCE_WIRE_SHADING,
                fragmentShader: this.FSHADER_SOURCE_WIRE_SHADING,
                name: 'prgW'
            },
        ] as Array<iProgramArgs>);


        if (!this.gl) {

            console.log("Failed to get the rendering context for WebGL");

            return;

        }

        //  Retrieve storage locations of attributes and uniform variables.
        this.getLocations();

        //  Set the background color, and enable depth testing.
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.enable(this.gl.DEPTH_TEST);

        //  Prompt for a file name.
        const fname = prompt("Specify a path to a json file:  " +
            "bunny, cone, cube, e37, or elephant",
            'cube');

        //  Load a model from the web server using AJAX + JSON.
        //  This function registers a callback and returns immediately.
        //  The callback (handleLoadedModel), if successful, will initiate drawing.

        this.loadModel(fname);

        //  Register event handlers for keypresses and mouse events.
        document.onkeydown = (ev) => {
            this.keydown(ev);
        };

        this.initMouseEvents(canvas);


    }


    /******************************************************************************/
    computeBB = (vertices, bbox) => {

//  Compute axis-aligned bounding box parameters [xmin,xmax] X [ymin,ymax],
//  radius r, and center c = (xc,yc,zc).

        let dx, dy, dz, r, x, xc, xmax, xmin, y, yc, ymax, ymin, z, zc, zmax, zmin;

        xmin = vertices[0];
        xmax = xmin;
        ymin = vertices[1];
        ymax = ymin;
        zmin = vertices[2];
        zmax = zmin;

        for (let i = 1; i < vertices.length / 3; i++) {
            x = vertices[3 * i];
            y = vertices[3 * i + 1];
            z = vertices[3 * i + 2];
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
            if (z < zmin) zmin = z;
            if (z > zmax) zmax = z;
        }

        xc = (xmin + xmax) / 2.0;
        yc = (ymin + ymax) / 2.0;
        zc = (zmin + zmax) / 2.0;

        dx = xmax - xmin;
        dy = ymax - ymin;
        dz = zmax - zmin;
        r = Math.sqrt(dx * dx + dy * dy + dz * dz) / 2.0;

//  Store bbox properties.

        bbox.xmin = xmin;
        bbox.xmax = xmax;
        bbox.ymin = ymin;
        bbox.ymax = ymax;
        bbox.xc = xc;
        bbox.yc = yc;
        bbox.zc = zc;
        bbox.r = r;
    }


    /******************************************************************************/
    constructNormals = (vertices, indices) => {

        const vnormals = new Float32Array(vertices.length);
        let a, b, i1, i2, i3, tn, vn, x1, x2, x3, y1, y2, y3, z1, z2, z3;

        for (var i = 0; i < indices.length / 3; i++) {
            i1 = indices[3 * i];
            i2 = indices[3 * i + 1];
            i3 = indices[3 * i + 2];

            x1 = vertices[3 * i1];
            y1 = vertices[3 * i1 + 1];
            z1 = vertices[3 * i1 + 2];

            x2 = vertices[3 * i2];
            y2 = vertices[3 * i2 + 1];
            z2 = vertices[3 * i2 + 2];

            x3 = vertices[3 * i3];
            y3 = vertices[3 * i3 + 1];
            z3 = vertices[3 * i3 + 2];

            a = [x2 - x1, y2 - y1, z2 - z1];
            b = [x3 - x1, y3 - y1, z3 - z1];
            tn = [a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]];

//  Normalize tn to a unit vector.

            vn = Math.sqrt(tn[0] * tn[0] + tn[1] * tn[1] + tn[2] * tn[2]);
            if (vn) {
                tn[0] /= vn;
                tn[1] /= vn;
                tn[2] /= vn;
            }

//  Add the triangle normal tn to the three vertices.

            vnormals[3 * i1] += tn[0];
            vnormals[3 * i1 + 1] += tn[1];
            vnormals[3 * i1 + 2] += tn[2];

            vnormals[3 * i2] += tn[0];
            vnormals[3 * i2 + 1] += tn[1];
            vnormals[3 * i2 + 2] += tn[2];

            vnormals[3 * i3] += tn[0];
            vnormals[3 * i3 + 1] += tn[1];
            vnormals[3 * i3 + 2] += tn[2];
        }

//  Normalize the vertex normals.

        for (i = 0; i < vnormals.length / 3; i++) {
            x1 = vnormals[3 * i];
            y1 = vnormals[3 * i + 1];
            z1 = vnormals[3 * i + 2];
            vn = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
            if (vn) {
                vnormals[3 * i] /= vn;
                vnormals[3 * i + 1] /= vn;
                vnormals[3 * i + 2] /= vn;
            }
        }

        return vnormals;
    }


    /******************************************************************************/
    createArrayBuffer = (gl, data, num, type) => {

//  Create a buffer object, bind it to the target, and copy data.

        const buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

//  Store information required by the attribute variable.

        buffer.num = num;
        buffer.type = type;

        return buffer;
    }

    getProgramByName = (name: string): iProgramMultipleShaders => {

        const v = this.gl?.programs?.find((v: any) => v.name === name)?.value;

        if (undefined === v) {
            throw 'Failed to find program ' + name;
        }

        return v;

    };

    documentGetInputElementCheckedById = (id: string): boolean => {

        const element: HTMLInputElement | null = document.getElementById(id) as HTMLInputElement;

        if (null === element) {
            throw 'Could not find input element ' + id;
        }

        return element.checked;

    };

    /******************************************************************************/
    draw = () => {

        if (undefined === this.gl) {
            console.log('Failed to load gl context during draw');
            return;
        }

        if (undefined === this.gl.attributes) {
            console.log('Failed to load gl attributes during draw');
            return;
        }

        if (!this.modelLoaded) {
            console.log('Failed to load model');
            return;
        }

        //  Resize the canvas if necessary, and clear the buffers.
        this.resize(this.gl);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //  Get the shading method (program) from the radio button.
        let prg: iProgramMultipleShaders | undefined;
        let prgName: string | undefined;

        if (this.documentGetInputElementCheckedById("phong")) {

            prg = this.getProgramByName(prgName = "prgP");

        } else if (this.documentGetInputElementCheckedById("gouraud")) {

            prg = this.getProgramByName(prgName = "prgG");

        } else if (this.documentGetInputElementCheckedById("flat")) {

            prg = this.getProgramByName(prgName = "prgF");

        } else {

            prg = this.getProgramByName(prgName = "prgW");

        }

        if (undefined === prg) {

            throw 'Failed to find registered webgl shader program';

        }

        this.gl.useProgram(prg);

        //  Construct the projection matrix, and set the value of u_Perspective.
        const projMatrix = new Matrix4(undefined);

        const r = this.gl.attributes?.bbox?.r;

        const vsf = this.opt.vsf;

        if (this.opt.perspective) {
            projMatrix.setFrustum(-vsf * r, vsf * r, -vsf * r, vsf * r, 2.0 * r, 4.0 * r);
        } else {
            projMatrix.setOrtho(-vsf * r, vsf * r, -vsf * r, vsf * r, 2.0 * r, 4.0 * r);
        }

        this.gl.uniform1f(prg?.attributes?.u_Perspective || null, this.opt.perspective ? 1 : 0);

        //  Construct the modelview matrix, and set the value of the uniform variable.
        const mvMatrix = new Matrix4();

        mvMatrix.setRotate(this.orient_camera.angle, this.orient_camera.axis[0],
            this.orient_camera.axis[1], this.orient_camera.axis[2]);

        mvMatrix.translate(0.0, 0.0, -3.0 * r);

        mvMatrix.rotate(this.orient_model.angle, this.orient_model.axis[0],
            this.orient_model.axis[1], this.orient_model.axis[2]);

        mvMatrix.translate(
            -this.gl.attributes.bbox.xc,
            -this.gl.attributes.bbox.yc,
            -this.gl.attributes.bbox.zc);

        this.gl.uniformMatrix4fv(prg?.attributes?.u_MvMatrix || null, false, mvMatrix.elements);

        //  Construct the modelview-projection matrix and pass it to u_MvpMatrix.
        const mvpMatrix = new Matrix4();

        mvpMatrix.set(projMatrix);

        mvpMatrix.multiply(mvMatrix);

        this.gl.uniformMatrix4fv(prg?.attributes?.u_MvpMatrix || null, false, mvpMatrix.elements);

        //  Construct the inverse transpose of mvMatrix, and set the uniform variable.
        const normalMatrix = new Matrix4();

        normalMatrix.setInverseOf(mvMatrix);

        normalMatrix.transpose();

        this.gl.uniformMatrix4fv(prg?.attributes?.u_NormalMatrix || null, false, normalMatrix.elements);

        //  Set the uniform variables defining the illumination model.

        this.gl.uniform4f(prg?.attributes?.u_FrontColor || null, this.imodel.frontColor[0], this.imodel.frontColor[1],
            this.imodel.frontColor[2], this.imodel.frontColor[3]);

        this.gl.uniform4f(prg?.attributes?.u_BackColor || null, this.imodel.backColor[0], this.imodel.backColor[1],
            this.imodel.backColor[2], this.imodel.backColor[3]);

        if (prgName !== "prgW") {

            //  Set the light direction (surface to point source in eye coordinates)
            //  to [0, 0, 1] rotated by orient_Light.
            let v = new Vector3(new Float32Array([0.0, 0.0, 1.0]));

            const lightMatrix = new Matrix4();

            lightMatrix.setRotate(this.orient_light.angle, this.orient_light.axis[0],
                this.orient_light.axis[1], this.orient_light.axis[2]);

            v = lightMatrix.multiplyVector3(v);

            this.gl.uniform3f(prg?.attributes?.u_LightDirection || null, v.elements[0], v.elements[1],
                v.elements[2]);

            this.gl.uniform3f(prg?.attributes?.u_AmbientLight || null, this.imodel.ambientLight[0],
                this.imodel.ambientLight[1], this.imodel.ambientLight[2]);

            this.gl.uniform3f(prg?.attributes?.u_LightColor || null, this.imodel.lightColor[0],
                this.imodel.lightColor[1], this.imodel.lightColor[2]);

            this.gl.uniform1f(prg?.attributes?.u_Shininess || null, this.imodel.shininess);
        }

        //  Assign the buffer objects and enable the assignments.
        this.initAttributeVariable(this.gl, prg?.attributes?.a_Position, this.buffers.vertexBuffer);

        if (prgName === "prgG" || prgName === "prgP") {

            this.initAttributeVariable(this.gl, prg?.attributes?.a_Normal, this.buffers.vnormalBuffer);

        } else {

            this.initAttributeVariable(this.gl, prg?.attributes?.a_Normal, this.buffers.tnormalBuffer);

        }

        if (prgName === "prgW") {

            this.initAttributeVariable(this.gl, prg?.attributes?.a_BaryCoords, this.buffers.bcoordsBuffer);

        }

        //  Render the model.
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffers.nvert);

    }


    /******************************************************************************/
    expandArrays = (vertices, indices, vnormals, modelObj) => {
        //  Reorder and expand the model vertex array to include three vertices per
        //  triangle by replicating shared vertex positions.  Each vertex consists
        //  of an ordered triple of contiguously stored components, and each triangle
        //  is an ordered sequence of three vertices with contiguously stored indices.
        //  On return the three vertices of each triangle are stored contiguously in
        //  modelObj.vertices and indices is no longer needed.  Also, the vertex
        //  normal vectors are replicated and returned in modelObj.vnormals, and the
        //  barycentric coordinates of the vertices are returned in modelObj.bcoords.

        let i1, i2, i3;
        const nt3 = indices.length;
        const verticesE = new Float32Array(3 * nt3);
        const vnormalsE = new Float32Array(3 * nt3);
        const bcoords = new Float32Array(3 * nt3);
        //let indi = 0;
        let indv = 0;
        for (let i = 0; i < nt3 / 3; i++) {
            i1 = indices[3 * i];
            i2 = indices[3 * i + 1];
            i3 = indices[3 * i + 2];
            verticesE[indv] = vertices[3 * i1];
            verticesE[indv + 1] = vertices[3 * i1 + 1];
            verticesE[indv + 2] = vertices[3 * i1 + 2];
            verticesE[indv + 3] = vertices[3 * i2];
            verticesE[indv + 4] = vertices[3 * i2 + 1];
            verticesE[indv + 5] = vertices[3 * i2 + 2];
            verticesE[indv + 6] = vertices[3 * i3];
            verticesE[indv + 7] = vertices[3 * i3 + 1];
            verticesE[indv + 8] = vertices[3 * i3 + 2];

            vnormalsE[indv] = vnormals[3 * i1];
            vnormalsE[indv + 1] = vnormals[3 * i1 + 1];
            vnormalsE[indv + 2] = vnormals[3 * i1 + 2];
            vnormalsE[indv + 3] = vnormals[3 * i2];
            vnormalsE[indv + 4] = vnormals[3 * i2 + 1];
            vnormalsE[indv + 5] = vnormals[3 * i2 + 2];
            vnormalsE[indv + 6] = vnormals[3 * i3];
            vnormalsE[indv + 7] = vnormals[3 * i3 + 1];
            vnormalsE[indv + 8] = vnormals[3 * i3 + 2];

            bcoords[indv] = 1.0;
            bcoords[indv + 1] = 0.0;
            bcoords[indv + 2] = 0.0;
            bcoords[indv + 3] = 0.0;
            bcoords[indv + 4] = 1.0;
            bcoords[indv + 5] = 0.0;
            bcoords[indv + 6] = 0.0;
            bcoords[indv + 7] = 0.0;
            bcoords[indv + 8] = 1.0;

            indv += 9;
            //indi += 3;
        }
        modelObj.vertices = verticesE;
        modelObj.vnormals = vnormalsE;
        modelObj.bcoords = bcoords;
    }

    private getLocationsUsingProgram = (name: string) => {

        const prg: iProgramMultipleShaders = this.getProgramByName(name)

        if (undefined === prg.attributes) {

            prg.attributes = {};

        }

        if (undefined === this.gl) {
            throw 'Failed to lookup gl context for program locations';
        }

        prg.attributes.a_Position = this.gl.getAttribLocation(prg, 'a_Position');
        prg.attributes.a_Normal = this.gl.getAttribLocation(prg, 'a_Normal');
        prg.attributes.u_BackColor = this.gl.getUniformLocation(prg, 'u_BackColor');
        prg.attributes.u_FrontColor = this.gl.getUniformLocation(prg, 'u_FrontColor');
        prg.attributes.u_MvMatrix = this.gl.getUniformLocation(prg, 'u_MvMatrix');
        prg.attributes.u_MvpMatrix = this.gl.getUniformLocation(prg, 'u_MvpMatrix');
        prg.attributes.u_NormalMatrix = this.gl.getUniformLocation(prg, 'u_NormalMatrix');
        prg.attributes.u_Perspective = this.gl.getUniformLocation(prg, 'u_Perspective');

        if (name !== "prgW") {

            prg.attributes.u_AmbientLight = this.gl.getUniformLocation(prg, 'u_AmbientLight');
            prg.attributes.u_LightColor = this.gl.getUniformLocation(prg, 'u_LightColor');
            prg.attributes.u_LightDirection = this.gl.getUniformLocation(prg, 'u_LightDirection');
            prg.attributes.u_Shininess = this.gl.getUniformLocation(prg, 'u_Shininess');

            if (!prg.attributes.u_Shininess
                || !prg.attributes.u_LightColor
                || !prg.attributes.u_LightDirection
                || !prg.attributes.u_AmbientLight) {
                throw 'Failed to get the storage location of attribute or uniform variable (lighting variables)'
            }

        } else {

            prg.attributes.a_BaryCoords = this.gl.getAttribLocation(prg, 'a_BaryCoords');

            if (!prg.attributes.a_BaryCoords) {
                throw 'Failed to get the storage location of a_BaryCoords'

            }

        }

        if (undefined === prg?.attributes?.a_Position
            || prg?.attributes?.a_Position < 0
            || prg?.attributes?.a_Normal < 0
            || !prg.attributes.u_BackColor
            || !prg.attributes.u_FrontColor
            || !prg.attributes.u_MvMatrix
            || !prg.attributes.u_MvpMatrix
            || !prg.attributes.u_NormalMatrix
            || !prg.attributes.u_Perspective) {

            throw 'Failed to get the storage location of attribute or uniform variable'

        }

    }

    /******************************************************************************/
    getLocations = (): void => {
        //  This function retrieves the storage locations of vertex attributes and
        //  uniform variables in the shaders associated with the programs.
        this.getLocationsUsingProgram("prgF");
        this.getLocationsUsingProgram("prgG");
        this.getLocationsUsingProgram("prgP");
        this.getLocationsUsingProgram("prgW");
    }


    /******************************************************************************/
    handleLoadedModel = (payload) => {


        if (undefined == this.gl) {
            throw 'this.gl is undefined!!';
        }

        //  Create the typed arrays and buffers associated with model geometry:
        //  vertices, vertex normals, and triangle indices.

        this.modelLoaded = true;

        let vertices = new Float32Array(payload.vertices);
        const indices = new Uint32Array(payload.indices);
        let vnormals = this.constructNormals(vertices, indices);

        //  Create bounding box object bbox.
        this.gl.attributes.bbox = {};

        this.computeBB(vertices, this.gl.attributes.bbox);

        //  Reorder the vertex array and expand it by replicating vertices if
        //  necessary so that it contains three distinct vertices for each triangle,
        //  and they are stored contiguously for use by gl.drawArrays.  This is
        //  necessary for flat shading which needs triangle normals and for a
        //  wireframe mesh which needs barycentric coordinates.  It also avoids
        //  the problem of treating large models in the context of webgl which
        //  limits vertex indices to 16 bits.

        const modelObj: any = {};

        this.expandArrays(vertices, indices, vnormals, modelObj);

        vertices = modelObj.vertices;

        vnormals = modelObj.vnormals;

        const bcoords = modelObj.bcoords;

        //  Compute an array tnormals of vertex normal vectors that coincide with
        //  the triangle normal vectors.  This is required for flat shading.
        const tnormals = new Float32Array(vnormals.length);

        let a, b, tn, vn, x1, x2, x3, y1, y2, y3, z1, z2, z3;

        for (let i = 0; i < tnormals.length; i += 9) {
            x1 = vertices[i];
            y1 = vertices[i + 1];
            z1 = vertices[i + 2];
            x2 = vertices[i + 3];
            y2 = vertices[i + 4];
            z2 = vertices[i + 5];
            x3 = vertices[i + 6];
            y3 = vertices[i + 7];
            z3 = vertices[i + 8];

            a = [x2 - x1, y2 - y1, z2 - z1];
            b = [x3 - x1, y3 - y1, z3 - z1];
            tn = [a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]];

            //  Normalize tn to a unit vector.

            vn = Math.sqrt(tn[0] * tn[0] + tn[1] * tn[1] + tn[2] * tn[2]);
            if (vn) {
                tn[0] /= vn;
                tn[1] /= vn;
                tn[2] /= vn;
            }

            //  Store the triangle normal as the three vertex normals.

            tnormals[i] = tn[0];
            tnormals[i + 1] = tn[1];
            tnormals[i + 2] = tn[2];
            tnormals[i + 3] = tn[0];
            tnormals[i + 4] = tn[1];
            tnormals[i + 5] = tn[2];
            tnormals[i + 6] = tn[0];
            tnormals[i + 7] = tn[1];
            tnormals[i + 8] = tn[2];
        }

        //  Create the buffer objects and copy the data
        this.buffers.vertexBuffer = this.createArrayBuffer(this.gl, vertices, 3, this.gl.FLOAT);

        if (!this.buffers.vertexBuffer) {
            console.log('Failed to create vertex buffer');
            return;
        }

        this.buffers.vnormalBuffer = this.createArrayBuffer(this.gl, vnormals, 3, this.gl.FLOAT);

        if (!this.buffers.vnormalBuffer) {
            console.log('Failed to create vertex normal buffer');
            return;
        }

        this.buffers.tnormalBuffer = this.createArrayBuffer(this.gl, tnormals, 3, this.gl.FLOAT);

        if (!this.buffers.tnormalBuffer) {
            console.log('Failed to create triangle normal buffer');
            return;
        }

        this.buffers.bcoordsBuffer = this.createArrayBuffer(this.gl, bcoords, 3, this.gl.FLOAT);

        if (!this.buffers.bcoordsBuffer) {
            console.log('Failed to create barycentric coordinates buffer');
            return;
        }

        //  Store number of vertices for use by draw in gl.drawArrays.

        this.buffers.nvert = vertices.length / 3;


        //  Unbind the buffers from the targets
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        //  Call draw.
        this.draw();
    }


    /******************************************************************************/
    initAttributeVariable = (gl, a_Attribute, buffer) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_Attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_Attribute);
    }


    /******************************************************************************/
    initMouseEvents = (canvas) => {

        //  Register event handlers for mouse button press, mouse motion, and
        //  mouse button release.

        //  dragging = true iff a mouse button has been pressed with the mouse
        //  position in the canvas.
        //
        //  (xs,ys) = starting mouse position in a drag operation.

        let dragging = false;
        let xs = -1, ys = -1;

        canvas.onmousedown = function (event) {
            const x = event.clientX, y = event.clientY;
            const rect = event.target.getBoundingClientRect();
            if (rect.left <= x && x <= rect.right &&
                rect.top <= y && y <= rect.bottom) {
                xs = x;
                ys = y;
                dragging = true;
            }
        };

        canvas.onmouseup = () => {
            dragging = false;
        };

        canvas.onmousemove = (event) => {
            let ad2, cd, sd;

            let q: any = [];

            const r: any = [];

            const x = event.clientX, y = event.clientY;

            if (dragging) {

                //  Rotations are one degree per pixel.
                const sf = Math.PI / 180.0;

                const dx = sf * (x - xs);

                const dy = sf * (y - ys);

                if (Math.abs(dx) <= Math.abs(dy)) {

                    //  Rotate the model about the x axis by dy degrees.

                    ad2 = dy / 2.0;
                    cd = Math.cos(ad2);
                    sd = Math.sin(ad2);
                    q = this.orient_model.toQuaternion();

                    //  Compute r = p*q, where p is the unit quaternion equivalent of
                    //  angle dy and axis [1, 0, 0].

                    r[0] = cd * q[0] - sd * q[1];
                    r[1] = cd * q[1] + sd * q[0];
                    r[2] = cd * q[2] - sd * q[3];
                    r[3] = cd * q[3] + sd * q[2];

                    this.orient_model.fromQuaternion(r);

                } else {

                    //  Rotate the model about the y axis by dx degrees.

                    ad2 = dx / 2.0;
                    cd = Math.cos(ad2);
                    sd = Math.sin(ad2);
                    q = this.orient_model.toQuaternion();

                    //  Compute r = p*q, where p is the unit quaternion equivalent of
                    //  angle dx and axis [0, 1, 0].

                    r[0] = cd * q[0] - sd * q[2];
                    r[1] = cd * q[1] + sd * q[3];
                    r[2] = cd * q[2] + sd * q[0];
                    r[3] = cd * q[3] - sd * q[1];
                    this.orient_model.fromQuaternion(r);
                }

                //  Draw the image.

                this.draw();
            }
            xs = x;
            ys = y;
        };
    }


    /******************************************************************************/
    keydown = (event: KeyboardEvent) => {

        let ad2, cd, cfac, code, mstep, sd, xstep, ystep, zstep;
        let q: any = [];
        const r: any = [];

        cfac = Math.PI / 180.0;  // Degrees to radians conversion factor
        mstep = 3.0 * cfac;      // Increment for light and model rotation angle
        xstep = 0.15 * cfac;     // Increment for pitch
        ystep = 0.15 * cfac;     // Increment for yaw (heading)
        zstep = 5.0 * cfac;      // Increment for roll

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
                q = this.orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle mstep or 5*mstep and axis [0, 1, 0].

                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];
                this.orient_model.fromQuaternion(r);
                break;

            case 38:                  // Up arrow:  x axis, increase
                ad2 = mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_model.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle mstep or 5*mstep and axis [1, 0, 0].

                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_model.fromQuaternion(r);
                break;

            case 39:                  // Right arrow:  y axis, decrease
                ad2 = -mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle -mstep or -5*mstep and axis [0, 1, 0].

                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];
                this.orient_model.fromQuaternion(r);
                break;

            case 40:                  // Down arrow:  x axis, decrease
                ad2 = -mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = 5.0 * ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_model.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle -mstep or -5*mstep and axis [1, 0, 0].

                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_model.fromQuaternion(r);
                break;

            case 69:                  // e:  Scale shininess exponent
                if (event.shiftKey) {
                    this.imodel.shininess *= 2.0;
                } else {
                    this.imodel.shininess *= 0.5;
                }
                break;

            case 73:                  // i:  Rotate light source about x
                ad2 = mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = -ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_light.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle mstep or -mstep and axis [1, 0, 0].

                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_light.fromQuaternion(r);
                break;

            case 74:                  // j:  Rotate light source about y
                ad2 = mstep / 2.0;
                if (event.shiftKey) {
                    ad2 = -ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_light.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle mstep or -mstep and axis [0, 1, 0].

                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];
                this.orient_light.fromQuaternion(r);
                break;

            case 80:                  // p:  Toggle projection type
                this.opt.perspective = !this.opt.perspective;
                break;

            case 82:                  // r:  Restore defaults
                this.orient_camera.angle = 0.0;
                this.orient_camera.axis = [1.0, 0.0, 0.0];
                this.orient_light.angle = 0.0;
                this.orient_light.axis = [1.0, 0.0, 0.0];
                this.orient_model.angle = 0.0;
                this.orient_model.axis = [1.0, 0.0, 0.0];
                this.opt.perspective = true;
                this.imodel.shininess = 32.0;
                this.opt.vsf = 1.0;
                break;

            case 88:                  // x:  Change pitch
                ad2 = xstep / 2.0;
                if (event.shiftKey) {
                    ad2 = -ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_camera.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle xstep or -xstep and axis [1, 0, 0].

                r[0] = cd * q[0] - sd * q[1];
                r[1] = cd * q[1] + sd * q[0];
                r[2] = cd * q[2] - sd * q[3];
                r[3] = cd * q[3] + sd * q[2];
                this.orient_camera.fromQuaternion(r);
                break;

            case 89:                  // y:  Change yaw (heading)
                ad2 = ystep / 2.0;
                if (event.shiftKey) {
                    ad2 = -ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_camera.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle ystep or -ystep and axis [0, 1, 0].

                r[0] = cd * q[0] - sd * q[2];
                r[1] = cd * q[1] + sd * q[3];
                r[2] = cd * q[2] + sd * q[0];
                r[3] = cd * q[3] - sd * q[1];
                this.orient_camera.fromQuaternion(r);
                break;

            case 90:                  // z:  Change roll
                ad2 = zstep / 2.0;
                if (event.shiftKey) {
                    ad2 = -ad2;
                }
                cd = Math.cos(ad2);
                sd = Math.sin(ad2);
                q = this.orient_camera.toQuaternion();

                //  Compute r = p*q, where p is the unit quaternion equivalent of
                //  angle zstep or -zstep and axis [0, 0, 1].

                r[0] = cd * q[0] - sd * q[3];
                r[1] = cd * q[1] - sd * q[2];
                r[2] = cd * q[2] + sd * q[1];
                r[3] = cd * q[3] + sd * q[0];
                this.orient_camera.fromQuaternion(r);
                break;

            case 188:                 // <:  Zoom out
                this.opt.vsf *= 0.8;
                break;

            case 190:                 // >:  Zoom in
                this.opt.vsf *= 1.2;
                break;

            default:
                return;
        }
        this.draw();
    }


    /******************************************************************************/
    loadModel = (filename) => {

        // Create an AJAX request to load a model asynchronously.
        // bunny, cone, cube, e37, or elephant
        switch (filename) {

            case "bunny":
                this.handleLoadedModel(bunny);
                break;
            case "cone":
                this.handleLoadedModel(cone);
                break;
            case "cube":
                this.handleLoadedModel(cube);
                break;
            case "e37":
                this.handleLoadedModel(e37);
                break;
            case "elephant":
                this.handleLoadedModel(elephant);
                break;
        }


    }


    /******************************************************************************/
    resize = (gl) => {

        // Get the canvas from the WebGL context.

        const canvas = gl.canvas;

        // Lookup the size the browser is displaying the canvas.

        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.

        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size.

            canvas.width = displayWidth;
            canvas.height = displayHeight;

            // Set the viewport to match.

            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }


    render() {

        return <div>
            <canvas id={"webgl"} width={window.innerWidth} height={window.innerHeight}/>

            <p> Shading method:</p>
            <form>
                <input type="radio" name="shading" id="phong"
                       value="Phong" checked/> Phong shading<br/>
                <input type="radio" name="shading" id="gouraud"
                       value="Gouraud"/> Gouraud shading<br/>
                <input type="radio" name="shading" id="flat"
                       value="Flat"/> Flat shading<br/>
                <input type="radio" name="shading" id="wireframe"
                       value="Wireframe"/> Wireframe mesh
            </form>
            <br/>
            <p>Keypress Options</p>
            <table>
                <tbody>
                <tr>
                    <th>Key</th>
                    <th>Function</th>
                </tr>
                <tr>
                    <td>Left Arrow</td>
                    <td>Rotate model left about y axis (fast)</td>
                </tr>
                <tr>
                    <td>Right Arrow</td>
                    <td>Rotate model right about y axis (fast)</td>
                </tr>
                <tr>
                    <td>Up Arrow</td>
                    <td>Rotate model up about x axis (fast)</td>
                </tr>
                <tr>
                    <td>Down Arrow</td>
                    <td>Rotate model down about x axis (fast)</td>
                </tr>
                <tr>
                    <td>e</td>
                    <td>Halve (double) shininess exponent</td>
                </tr>
                <tr>
                    <td>i</td>
                    <td>Rotate light source down (up) about x axis</td>
                </tr>
                <tr>
                    <td>j</td>
                    <td>Rotate light source right (left) about y axis</td>
                </tr>
                <tr>
                    <td>p</td>
                    <td>Toggle perspective/orthographic projection</td>
                </tr>
                <tr>
                    <td>r</td>
                    <td>Restore defaults</td>
                </tr>
                <tr>
                    <td>x</td>
                    <td>Rotate camera up (down) about x axis</td>
                </tr>
                <tr>
                    <td>y</td>
                    <td>Rotate camera left (right) about y axis</td>
                </tr>
                <tr>
                    <td>z</td>
                    <td>Rotate camera CCW (clockwise) about z axis</td>
                </tr>
                <tr>
                    <td>
                        {"<"}
                    </td>
                    <td>Zoom in</td>
                </tr>
                <tr>
                    <td>{">"}</td>
                    <td>Zoom out</td>
                </tr>
                </tbody>
            </table>
            <p>Options in parentheses are selected with the Shift key.</p>
            <br/>
            <input type="text" value="Keyboard"/>
        </div>
    }

}

