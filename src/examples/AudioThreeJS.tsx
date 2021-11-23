import React, {Component} from "react";
import SimplexNoise from "simplex-noise";
import THREELib from "three-js";

const EminenceFront = require("assets/audio/EminenceFront_TheWho.mp3");

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class AudioThreeJS extends Component<{}, {
    //initialise simplex noise instance
    audio: HTMLAudioElement,
    context?: AudioContext,
    analyser?: AnalyserNode,
    src?: MediaElementAudioSourceNode,
    dataArray: Uint8Array,
    bufferLength: number,
}> {

    constructor(props) {
        super(props);

        // we use this to make the card to appear after the page has been rendered
        this.play = this.play.bind(this);

    }

    state = {
        audio: new Audio(EminenceFront.default),
        analyser: undefined,
        context: undefined,
        src: undefined,
        dataArray: new Uint8Array(),
        bufferLength: 0,
    };

    noise = new SimplexNoise();

    componentDidMount() {

        // And off we go!
        // this will load the canvas and audio but not play, we HAVE to
        // wait for a user interaction. This is a chrome rule.
        this.play();

        // the main visualiser function
        window.addEventListener('click', () => {
            this.play();    // this second invocation should play
        });

        document.body.addEventListener('touchend',
            () => this.context.resume())

    }

    componentWillUnmount() {
        this.state.audio.pause();
    }

    play = () => {

        const element = document.querySelector('canvas');

        if (typeof (element) != 'undefined' && element != null) {

            if (undefined !== this.state.analyser) {

                return;

            }


            const AudioContext = window.AudioContext // Default
                || // @ts-ignore
                window.webkitAudioContext // Safari and old versions of Chrome
                || false;

            const tryPlayAudio = () => this.state.audio.play()
                .then(() => console.log('Trying to play?!'));

            if (undefined === this.state.context) {

                const audioCTX = new AudioContext();
                const audioAnalyser = audioCTX.createAnalyser();
                const audioSource = audioCTX.createMediaElementSource(this.state.audio);

                audioSource.connect(audioAnalyser);
                audioAnalyser.connect(audioCTX.destination);
                audioAnalyser.fftSize = 512;

                this.setState({
                    context: audioCTX,
                    analyser: audioAnalyser,
                    // Read it into memory as an arrayBuffer
                    // Turn it from mp3/aac/whatever into raw audio data
                    src: audioSource,
                    bufferLength: audioAnalyser.frequencyBinCount,
                    dataArray: new Uint8Array(audioAnalyser.frequencyBinCount)
                }, tryPlayAudio)

            } else {

                tryPlayAudio().then(() => console.log('tryPlayAudio done.'));

            }

            return;
        }

        const THREE = THREELib(); // return THREE JS

        //here comes the webgl
        const scene = new THREE.Scene();

        const group = new THREE.Group();

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        camera.position.set(0, 0, 100);

        camera.lookAt(scene.position);

        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

        renderer.setSize(window.innerWidth, window.innerHeight);

        const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);

        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x6904ce,
            side: THREE.DoubleSide,
            wireframe: true
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -0.5 * Math.PI;

        plane.position.set(0, 30, 0);

        group.add(plane);

        const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);

        plane2.rotation.x = -0.5 * Math.PI;

        plane2.position.set(0, -30, 0);

        group.add(plane2);

        const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);

        const lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xff00ee,
            wireframe: true
        });

        const ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);

        ball.position.set(0, 0, 0);

        group.add(ball);

        const ambientLight = new THREE.AmbientLight(0xaaaaaa);

        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff);

        spotLight.intensity = 0.9;

        spotLight.position.set(-10, 40, 20);

        spotLight.lookAt(ball);

        spotLight.castShadow = true;

        scene.add(spotLight);

        // var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        // orbitControls.autoRotate = true;

        scene.add(group);

        const canvasElement = document.getElementById('out');

        if (null === canvasElement) {

            alert('Could not element with id "out".');

            return;

        }

        canvasElement.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        const renderCanvas = () => {

            const analyzingAudio = undefined !== this.state.analyser;

            if (analyzingAudio) {

                // Send it through the analyser
                // @ts-ignore - it is not possible for analyser to be undefined here
                const audioAnalyzer : AnalyserNode = this.state.analyser;

                audioAnalyzer.getByteFrequencyData(this.state.dataArray);

            }

            const analyzingAudioSetDefaults = (cb) => analyzingAudio ? cb() : 0;

            const lowerHalfArray = analyzingAudioSetDefaults(() => this.state.dataArray.slice(0, (this.state.dataArray.length / 2) - 1));

            const upperHalfArray = analyzingAudioSetDefaults(() => this.state.dataArray.slice((this.state.dataArray.length / 2) - 1, this.state.dataArray.length - 1));

            //const overallAvg = this.avg(this.dataArray);

            const lowerMax = analyzingAudioSetDefaults(() => this.max(lowerHalfArray));

            // const lowerAvg = this.avg(lowerHalfArray);

            // const upperMax = this.max(upperHalfArray);

            const upperAvg = analyzingAudioSetDefaults(() => this.avg(upperHalfArray));

            const lowerMaxFr = analyzingAudioSetDefaults(() => lowerMax / lowerHalfArray.length);

            // const lowerAvgFr = lowerAvg / lowerHalfArray.length;

            // const upperMaxFr = upperMax / upperHalfArray.length;

            const upperAvgFr = analyzingAudioSetDefaults(()=> upperAvg / upperHalfArray.length);

            this.makeRoughGround(plane, this.modulate(upperAvgFr, 0, 1, 0.5, 4));

            this.makeRoughGround(plane2, this.modulate(lowerMaxFr, 0, 1, 0.5, 4));

            this.makeRoughBall(ball,
                this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8),
                this.modulate(upperAvgFr, 0, 1, 0, 4));

            group.rotation.y += 0.005;

            renderer.render(scene, camera);

            requestAnimationFrame(renderCanvas);

        }

        this
            .state
            .audio
            .load() // this is more of a Queuing action for most browsers

        renderCanvas();

    };


    makeRoughBall = (mesh, bassFr, treFr) => {

        mesh.geometry.vertices.forEach((vertex) => {
            const offset = mesh.geometry.parameters.radius;
            const amp = 7;
            const time = window.performance.now();
            vertex.normalize();
            const rf = 0.00001;
            const distance = (offset + bassFr) + this.noise.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
            vertex.multiplyScalar(distance);
        });

        mesh.geometry.verticesNeedUpdate = true;

        mesh.geometry.normalsNeedUpdate = true;

        mesh.geometry.computeVertexNormals();

        mesh.geometry.computeFaceNormals();

    }

    makeRoughGround = (mesh, distortionFr) => {

        mesh.geometry.vertices.forEach((vertex) => {
            const amp = 2;
            const time = Date.now();
            // distance
            // noinspection PointlessArithmeticExpressionJS
            vertex.z = (this.noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
        });

        mesh.geometry.verticesNeedUpdate = true;

        mesh.geometry.normalsNeedUpdate = true;

        mesh.geometry.computeVertexNormals();

        mesh.geometry.computeFaceNormals();

    }

//some helper funcdtions here
    fractionate = (val, minVal, maxVal) => {
        return (val - minVal) / (maxVal - minVal);
    }

    modulate = (val, minVal, maxVal, outMin, outMax) => {

        const fr = this.fractionate(val, minVal, maxVal);

        const delta = outMax - outMin;

        return outMin + (fr * delta);

    }

    avg(arr) {

        const total = arr.reduce(function (sum, b) {
            return sum + b;
        });

        return (total / arr.length);

    }

    max(arr) {
        return arr.reduce(function (a, b) {
            return Math.max(a, b);
        })
    }


    render() {
        return (
            <div id="content">
                <audio preload="auto" id="audio" autoPlay src=""/>
                <div id="out"/>
            </div>
        );
    }

}

