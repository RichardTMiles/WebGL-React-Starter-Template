import React, {Component} from 'react';

import {AxiosInstance} from "axios";

// This is our ajax class
import OrbDefence from "./examples/OrbDefence";
import ClickedPoints from "./examples/ClickedPoints";
import ExampleList from "./examples/ExampleList";
import ColoredPoints from "./examples/ColoredPoints";
import MultiPoint from "./examples/MultiPoint";
import HelloTriangle from "./examples/HelloTriangle";
import HelloTriangleLines from "./examples/HelloTriangleLines";
import HelloTriangleStrip from "./examples/HelloTriangleStrip";
import HelloTriangleLoop from "./examples/HelloTriangleLoop";
import HelloQuad from "./examples/HelloQuad";
import HelloQuadFan from "./examples/HelloQuadFan";
import RotatedTriangle from "./examples/RotatedTriangle";
import RotatedTriangleMatrix from "./examples/RotatedTriangleMatrix";
import ScaledTriangleMatrix from "./examples/ScaledTriangleMatrix";
import RotatedTranslatedTriangle from "./examples/RotatedTranslatedTriangle";
import RotatingTriangle from "./examples/RotatingTriangle";
import AudioThreeJS from "./examples/AudioThreeJS";
import Hud from "./examples/Hud";
import PickFace from "./examples/PickFace";
import RotateObjectWithMouse from "./examples/RotateObjectWithMouse";
// import JameshFisher from "./examples/GameOfLife/JameshFisher";
import Chaos from "./examples/Chaos";
import Pendulum2 from "./examples/Pendulum2";
import Bezier from "./examples/Bezier";
import Nest from "./examples/Nest";



export interface iCustomRoute {
    component?: any,
    name?: string,
    path: string,
    pathTo?: string,
    redirect?: boolean
}

export default class WebGl extends Component<{ axios: AxiosInstance,
    authenticate: string,
    isAppLocal?: boolean,
    authenticated?: boolean,
    alert?: boolean,
    operationActive: boolean,
    isLoaded: boolean,
    darkMode: boolean,
    alertsWaiting: Array<any>,
    versions: Array<any>,
    id: string
    subRoutingSwitch: Function
}, {

}> {
    constructor(props) {

        super(props);

    }

    render() {
        console.log("LOGIN JSX RENDER");


        // Routes that belong to the public and private sector
        let Routes : iCustomRoute[] = [
            {
                path: "/WebGl/Multi",
                name: "Multi-Point",
                component: MultiPoint
            },
            {
                path: "/WebGl/ClickedPoints",
                name: "Clicked Points",
                component: ClickedPoints
            },
            {
                path: "/WebGl/Colored",
                name: "Colored Points",
                component: ColoredPoints
            },{
                path: "/WebGl/HelloTriangle",
                name: "HelloTriangle",
                component: HelloTriangle
            },{
                path: "/WebGl/HelloTriangleLines",
                name: "HelloTriangleLines",
                component: HelloTriangleLines
            },{
                path: "/WebGl/HelloTriangleStrip",
                name: "HelloTriangleStrip",
                component: HelloTriangleStrip
            },{
                path: "/WebGl/HelloTriangleLoop",
                name: "HelloTriangleLoop",
                component: HelloTriangleLoop
            },{
                path: "/WebGl/HelloQuad",
                name: "HelloQuad",
                component: HelloQuad
            },{
                path: "/WebGl/HelloQuadFan",
                name: "HelloQuadFan",
                component: HelloQuadFan
            },{
                path: "/WebGl/RotatedTriangle",
                name: "RotatedTriangle",
                component: RotatedTriangle
            },{
                path: "/WebGl/RotatedTriangleMatrix",
                name: "RotatedTriangleMatrix",
                component: RotatedTriangleMatrix
            },{
                path: "/WebGl/ScaledTriangleMatrix",
                name: "ScaledTriangleMatrix",
                component: ScaledTriangleMatrix
            },{
                path: "/WebGl/RotatedTranslatedTriangle",
                name: "RotatedTranslatedTriangle",
                component: RotatedTranslatedTriangle
            },{
                path: "/WebGl/RotatingTriangle",
                name: "RotatingTriangle",
                component: RotatingTriangle
            },{
                path: "/WebGl/Chaos",
                name: "Chaos",
                component: Chaos
            },{
                path: "/WebGl/Pendulum2",
                name: "Pendulum2",
                component: Pendulum2
            },{
                path: "/WebGl/Bezier",
                name: "Bezier",
                component: Bezier
            },{
                path: "/WebGl/PickFace",
                name: "PickFace",
                component: PickFace
            },{
                path: "/WebGl/RotateObjectWithMouse",
                name: "RotateObjectWithMouse",
                component: RotateObjectWithMouse
            },{
                path: "/WebGl/Nest",
                name: "Nest",
                component: Nest
            },{
                path: "/WebGl/HUD",
                name: "HUD",
                component: Hud
            },/*{
                path: "/WebGl/GOL-JameshFisher",
                name: "GOL-JameshFisher",
                component: JameshFisher
            },*/{
                path: "/WebGl/AudioThreeJS",
                name: "AudioThreeJS",
                component: AudioThreeJS
            },
            {
                path: "/WebGl/orb",
                name: "Orb Defence",
                component: OrbDefence
            },
            {
                path: "/WebGl/ExampleList",
                name: "Example List",
                component: ExampleList
            },
            {
                path: "/WebGl/",
                pathTo: "/WebGl/ExampleList",
                redirect: true
            }
        ];


        return <>
                {this.props.subRoutingSwitch(Routes, {Routes})}
                {alert}
        </>;
    }
}
