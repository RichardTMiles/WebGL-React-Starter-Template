import React, {Component} from "react";

export const range = n =>
    new Array(n).fill(0).map((_, idx) => idx);

export const canvasStyle = config =>
    `display:block;position:absolute;top:0;left:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:${config.zIndex};opacity:${config.opacity}`;

interface iTwoD {
    max: number,
    x: number | null,
    y: number | null,
}

interface iTwoDAnimated extends iTwoD {
    ya: number,
    xa: number
}

type NestProps = typeof Nest.defaultProps & {
    age: number;
};

// @link https://sites.google.com/site/webglbook/home/chapter-3
export default class Nest extends Component<NestProps, {
    // updating react state will re-run the render method.
    // this is un necessary overhead with canvas apps.
}> {
    static defaultProps = {
        zIndex: -1,
        count: 99,
        opacity: 0.5,
        color: '40,0,255',
        pointColor: '255,0,0',
        position: "relative"
    };

    canvas?: HTMLCanvasElement;

    all: Array<iTwoDAnimated | iTwoD> = [];

    points?: Array<iTwoDAnimated>;

    current: iTwoD = {
        x: 0, // 当前鼠标x
        y: 0, // 当前鼠标y
        max: 20000 // 圈半径的平方
    };

    constructor(props) {
        super(props);
        this.state ={}
    }

    canvasContext ?: CanvasRenderingContext2D;

    componentDidMount() {

        this.canvas = document.getElementById('2d') as HTMLCanvasElement;

        this.canvasContext = this.canvas.getContext('2d') || undefined;

        if (undefined === this.canvasContext) {

            alert('failed to get 2d context.')

            return;

        }

        this.points = this.randomPoints();

        this.all = this.all?.concat(this.points,
            [this.current]
        );

        if (undefined === this.canvas) {

            alert('failed to get canvas');

            return;
        }

        this.canvas.onmousemove = e => {
            this.current.x = e.clientX; // - this.el.offsetLeft + document.scrollingElement.scrollLeft; // 当存在横向滚动条时，x坐标再往右移动滚动条拉动的距离
            this.current.y = e.clientY; // - this.el.offsetTop + document.scrollingElement.scrollTop; // 当存在纵向滚动条时，y坐标再往下移动滚动条拉动的距离
        };

        this.canvas.onmouseout = () => {
            this.current.x = null;
            this.current.y = null;
        };

        this.drawCanvas()

    }

    randomPoints = () => {
        return range(this.props.count).map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            xa: 2 * Math.random() - 1, // 随机运动返现
            ya: 2 * Math.random() - 1,
            max: 6000 // 沾附距离
        }));
    };


    tid = 0;

    drawCanvas = () => {

        const context = this.canvasContext;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const current = this.current;
        const points = this.points;
        const all = this.all;

        if (undefined === context
            || undefined === current
            || undefined === points
        ) {
            alert('context, current, or points was undefined. quitting.')

            return;
        }

        context.clearRect(0, 0, width, height);

        // 随机的线条和当前位置联合数组
        let e, i, d, x_dist, y_dist, dist; // 临时节点

        // 遍历处理每一个点
        points.forEach((r, idx) => {

            r.x = r.x || 0;

            r.y = r.y || 0;

            r.x += r.xa;

            r.y += r.ya; // 移动

            r.xa *= r.x > width || r.x < 0 ? -1 : 1;

            r.ya *= r.y > height || r.y < 0 ? -1 : 1; // 碰到边界，反向反弹

            context.fillStyle = `rgba(${this.props.pointColor})`;

            context.fillRect(r.x - 0.5, r.y - 0.5, 1, 1); // 绘制一个宽高为1的点

            // 从下一个点开始
            for (i = idx + 1; i < all.length; i++) {

                e = all[i];

                // 当前点存在
                if (null !== e.x && null !== e.y) {

                    x_dist = r.x - e.x; // x轴距离 l

                    y_dist = r.y - e.y; // y轴距离 n

                    dist = x_dist * x_dist + y_dist * y_dist; // 总距离, m

                    if (dist > e.max) {
                        continue;
                    }

                    if (e === current && dist >= e.max / 2) {

                        r.x -= 0.03 * x_dist;

                        r.y -= 0.03 * y_dist;

                    }

                    d = (e.max - dist) / e.max;

                    context.beginPath();

                    context.lineWidth = d / 2;

                    context.strokeStyle = `rgba(${this.props.color},${d + 0.2})`;

                    context.moveTo(r.x, r.y);

                    context.lineTo(e.x, e.y);

                    context.stroke();

                }

            }

        });

        requestAnimationFrame(this.drawCanvas);

    }

    destroy() {

        // 删除轮询
        cancelAnimationFrame(this.tid);

    }

    render() {

        return (
            <div>
                <canvas id={"2d"} width={window.innerWidth} height={window.innerHeight} style={{backgroundColor: "white"}}/>
            </div>
        );
    }

}

