// cuon-utils.jsx (c) 2012 kanda and matsuda

import {WebglUtils} from "./webgl-utils"



/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
export function createProgram(gl : WebGLRenderingContext, vshader : string, fshader : string) : WebGLProgram  {

    // Create shader object
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);

    if (!vertexShader) {
        throw 'Could not load vertex shader!'
    }

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

    if (!fragmentShader) {
        throw 'Could not load fragment shader!'
    }

    // Create a program object
    const program: WebGLProgram | null = gl.createProgram();

    if (!program) {

        throw 'Failed to create webgl program!'

    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);

    gl.attachShader(program, fragmentShader);

    // Link the program object
    gl.linkProgram(program);

    // Check the result of linking
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!linked) {

        const error = gl.getProgramInfoLog(program);

        console.log('Failed to link program: ' + error);

        gl.deleteProgram(program);

        gl.deleteShader(fragmentShader);

        gl.deleteShader(vertexShader);

        throw 'Failed to link program: ' + error;

    }

    return program;

}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
export function loadShader(gl : WebGLRenderingContext, type : number, source) {

    // Create shader object
    const shader = gl.createShader(type);

    if (shader == null) {

        const message = 'unable to create shader';

        console.error(message);

        throw message

    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {

        const error = gl.getShaderInfoLog(shader);

        console.log('Failed to compile shader: ' + error);

        gl.deleteShader(shader);

        return null;

    }

    return shader;

}


export interface iWebGLRenderingContext extends WebGLRenderingContext {
    canvas: HTMLCanvasElement,  // this override is helpful for ts
    program: WebGLProgram
}

/**
 * Initialize and get the rendering for WebGL
 * @param canvasId <string> element
 * @param vshader <string> a vertex shader program (string)
 * @param fshader <string> a fragment shader program (string)
 * @return the rendering context for WebGL
 */
export function getWebGLContext(canvasId : string, vshader : string, fshader : string) : iWebGLRenderingContext {

    const canvas : HTMLCanvasElement | null = document.getElementById(canvasId) as HTMLCanvasElement;

    if (null === canvas) {

        throw 'Failed to find the canvas element on the page!'

    }

    // Get the rendering context for WebGL
    const gl : iWebGLRenderingContext = WebglUtils.setupWebGL(canvas, undefined, undefined) as iWebGLRenderingContext;

    if (!gl) {

        throw 'Parameter is not a number!';

    }

    const program = createProgram(gl, vshader, fshader);

    if (!program) {

        throw 'Failed to create program';

    }

    gl.useProgram(program);

    gl.program = program;

    return gl;

}

