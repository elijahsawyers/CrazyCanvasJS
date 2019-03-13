/**
 * @file Draw functionality helpers.
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/** Class representing a point drawn onto a canvas. */
export class Point {
    /** 
     * Creates a point positioned at the specified canvas location.
     * @param {CanvasRenderingContext2D} ctx: The ctx to draw onto.
     * @param {number} x: The x-value of the point.
     * @param {number} x: The y-value of the point.
     */
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.fill = false;
    }

    /**
     * Draws the point onto the canvas.
     */
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = "red";
        this.ctx.strokeStyle = "red";
        if (this.fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    /**
     * Changes the location of the point. Must delete the old one 
     * and draw the updated location on the canvas.
     * @param {number} x: The updated x-value of the point.
     * @param {number} y: The updated y-value of the point.
     */
    updateLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Draw Points onto their canvas.
 * @param {Array} points: The array of Point objects to draw.
 */
export function redrawPoints(points) {
    for (let i = 0; i < points.length; i++) {
        points[i].draw();
    }
}