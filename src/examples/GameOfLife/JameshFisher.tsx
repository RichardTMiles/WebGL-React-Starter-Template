import React, {Component} from "react";

const startImg = require('assets/img/Gun_(cellular_automaton).png');

// @link https://jameshfisher.com/2017/10/22/webgl-game-of-life/
// Game of Life implemented with a fragment shader
export default class JameshFisher extends Component<any, any> {
    constructor(props) {
        super(props);
        // we use this to make the card to appear after the page has been rendered
        this.state = {};
    }

    /**
     * The Game of Life is a two-dimensional pixelated world. Each pixel of the world is either alive or dead
     * (displayed as black or white). The world steps from one state to the next. Living pixels continue to live if they
     * have two or three living neighbors. Dead pixels come alive if they previously had exactly three living neighbors.
     * This style of simulation is called a “cellular automaton”.
     *
     * Above, I’ve implemented this simulation as a WebGL fragment shader. The key feature used is “rendering to texture”.
     * Normally, when you use functions like drawArrays and drawElements, it draws straight to the screen. But we can
     * tell WebGL to instead render to a texture. With this feature, textures can be read and written by fragment shaders,
     * meaning that we can use textures to store state!
     *
     * Above, the entire state is stored as a 64x64 texture. I have one “stepper” fragment shader which reads this texture,
     * and generates the next state:
     */

        // @link https://jameshfisher.com/2017/10/22/webgl-game-of-life/
        // language=GLSL
    STEPPER_FRAGMENT_SHADER_SOURCE = `
        precision mediump float;
        uniform sampler2D previousState;
        int wasAlive(vec2 coord) {
            if (coord.x < 0.0 || 64.0 < coord.x || coord.y < 0.0 || 64.0 < coord.y) return 0;
            vec4 px = texture2D(previousState, coord/64.0);
            return px.r < 0.1 ? 1 : 0;
        }
        void main(void) {
            vec2 coord = vec2(gl_FragCoord);
            int aliveNeighbors =
            wasAlive(coord+vec2(-1., -1.)) +
            wasAlive(coord+vec2(-1., 0.)) +
            wasAlive(coord+vec2(-1., 1.)) +
            wasAlive(coord+vec2(0., -1.)) +
            wasAlive(coord+vec2(0., 1.)) +
            wasAlive(coord+vec2(1., -1.)) +
            wasAlive(coord+vec2(1., 0.)) +
            wasAlive(coord+vec2(1., 1.));
            bool nowAlive = wasAlive(coord) == 1 ? 2 <= aliveNeighbors && aliveNeighbors <= 3 : 3 == aliveNeighbors;
            gl_FragColor = nowAlive ? vec4(0., 0., 0., 1.) : vec4(1., 1., 1., 1.);
        }`;

    // Fragment shader program
    // language=GLSL
    SIMPLE_FRAGMENT_SHADER_SOURCE = `
        precision mediump float;
        uniform sampler2D state;
        void main(void) {
            vec2 coord = vec2(gl_FragCoord)/64.0;
            gl_FragColor = texture2D(state, coord);
        }`;

    // language=GLSL
    VERTEX_SHADER = `
        attribute vec2 coord;
        void main(void) {
            gl_Position = vec4(coord, 0.0, 1.0);
        }`;

    componentDidMount() {

        const startStateImg = new Image();

        startStateImg.onload = () => {

            const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;

            if (null === canvasEl) {
                alert('Failed to get canvas element by id.')
                return;
            }

            const glContext = canvasEl.getContext("webgl");

            if (null === glContext) {
                return;
            }

            const gl : WebGLRenderingContext = glContext;

            function createShader(ty, src) {
                const s = gl.createShader(ty);
                if (null === s) {
                    throw 'Failed to create shader in :: ' + gl.canvas
                }
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    console.error("Could not compile shader", ty, src, gl.getShaderInfoLog(s));
                }
                return s;
            }

            const vertexShader = createShader(gl.VERTEX_SHADER, this.VERTEX_SHADER);

            const fragShaderDisplay = createShader(gl.FRAGMENT_SHADER, this.STEPPER_FRAGMENT_SHADER_SOURCE);

            const fragShaderStepper = createShader(gl.FRAGMENT_SHADER, this.SIMPLE_FRAGMENT_SHADER_SOURCE);

            function createProgram(vs, fs) {
                const p = gl.createProgram();
                if (null === p) {
                    throw 'Failed to create Program on ' + gl.canvas
                }
                gl.attachShader(p, vs);
                gl.attachShader(p, fs);
                gl.linkProgram(p);
                if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                    console.error("Error linking program", gl.getProgramInfoLog(p));
                }
                return p;
            }

            const displayProg = createProgram(vertexShader, fragShaderDisplay);

            const stepperProg = createProgram(vertexShader, fragShaderStepper);

            gl.useProgram(stepperProg);

            const stepperProgCoordLoc = gl.getAttribLocation(stepperProg, "coord");

            const stepperProgPreviousStateLoc = gl.getUniformLocation(stepperProg, "previousState");

            // const displayProgCoordLoc = gl.getAttribLocation(displayProg, "coord");

            const displayProgStateLoc = gl.getUniformLocation(displayProg, "state");

            const vertexBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, 1, 1, -1, 1,
            ]), gl.STATIC_DRAW);

            // Note we must bind ARRAY_BUFFER before running vertexAttribPointer!
            // This is confusing and deserves a blog post
            // https://stackoverflow.com/questions/7617668/glvertexattribpointer-needed-everytime-glbindbuffer-is-called
            gl.vertexAttribPointer(stepperProgCoordLoc, 2, gl.FLOAT, false, 0, 0);

            const elementBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);

            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 1, 2, 3]), gl.STATIC_DRAW);

            const texture0 = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0);

            gl.bindTexture(gl.TEXTURE_2D, texture0);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, startStateImg);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.generateMipmap(gl.TEXTURE_2D);

            const texture1 = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0 + 1);

            gl.bindTexture(gl.TEXTURE_2D, texture1);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, startStateImg);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.generateMipmap(gl.TEXTURE_2D);

            const framebuffers = [gl.createFramebuffer(), gl.createFramebuffer()];

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture0, 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

            let nextStateIndex = 0;

            window.setInterval( () => {

                const previousStateIndex = 1 - nextStateIndex;

                console.log(nextStateIndex, previousStateIndex)

                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[nextStateIndex]);

                gl.useProgram(stepperProg);

                gl.enableVertexAttribArray(stepperProgCoordLoc);

                gl.uniform1i(stepperProgPreviousStateLoc, previousStateIndex);

                gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                gl.useProgram(displayProg);

                gl.uniform1i(displayProgStateLoc, nextStateIndex);

                gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_BYTE, 0);

                nextStateIndex = previousStateIndex;

            }, 100);

        };

        startStateImg.src = startImg.default;

    }

    render() {

        return (
            <div>
                <h4>Orb Defence</h4>
                
                <canvas id="canvas" height="64" width="64" style={{width: "256px", height: "256px", imageRendering: "pixelated"}}/>
            </div>
        );
    }

}

