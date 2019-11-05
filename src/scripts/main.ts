/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import CanvasImage from './Canvas/CanvasImage';
import Canvas from './Canvas';
import CanvasPoint from './Canvas/CanvasPoint';
import CanvasState from './Canvas/CanvasState';

(function main() {
    /** HTMLCanvasElement used for drawing. */
    const canvasHTMLElement = <HTMLCanvasElement>document.getElementById('canvas');
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

    /*
     * When the window is resized, resize the canvas without losing the content drawn
     * onto the canvas.
     */
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

    /*
     * When the delete key is pressed, nullify the first point clicked and redraw
     * the canvas. While drawing connections, this removes the line being drawn
     * from the first point clicked and the cursor.
     */
    window.onkeydown = (e: KeyboardEvent) => {
        if (e.keyCode == 8 || e.keyCode == 127) {
            canvas.firstPointClicked = null;
            canvas.redraw();
        }
    }

    /* Unlatch from a point when the mouse leaves the canvas. */
    canvasHTMLElement.onmouseleave = (e: MouseEvent) => {
        canvas.latched = false;
        canvas.latchedPoint = null;
    };

    /*
     * When the mouse is moved on the canvas:
     * 
     * 1. Set the canvas' cursor coordinates.
     * 2. If hovering the trash button, style it.
     * 3. If clicking and in state 'panning', pan the canvas.
     * 4. If in state 'drawingConnections' and a first point has already
     *    been clicked, draw a line from the point to the cursor.
     */
    canvasHTMLElement.onmousemove = (e: MouseEvent) => {
        canvas.cursorCoordinate = { x: e.offsetX, y: e.offsetY };

        if (hoveringTrashButton(canvas.cursorCoordinate.x, canvas.cursorCoordinate.y)) {
            trashButton.classList.add('trash-hover');
        } else {
            trashButton.classList.remove('trash-hover');
        }

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

    /*
     * When the mouse is clicked on the canvas:
     * 
     * 1. If in state 'drawingPoints' and not clicking on a point, add
     *    a new point.
     * 2. If in state 'drawingConnections', handle creating connections.
     */
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

    /*
     * When the mouse click is released on the canvas:
     * 
     * 1. If in state 'drawingPoints' and hovering over the trash button with a point,
     *    delete the point.
     */
    canvasHTMLElement.onmouseup = (e: MouseEvent) => {
        switch (canvas.state) {
            case CanvasState.drawingPoints:
                if (hoveringTrashButton(canvas.cursorCoordinate.x, canvas.cursorCoordinate.y)) {
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

    /* Zoom the canvas on scroll. */
    canvasHTMLElement.onwheel = (e: WheelEvent) => {
        canvas.zoom(e.deltaY);
    };

    /* On point button click, change the canvas state to 'drawingPoints'. */
    pointButton.onclick = (e: MouseEvent) => {
        toolboxSwitch(pointButton, connectionsButton, CanvasState.drawingPoints);
    };

    /* On connections button click, change the canvas state to 'drawingConnections'. */
    connectionsButton.onclick = (e: MouseEvent) => {
        toolboxSwitch(connectionsButton, pointButton, CanvasState.drawingConnections);
    };

    /**
     * Given an (x, y) coordinate, return a boolean as to whether or not the coordinate
     * is hovering over the trash button.
     *
     * @param x the x-value to check if it's hovering over the trash button.
     * @param y the y-value to check if it's hovering over the trash button.
     */
    function hoveringTrashButton(x: number, y: number): boolean {
        const trashXValue = canvasHTMLElement.clientWidth - trashButton.clientWidth - 10;
        const trashYValue = 10;

        if (x >= trashXValue && x <= trashXValue + trashButton.clientWidth) {
            if (y >= trashYValue && y <= trashYValue + trashButton.clientHeight) {
                return true;
            }
        }

        return false;
    }

    /**
     * When one of the two toolbox buttons is pressed, change the styling of the buttons and
     * change the canvas' state.
     *
     * @param button: The button to change the style to '.selected'.
     * @param oppositeButton: The button to remove the style '.selected'.
     * @param activeState: The state to change the canvas to.
     */
    function toolboxSwitch(button: HTMLDivElement, oppositeButton: HTMLDivElement, activeState: CanvasState): void {
        if (button.classList.value.includes('selected')) {
            canvas.state = CanvasState.panning;
            button.classList.remove('selected');
        } else {
            canvas.state = activeState;
            button.classList.add('selected');
        }
        oppositeButton.classList.remove('selected');
    }
})();
