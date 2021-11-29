import React, {Component} from 'react';


class Canvas extends Component<{
    id?: string
}, {}> {
    constructor(props) {
        super(props);
    }

    canvas = React.createElement("canvas",
{
            id: this.props.id || "WebbGl",
            width: window.innerWidth,
            height: window.innerHeight,
            style: {
                color: "red"
            }
        },
        "Please use a browser that supports \"canvas\"");

    render() {
        return this.canvas;
    }
}

export default Canvas;
