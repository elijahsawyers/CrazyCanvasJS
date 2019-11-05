/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import CanvasImage from './CanvasImage';
import CanvasPoint from './CanvasPoint';
import CanvasState from './CanvasState'
import Coordinate from './Coordinate';

/** Represents a canvas with an image to draw onto. */
export default class Canvas {

    /** The rendering context for the canvas. */
    ctx: CanvasRenderingContext2D;

    /** All points currently on the canvas. */
    points: Array<CanvasPoint> = [];

    /** The mouse pointer's coordinates on the canvas. */
    cursorCoordinate: Coordinate = {x: 0, y: 0};

    /** Whether or not a point is being grabbed. */
    latched: boolean = false;

    /** If a point is being grabbed, it's the grabbed point; otherwise, null. */
    latchedPoint: CanvasPoint | null = null;

    /** If the state is in drawingConnections, it's the first point clicked. */
    firstPointClicked: CanvasPoint | null = null;

    /** The state of the canvas: panning, drawingPoints, or drawingConnections. */
    state: CanvasState = CanvasState.panning;

    /** 
     * Creates a canvas with an image to draw points and connections between points.
     *
     * @param canvas: The HTML canvas to draw onto.
     * @param image: The image to draw onto the canvas.
     */
    constructor(public canvas: HTMLCanvasElement, public image: CanvasImage) {
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.image.image.onload = () => {
            // Scale the image so that its height fills the canvas.
            if (canvas.height < this.image.image.height) {
                const numerator = this.image.image.height - canvas.height;
                const denominator = this.image.image.height;
                const scale = 1 - (numerator / denominator);
                this.image.scale(scale);
            } else if (canvas.height > this.image.image.height) {
                const numerator = canvas.height - this.image.image.height;
                const denominator = this.image.image.height;
                const scale = 1 + (numerator / denominator);
                this.image.scale(scale);
            }

            // Position the image at the center of the canvas.
            this.ctx.translate(
                canvas.width / 2 - this.image.image.width / 2,
                canvas.height / 2 - this.image.image.height / 2
            );
                
            this.redraw();
        };
    }

    /**
     * Converts a point in the canvas to the corresponding ctx grid point.
     *
     * @param x: The x-value of the canvas point.
     * @param y: The y-value of the canvas point.
     */
    canvasPointToCtxPoint(x: number, y: number): Coordinate {
        let t = this.ctx.getTransform();
        return {
            x: ((x - t.e) / t.a),
            y: ((y - t.f) / t.d)
        };
    }

    /** Clears the canvas, including the image and all points and connections. */
    clear(): void {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();
    }

    /** Redraws the canvas, including the image and all points and connections. */
    redraw(): void {
        this.clear();
        this.drawImage();
        this.points.forEach((point) => {
            this.drawPoint(point);

            point.connections.forEach((connection) => {
                this.drawConnection(point, connection)
            });
        });
    }

    /**
     * Draws a point onto the canvas.
     *
     * @param point: The point to draw onto the canvas.
     */
    drawPoint(point: CanvasPoint): void {
        this.ctx.beginPath();
        this.ctx.fillStyle = point._fillStyle;
        this.ctx.arc(
            point.coordinate.x,
            point.coordinate.y,
            point._radius,
            0, // Radians.
            2 * Math.PI, // Radians.
        );
        this.ctx.fill();
        this.ctx.closePath();
    }

    /**
     * Draws a connection onto the canvas between two points.
     * 
     * @param pointA: The first point in the connection.
     * @param pointB: The second point in the connection.
     */
    drawConnection(pointA: CanvasPoint, pointB: CanvasPoint): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = pointA._fillStyle;
        this.ctx.moveTo(pointA.coordinate.x, pointA.coordinate.y);
        this.ctx.lineTo(pointB.coordinate.x, pointB.coordinate.y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    /** Draws the image onto the canvas. */
    drawImage(): void {
        this.ctx.drawImage(
            this.image.image,
            this.image.coordinate.x,
            this.image.coordinate.y,
            this.image.image.width,
            this.image.image.height
        );
    }

    /**
     * Pan the canvas' ctx by mouseMovement x and y. Note: The mouse movement is
     * multiplied by some factor to keep the pan speed from getting extremely
     * fast when the canvas is zoomed in.
     *
     * @param mouseMovementX: The x-movement of the cursor.
     * @param mouseMovementY: The y-movement of the cursor.
     */
    pan(mouseMovementX: number, mouseMovementY: number): void {
        this.ctx.translate(
            mouseMovementX / this.ctx.getTransform().a,
            mouseMovementY / this.ctx.getTransform().d
        );
        this.redraw();
    }

    /**
     * Zooms the canvas' ctx. If the mouseScrollDelta is positive, the canvas' ctx
     * is scaled by 1.05 (zoom in). If the mouseScrollDelta is negative, the canvas'
     * ctx is scaled by 0.95 (zoom out).
     *
     * @param mouseScrollDelta: The mouse scroll delta of a scroll event.
     */
    zoom(mouseScrollDelta: number): void {
        const scale = (mouseScrollDelta > 0) ? 1.05 : 0.95;

        const mouseBeforeScale = this.canvasPointToCtxPoint(
            this.cursorCoordinate.x,
            this.cursorCoordinate.y
        );

        this.ctx.scale(scale, scale);

        const mouseAfterScale = this.canvasPointToCtxPoint(
            this.cursorCoordinate.x,
            this.cursorCoordinate.y
        );

        this.ctx.translate(
            mouseAfterScale.x - mouseBeforeScale.x,
            mouseAfterScale.y - mouseBeforeScale.y
        );

        this.redraw();
    }

    /**
     * Determines whether or not a mouse click (in canvas units) is on a point in the canvas.
     * If so, the point is returned; otherwise, null is returned.
     *
     * @param mouseClickX: The x coordinate of a mouse click.
     * @param mouseClickY: The y coordinate of a mouse click.
     */
    clickOnPoint(mouseClickX: number, mouseClickY: number): CanvasPoint | null {
        let cursorCtxPoint = this.canvasPointToCtxPoint(mouseClickX, mouseClickY);

        for (let i = 0; i < this.points.length; i++) {
            if (cursorCtxPoint.x <= this.points[i].coordinate.x + 5 && cursorCtxPoint.x >= this.points[i].coordinate.x - 5) {
                if (cursorCtxPoint.y <= this.points[i].coordinate.y + 5 && cursorCtxPoint.y >= this.points[i].coordinate.y - 5) {
                    return this.points[i];
                }
            }
        }

        return null;
    }

    /**
     * Adds a point to the canvas. Note: must redraw the canvas to see the point.
     *
     * @param point: The point to draw on the canvas.
     */
    addPoint(point: CanvasPoint): void {
        this.points.push(point);
    }

    /**
     * Removes a point from the canvas, including removing it from all other points
     * list of connections, if needed. Note: must redraw the canvas to see the point
     * be removed.
     *
     * @param pointToDelete: The point to delete from the canvas.
     */
    deletePoint(pointToDelete: CanvasPoint): void {
        this.points = this.points.filter((point) => point != pointToDelete);
        this.points.forEach((point) => {
            point.deleteConnection(pointToDelete);
        });
    }
}
