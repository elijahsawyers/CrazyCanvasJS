/**
 * @file Draw functionality helpers.
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/** Class representing a point drawn onto a canvas. */
export class Point {
    /** 
     * Creates a point positioned at the specified canvas location.
     * @param {number} x: The x-value of the point.
     * @param {number} x: The y-value of the point.
     */
    constructor(ctx, x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.connections = []
    }

    /**
     * Draws the point onto the canvas.
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
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

    /**
     * Add a connection to another point.
     * @param {Point} point: The point to add a connection to. 
     */
    addConnection(point) {
        this.connections.push(point);
    }
}

/** Class that represents a connection between two points. */
export class Connection {
    /**
     * Creates a connection between two points.
     * @param {Point} a: The point "A" of the connection.
     * @param {Point} b: The point "B" of the connection.
     */
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}

/**
 * Redraw the image, points, and connections on the canvas.
 * @param {CanvasRenderingContext2D} ctx: The context to redraw.
 * @param {PNG} image: The png image to redraw.
 * @param {Array} points: The array of Point objects to draw.
 * @param {Point} deletedPoint: If a point was deleted, pass it here when redrawing.
 */
export function redraw(ctx, image, points, deletedPoint = null) {
    // Clear the canvas.
    clearCanvas(ctx);

    // Redraw the image.
    ctx.drawImage(image, image.canvasX, image.canvasY, image.width, image.height);

    // Loop over the points.
    for (let i = 0; i < points.length; i++) {
        // Draw the current point.
        points[i].draw(ctx);

        // Loop over the current point's connections.
        let indexOfConnectionToDelete = -1;
        for (let j = 0; j < points[i].connections.length; j++) {
            // If the current point has a connection to the deleted point...
            if (points[i].connections[j] === deletedPoint) {
                // ...set the connection to be deleted, and don't draw it...
                indexOfConnectionToDelete = j;
            } else {
                // ...otherwise, draw the current connection.
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[i].connections[j].x, points[i].connections[j].y);
                ctx.strokeStyle = "red";
                ctx.stroke();
                ctx.closePath();
            }
        }

        // Actually remove the connection to the deleted point.
        if (indexOfConnectionToDelete != -1) {
            points[i].connections.splice(indexOfConnectionToDelete, 1);
        }
    }
}

/**
 * Clears the entire canvas, regardless of transform.
 * @param {CanvasRenderingContext2D} ctx: The ctx of the canvas to clear.
 */
export function clearCanvas(ctx) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}