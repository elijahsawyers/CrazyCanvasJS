/**
 * @file Manages drawing functionality for the canvas
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/** The main function for our simple application. */ 
function main() {
    // Grab the canvas and set its height/width (maintaining the 2:1 ratio).
    const canvas = document.getElementById("PDFCanvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.width/2;

    // If the browser supports canvas elements, grab the context.
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
    }

    // Initialize the canvas and all of its events.
    initializeCanvas(ctx, "test.png");
}

/**
 * This function initializes the canvas for drawing.
 * @param {CanvasRenderingContext2D} ctx: The 2d drawing context.
 * @param {string} src: The path to the png image to be drawn onto.
 */
function initializeCanvas(ctx, src) {
    // Load in the PNG image, and draw it when it loads.
    let png = new PNG(src);
    png.onload = () => {
        // Scale the image so that it displays as big as possible in the canvas.
        if (Math.min(png.width, png.height) == png.width) {
            if (png.width < ctx.canvas.width) {
                png.scale(1 + (1 - Math.abs(png.width/ctx.canvas.width)));
            } else {
                png.scale(Math.abs(ctx.canvas.width/png.width));
            }
        } else {
            if (png.height < ctx.canvas.height) {
                png.scale(1 + (1 - Math.abs(png.height/ctx.canvas.height)));
            } else {
                png.scale(Math.abs(ctx.canvas.height/png.height));
            }
        }
        
        // Position the image at the center of the canvas.
        ctx.translate(ctx.canvas.width/2 - png.width/2, ctx.canvas.height/2 - png.height/2);

        // Draw the image on the canvas.
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
    }

    // Maintain 2:1 ratio, even when the window resizes.
    window.onresize = () => {
        // Grab the previous ctx transform.
        let t = ctx.getTransform();

        // Changing the width and height of the canvas resets the context...
        ctx.canvas.width = ctx.canvas.parentElement.clientWidth;
        ctx.canvas.height = ctx.canvas.width/2;

        //...therefore, we have to...
        // ...clear the canvas...
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // ...translate and scale the grid by the previous transform...
        ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);

        // ...and redraw the image based on the new origin.
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
    }

    // Stores the mouse pointer's location.
    let mouseLocation = {
        x: 0,
        y: 0
    }
    
    // Setup pan event listenters.
    ctx.canvas.onmousemove = (e) => {
        // Store the mouse pointer's location each time it moves.
        mouseLocation.x = e.offsetX;
        mouseLocation.y = e.offsetY;

        // If the mouse is click, pan.
        if (e.which == 1) {
            // Clear the canvas.
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            /* 
                Translate the origin of the grid by the result of dividing movement by scale.
                Diving by the scale causes the panning speed to be slower the more that you zoom in.
            */
            ctx.translate(e.movementX / ctx.getTransform().a, e.movementY / ctx.getTransform().d);

            // Redraw the image based on the new origin.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
    }

    // Setup scroll event listener.
    ctx.canvas.onmousewheel = (e) => {
        // Zoom in.
        if (e.deltaY > 0) {
            // Clear the canvas.
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Grab the mouse x and y value before scaling.
            let mouseBeforeScale = canvasPointToGridPoint(ctx, mouseLocation.x, mouseLocation.y);

            // Scale the grid.
            ctx.scale(1.05, 1.05);

            // Grab the mouse x and y value after scaling.
            let mouseAfterScale = canvasPointToGridPoint(ctx, mouseLocation.x, mouseLocation.y);

            // Translate by the displacement of the mouse's location.
            ctx.translate(mouseAfterScale.x - mouseBeforeScale.x, mouseAfterScale.y - mouseBeforeScale.y);

            // Redraw the image based on the new scale.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
        // Zoom out.
        else if (e.deltaY < 0) {
            // Clear the canvas.
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Grab the mouse x and y value before scaling.
            let mouseBeforeScale = canvasPointToGridPoint(ctx, mouseLocation.x, mouseLocation.y);

            // Scale the grid.
            ctx.scale(0.95, 0.95);

            // Grab the mouse x and y value after scaling.
            let mouseAfterScale = canvasPointToGridPoint(ctx, mouseLocation.x, mouseLocation.y);

            // Translate by the displacement of the mouse's location.
            ctx.translate(mouseAfterScale.x - mouseBeforeScale.x, mouseAfterScale.y - mouseBeforeScale.y);

            // Redraw the image based on the new scale.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
    }
}

/**
 * Converts a point in the canvas to the corresponding grid point.
 * @param {CanvasRenderingContext2D} ctx: The grid to convert to.
 * @param {number} x: The x-value of the canvas point.
 * @param {number} y: The y-value of the canvas point.
 */
function canvasPointToGridPoint(ctx, x, y) {
    let t = ctx.getTransform();
    return {
        x: ((x - t.e) / t.a),
        y: ((y - t.f) / t.d)
    };
}

/** 
 * Class representing a PNG image to be displayed in a canvas.
 * @extends Image 
 */
class PNG extends Image {
    /** 
     * Creates a PNG image positioned at canvas location (0, 0).
     * @param {string} src: The path to the png.
     */
    constructor(src) {
        super();
        this.src = src;
        this.canvasX = 0;
        this.canvasY = 0;
    }

    /** 
     * Scales the PNG image by some factor. 
     * @param {number} factor: The factor to scale the PNG by.
     */
    scale(factor) {
        this.width *= factor;
        this.height *= factor;
    }

    /** 
     * Update the stored location of the PNG image, if you change it in the canvas. 
     * @param {number} x: The new x-value on the canvas where the PNG is drawn.
     * @param {number} y: The new y-value on the canvas where the PNG is drawn.
     */
    changeLocation(x, y) {
        this.canvasX = x;
        this.canvasY = y;
    }
}

// Start executing after the page loads.
window.onload = main;