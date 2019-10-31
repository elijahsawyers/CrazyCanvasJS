/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import CanvasImage from './CanvasImage';
import CanvasPoint from './CanvasPoint';
import Coordinate from './Coordinate';

/** Represents a canvas with an image to draw onto. */
export class Canvas {

    ctx: CanvasRenderingContext2D;
    points: Array<CanvasPoint> = [];

    /** 
     * Creates a canvas with an image to draw points and connections between points.
     *
     * @param {HTMLCanvasElement} canvas: The HTML canvas to draw onto.
     * @param {CanvasImage} image: The image to draw onto the canvas.
     */
    constructor(public canvas: HTMLCanvasElement, public image: CanvasImage) {
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.redraw();
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
