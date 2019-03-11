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
    initializeCanvas(ctx, "test.png", 0, 0);
}

/**
 * This function initializes the canvas for drawing.
 * @param {CanvasRenderingContext2D} ctx: The 2d drawing context.
 * @param {string} src: The path to the png to be drawn onto.
 * @param {number} x: The x-value on the canvas for the png to be drawn.
 * @param {number} y: The y-value on the canvas for the png to be drawn.
 */
function initializeCanvas(ctx, src, x, y) {
    // Load in the PNG image, and draw it when it loads.
    let png = new PNG(src, x, y);
    png.onload = () => {
        png.scale(0.25);
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
    }

    // Maintain 2:1 ratio, even when the window resizes.
    window.onresize = () => {
        // Grab the previous ctx transform.
        let horizontalTranslation = ctx.getTransform().e;
        let verticalTranslation = ctx.getTransform().f;
        let horizontalScale = ctx.getTransform().a;
        let verticalScale = ctx.getTransform().d;

        // Changing the width and height of the canvas resets the context...
        ctx.canvas.width = ctx.canvas.parentElement.clientWidth;
        ctx.canvas.height = ctx.canvas.width/2;

        //...therefore, we have to...
        // ...remove the previous image...
        ctx.clearRect(png.canvasX, png.canvasY, png.width, png.height);

        // ...translate and scale the grid (a.k.a. coordinate system) by the previous transform...
        ctx.translate(horizontalTranslation, verticalTranslation);
        ctx.scale(horizontalScale, verticalScale);

        // ...and redraw the image based on the new origin.
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
    }

    // Setup pan event listenters.
    ctx.canvas.onmousemove = (e) => {
        if (e.which == 1) {
            // Remove the previous image.
            ctx.clearRect(png.canvasX, png.canvasY, png.width, png.height);

            // Translate the origin of the grid (a.k.a. coordinate system) by movement x & y.
            ctx.translate(e.movementX, e.movementY);

            // Redraw the image based on the new origin.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
    }

    // Setup scroll event listener.
    ctx.canvas.onmousewheel = (e) => {
        // Zoom in.
        if (e.deltaY > 0) {
            // Remove the previous image.
            ctx.clearRect(png.canvasX, png.canvasY, png.width, png.height);

            // Scale the context.
            ctx.scale(1.05, 1.05);

            // Redraw the image based on the new scale.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
        // Zoom out.
        else if (e.deltaY < 0) {
           // Remove the previous image.
           ctx.clearRect(png.canvasX, png.canvasY, png.width, png.height);

           // Scale the context.
           ctx.scale(0.95, 0.95);

           // Redraw the image based on the new scale.
           ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
    }
}

function getMousePositionOffsetToImage(e, pngX, pngY) {
    return {
        x: (e.clientX - rect.left) / (rect.right - rect.left) * ctx.canvas.width,
        y: (e.clientY - rect.top) / (rect.bottom - rect.top) * ctx.canvas.height
    };
}

/** 
 * Class representing a PNG image to be displayed in a canvas.
 * @extends Image 
 */
class PNG extends Image {
    /** 
     * Creates a PNG image. 
     * @param {string} src: The path to the png.
     * @param {number} x: The x-value on the canvas for the png to be drawn.
     * @param {number} y: The y-value on the canvas for the png to be drawn.
     */
    constructor(src, x, y) {
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