/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import CanvasImage from './CanvasImage';
import CanvasPoint from './CanvasPoint';
import CanvasState from './CanvasState'
import Coordinate from './Coordinate';

/** Represents a canvas with an image to draw onto. */
export default class Canvas {

    ctx: CanvasRenderingContext2D;
    points: Array<CanvasPoint> = [];
    cursorCoordinate: Coordinate = {x: 0, y: 0};
    latched: boolean = false;
    latchedPoint: CanvasPoint | null = null;
    zooming: boolean = false;
    state: CanvasState = CanvasState.panning;
    scale: number = 1;

    /** 
     * Creates a canvas with an image to draw points and connections between points.
     *
     * @param {HTMLCanvasElement} canvas: The HTML canvas to draw onto.
     * @param {CanvasImage} image: The image to draw onto the canvas.
     */
    constructor(public canvas: HTMLCanvasElement, public image: CanvasImage) {
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.image.onload = () => {
            // Scale the image so that its height fills the canvas.
            if (canvas.height < this.image.height) {
                const numerator = this.image.height - canvas.height;
                const denominator = this.image.height;
                this.scale = 1 - (numerator / denominator);
                this.image.scale(this.scale);
            } else if (canvas.height > this.image.height) {
                const numerator = canvas.height - this.image.height;
                const denominator = this.image.height;
                this.scale = 1 + (numerator / denominator);
                this.image.scale(this.scale);
            }

            // Position the image at the center of the canvas.
            this.ctx.translate(
                canvas.width / 2 - this.image.width / 2,
                canvas.height / 2 - this.image.height / 2
            );

            this.redraw();
        };
    }

    /**
     * Converts a point in the canvas to the corresponding ctx grid point.
     *
     * @param {number} x: The x-value of the canvas point.
     * @param {number} y: The y-value of the canvas point.
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
     * @param {CanvasPoint} point:
     */
    drawPoint(point: CanvasPoint): void {
        this.ctx.fillStyle = point._fillStyle;
        this.ctx.arc(
            point.coordinate.x,
            point.coordinate.y,
            point._radius,
            0, // Radians.
            2 * Math.PI, // Radians.
        );
        this.ctx.fill();
    }

    /**
     * Draws a connection onto the canvas between two points.
     * 
     * @param {CanvasPoint} pointA:
     * @param {CanvasPoint} pointB:
     */
    drawConnection(pointA: CanvasPoint, pointB: CanvasPoint): void {
        this.ctx.strokeStyle = pointA._fillStyle;
        this.ctx.moveTo(pointA.coordinate.x, pointA.coordinate.y);
        this.ctx.lineTo(pointB.coordinate.x, pointB.coordinate.y);
        this.ctx.stroke();
    }

    /** Draws the image onto the canvas. */
    drawImage(): void {
        this.ctx.drawImage(
            this.image,
            this.image.coordinate.x,
            this.image.coordinate.y,
            this.image.width,
            this.image.height
        );
    }
}
