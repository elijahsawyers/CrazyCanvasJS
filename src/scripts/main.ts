/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import CanvasImage from './Canvas/CanvasImage';
import Canvas from './Canvas';
import CanvasPoint from './Canvas/CanvasPoint';
import CanvasState from './Canvas/CanvasState';

(function main() {
    /** HTMLCanvasElement used for drawing. */
    const canvasHTMLElement = <HTMLCanvasElement>document.getElementById('PDFCanvas');
    canvasHTMLElement.width = (<HTMLDivElement>canvasHTMLElement.parentElement).clientWidth;
    canvasHTMLElement.height = canvasHTMLElement.width/2;

    /** Toolbar point button, used to switch the canvas state to 'drawingPoints'. */
    const pointButton = <HTMLDivElement>document.getElementById('point');

    /** Toolbar point button, used to switch the canvas state to 'drawingConnections'. */
    const connectionsButton = <HTMLDivElement>document.getElementById('connection');

    /** Toolbar trash button, used to delete points from the canvas. */
    const trashButton = <HTMLDivElement>document.getElementById('trash');

    /** The image to be drawn onto the canvas. */
    const image = new CanvasImage('../assets/images/chalkboard.png');

    /** Manages a HTMLCanvasElement, used for drawing an image, points, and connections. */
    const canvas = new Canvas(canvasHTMLElement, image);

    window.onresize = () => {
        const transform = canvas.ctx.getTransform();

        canvasHTMLElement.width = (<HTMLDivElement>canvasHTMLElement.parentElement).clientWidth;
        canvasHTMLElement.height = canvasHTMLElement.width/2;

        canvas.ctx.setTransform(
            transform.a,
            transform.b,
            transform.c,
            transform.d,
            transform.e,
            transform.f,
        );
        canvas.redraw();
    };

    window.onkeydown = (e: KeyboardEvent) => {
        if (e.keyCode == 8 || e.keyCode == 127) {
            canvas.firstPointClicked = null;
            canvas.redraw();
        }
    }

    canvasHTMLElement.onmousemove = (e: MouseEvent) => {
        canvas.cursorCoordinate = { x: e.offsetX, y: e.offsetY };

        if (canvas.latched) {
            (<CanvasPoint>canvas.latchedPoint).changeCoordinate(
                (<CanvasPoint>canvas.latchedPoint).coordinate.x + (e.movementX / canvas.ctx.getTransform().a),
                (<CanvasPoint>canvas.latchedPoint).coordinate.y + (e.movementY / canvas.ctx.getTransform().d)
            );

            canvas.redraw();
        }

        if (e.which == 1 && canvas.state == CanvasState.panning) canvas.pan(e.movementX, e.movementY);

        if (canvas.firstPointClicked) {
            let cursorCtxPoint = canvas.canvasPointToCtxPoint(canvas.cursorCoordinate.x, canvas.cursorCoordinate.y);

            canvas.redraw();
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(
                canvas.firstPointClicked.coordinate.x,
                canvas.firstPointClicked.coordinate.y
            );
            canvas.ctx.lineTo(cursorCtxPoint.x, cursorCtxPoint.y);
            canvas.ctx.strokeStyle = 'red';
            canvas.ctx.stroke();
        }
    };

    canvasHTMLElement.onmousedown = (e: MouseEvent) => {
        const clickedPoint = canvas.clickOnPoint(canvas.cursorCoordinate.x, canvas.cursorCoordinate.y);

        switch (canvas.state) {
            case CanvasState.drawingPoints:
                if (clickedPoint) {
                    canvas.latched = true;
                    canvas.latchedPoint = clickedPoint;
                } else {
                    const cursorCtxCoordinate = canvas.canvasPointToCtxPoint(
                        canvas.cursorCoordinate.x,
                        canvas.cursorCoordinate.y
                    );
                    const newPoint = new CanvasPoint(cursorCtxCoordinate.x, cursorCtxCoordinate.y);
                    canvas.addPoint(newPoint);
                    canvas.redraw();
                }

                break;
            case CanvasState.drawingConnections:
                if (clickedPoint) {
                    if (!canvas.firstPointClicked) {
                        canvas.firstPointClicked = clickedPoint;
                    } else {
                        (<CanvasPoint>canvas.firstPointClicked).addConnection(clickedPoint);
                        clickedPoint.addConnection((<CanvasPoint>canvas.firstPointClicked));
                        canvas.latched = false;
                        canvas.firstPointClicked = null;
                        canvas.redraw();
                    }
                }
                break;
            default:
                break;
        }
    };

    canvasHTMLElement.onmouseup = (e: MouseEvent) => {
        switch (canvas.state) {
            case CanvasState.drawingPoints:
                if (
                    canvas.cursorCoordinate.x >= canvasHTMLElement.width - 50 &&
                    canvas.cursorCoordinate.x <= canvasHTMLElement.width - 10
                ) {
                    if (canvas.latchedPoint) {
                        canvas.deletePoint(canvas.latchedPoint);
                        canvas.redraw();
                    };
                }
                canvas.latched = false;
                canvas.latchedPoint = null;
                break;
            case CanvasState.drawingConnections:
                break;
            default:
                break;
        }
    };

    canvasHTMLElement.onwheel = (e: WheelEvent) => {
        canvas.zoom(e.deltaY);
    };

    pointButton.onclick = (e: MouseEvent) => {
        if (pointButton.classList.value.includes('selected')) {
            canvas.state = CanvasState.panning;
            pointButton.classList.remove('selected');
        } else {
            canvas.state = CanvasState.drawingPoints;
            pointButton.classList.add('selected');
        }
        connectionsButton.classList.remove('selected');
    };

    connectionsButton.onclick = (e: MouseEvent) => {
        if (connectionsButton.classList.value.includes('selected')) {
            canvas.state = CanvasState.panning;
            connectionsButton.classList.remove('selected');
        } else {
            canvas.state = CanvasState.drawingConnections;
            connectionsButton.classList.add('selected');
        }
        pointButton.classList.remove('selected');
    };
})();
