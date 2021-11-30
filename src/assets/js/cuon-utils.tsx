// cuon-utils.tsx (mit) 2021 richardtmiles
// @ref cuon-utils.js - 2012 kanda and matsuda

import {WebglUtils} from "./webgl-utils"


/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shad
 * er program (string)
 * @param fshader a fragment shader program (string)
 * @param name a generic attribute keyable with the .find() method
 * @return created program object, or null if the creation has failed
 */
export function createProgram<AdditionalAttributesType = {}, iWebGLProgramType = iWebGLProgram>
(gl: iWebGLRenderingContext<any, iWebGLProgramType>, vshader: string, fshader: string, name: string = "default")
    : iWebGLRenderingContextProgram<AdditionalAttributesType, iWebGLProgramType> {

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
    const program: iWebGLProgramType | null = gl.createProgram() as iWebGLProgramType;

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

    const iProgram = {
        name: name,
        value: program
    };

    gl.useProgram(program);

    gl.program = iProgram;

    if (undefined === gl.programs) {

        gl.programs = [];

    }

    gl.programs.push(iProgram);

    return iProgram;

}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
export function loadShader(gl: WebGLRenderingContext, type: number, source) {

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


export interface iWebGLProgram<iWebGLProgramAdditionalAttributesType = any>
    extends WebGLProgram {
    attributes?: iWebGLProgramAdditionalAttributesType
}

export interface iWebGLRenderingContextProgram<AdditionalAttributesType = any, iWebGLProgramAdditionalAttributesType = any> {
    name: string,
    value: iWebGLProgram<iWebGLProgramAdditionalAttributesType>,
    attributes?: AdditionalAttributesType
}

export interface iWebGLRenderingContext<AdditionalAttributesType = any, WebGLProgramType = iWebGLRenderingContextProgram>
    extends WebGLRenderingContext {
    canvas: HTMLCanvasElement,  // this override is helpful for ts
    program?: iWebGLRenderingContextProgram<WebGLProgramType>,
    programs?: Array<iWebGLRenderingContextProgram<WebGLProgramType> | undefined>,
    attributes: AdditionalAttributesType
}


export interface iProgramArgs {
    vertexShader?: string,
    fragmentShader?: string,
    name?: string
}

/**
 * Initialize and get the rendering for WebGL
 * @param canvasId <string> element
 * @param programs
 * @return the rendering context for WebGL
 */
export function getWebGLContext<iWebGLRenderingContextAdditionalAttributesType = any, WebGLProgramType = iWebGLRenderingContextProgram>
(canvasId: string, programs ?: Array<iProgramArgs>)
    : iWebGLRenderingContext<iWebGLRenderingContextAdditionalAttributesType, WebGLProgramType> {

    const canvas: HTMLCanvasElement | null = document.getElementById(canvasId) as HTMLCanvasElement;

    if (null === canvas) {

        throw 'Failed to find the canvas element on the page!'

    }

    // Get the rendering context for WebGL
    const gl: iWebGLRenderingContext<iWebGLRenderingContextAdditionalAttributesType, WebGLProgramType>
        = WebglUtils.setupWebGL(canvas, undefined, undefined) as iWebGLRenderingContext<iWebGLRenderingContextAdditionalAttributesType, WebGLProgramType>;

    // @link https://stackoverflow.com/questions/13142635/how-can-i-create-an-object-based-on-an-interface-file-definition-in-typescript
    gl.attributes = {} as iWebGLRenderingContextAdditionalAttributesType;

    if (!gl) {

        throw 'WebglUtils failed to setupWebGL()!';

    }

    programs?.map((value: iProgramArgs) => {

        if (value.vertexShader === undefined
            || value.fragmentShader === undefined) {

            throw 'getWebGLContext was called incorrectly; vshader or fshader was undefined but not both. To skip program binding in getWebGLContext exclude both optional parameters';

        }

        createProgram<any, WebGLProgramType>(gl, value.vertexShader, value.fragmentShader, value.name);


    });

    return gl as iWebGLRenderingContext<iWebGLRenderingContextAdditionalAttributesType, WebGLProgramType>;

}

