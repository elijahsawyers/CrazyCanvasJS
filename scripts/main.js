/**
 * @file Manages drawing functionality for the canvas
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

 import {PNG} from "./PNG.js";
 import {Point, redrawPoints} from "./draw.js";

// Start executing after the page loads.
window.onload = main;

/** The main function for our simple application. */ 
function main() {
    // Grab the canvas and set its height/width (maintaining the 2:1 ratio).
    const canvas = document.getElementById("PDFCanvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.width/2;

    // Initialize the canvas and all of its events.
    initializeCanvasWithImage(canvas, "../static/images/chalkboard.png");
}

/**
 * This function initializes the canvas by displaying an image, setting up panning and zooming, 
 * and enabling drawing functionality.
 * @param {CanvasRenderingContext2D} canvas: The canvas for drawing.
 * @param {string} src: The path of the png image to be drawn.
 */
function initializeCanvasWithImage(canvas, src) {

    // Grab the context.
    let ctx = canvas.getContext("2d");

    //====================================================================================================
    // DOM Elements
    //====================================================================================================

    // The point "button" in the toolbar.
    let pointButton = document.getElementById("point"); 

    // The line "button" in the toolbar.
    let lineButton = document.getElementById("line");

    // The trashcan for removing nodes.
    let trashcan = document.getElementById("trash");

    //====================================================================================================
    // Local Variables
    //====================================================================================================

    // The image that's drawn onto the canvas.
    let png = new PNG(src);

    

    // Load in the PNG image, and draw it when it loads.
    png.onload = () => {
        clearCanvas(ctx);

        // Scale the image so that it displays as big as possible in the canvas.
        if (Math.min(png.width, png.height) == png.width) {
            if (png.width < canvas.width) {
                png.scale(1 + (1 - Math.abs(png.width/canvas.width)));
            } else {
                png.scale(Math.abs(canvas.width/png.width));
            }
        } else {
            if (png.height < canvas.height) {
                png.scale(1 + (1 - Math.abs(png.height/canvas.height)));
            } else {
                png.scale(Math.abs(canvas.height/png.height));
            }
        }
        
        // Position the image at the center of the canvas.
        ctx.translate(canvas.width/2 - png.width/2, canvas.height/2 - png.height/2);

        // Draw the image on the canvas.
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
    }

    // Maintain 2:1 canvas ratio, even when the window resizes.
    window.onresize = () => {
        // Grab the previous ctx transform (can't use ctx.save because resizing the canvas clears the cache).
        let t = ctx.getTransform();

        //...therefore, we have to...
        // ...clear the canvas...
        clearCanvas(ctx);

        // Changing the width and height of the canvas resets the context...
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.width/2;

        // ...translate and scale the grid by the previous transform...
        ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);

        // ...redraw the image based on the new origin...
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

        // ...and lastly, redraw the points and lines.
        redrawPoints(points);
    }

    //====================================================================================================
    // Cursor
    //====================================================================================================

    // Stores the cursor's location.
    let cursorLocation = {
        x: 0,
        y: 0
    }
    
    // Handle cursor style.
    canvas.style.cursor = "grab";

    //====================================================================================================
    // Event Listeners
    //====================================================================================================
    
    /* 
        Setup mousemove event listenter.
        Used for panning and storing the cursor's location.
    */
    let latched = false;
    let latchedPoint = {
        point: null,
        index: null
    };
    canvas.onmousemove = (e) => {
        if ((cursorLocation.x >= canvas.width - 50 && cursorLocation.x <= canvas.width - 10) && (cursorLocation.y >= 10 && cursorLocation.y <= 50)) {
            trashcan.style.background = "#B22222";
            trashcan.style.color = "#fff";
        } else {
            trashcan.style.background = "#fff";
            trashcan.style.color = "#4A5056";
        }

        // Store the cursor's location each time it moves.
        cursorLocation.x = e.offsetX;
        cursorLocation.y = e.offsetY;

        if (latched) {
            canvas.style.cursor = "grabbing";
            
            if (latchedPoint != null) {
                latchedPoint.point.updateLocation(latchedPoint.point.x + (e.movementX / ctx.getTransform().a), latchedPoint.point.y + (e.movementY / ctx.getTransform().d));
            }

            // Clear the canvas.
            clearCanvas(ctx);

            // Redraw the image.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

            redrawPoints(points);
        }

        // If the mouse is click, pan.
        if (e.which == 1 && state == states.panning) {
            // Clear the canvas.
            clearCanvas(ctx);

            /* 
                Translate the origin of the grid by the result of dividing movement by scale.
                Diving by the scale causes the panning speed to be slower the more that you zoom in.
            */
            ctx.translate(e.movementX / ctx.getTransform().a, e.movementY / ctx.getTransform().d);

            // Redraw the image based on the new origin.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

            redrawPoints(points);
        }
    }

    /*
        Setup mousewheel event listener.
        Used for zooming.
    */
    var scrollingTimer;
    canvas.onmousewheel = (e) => {
        // Change the cursor style.
        canvas.style.cursor = "ns-resize";

        // Zoom in.
        if (e.deltaY > 0) {
            // Clear the canvas.
            clearCanvas(ctx);

            // Grab the mouse x and y value before scaling.
            let mouseBeforeScale = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);

            // Scale the grid.
            ctx.scale(1.05, 1.05);

            // Grab the mouse x and y value after scaling.
            let mouseAfterScale = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);

            // Translate by the displacement of the mouse's location.
            ctx.translate(mouseAfterScale.x - mouseBeforeScale.x, mouseAfterScale.y - mouseBeforeScale.y);

            // Redraw the image based on the new scale.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }
        // Zoom out.
        else if (e.deltaY < 0) {
            // Clear the canvas.
            clearCanvas(ctx);

            // Grab the mouse x and y value before scaling.
            let mouseBeforeScale = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);

            // Scale the grid.
            ctx.scale(0.95, 0.95);

            // Grab the mouse x and y value after scaling.
            let mouseAfterScale = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);

            // Translate by the displacement of the mouse's location.
            ctx.translate(mouseAfterScale.x - mouseBeforeScale.x, mouseAfterScale.y - mouseBeforeScale.y);

            // Redraw the image based on the new scale.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }

        redrawPoints(points);

        // Change the cursor style when scrolling stops.
        if(scrollingTimer !== null) {
            clearTimeout(scrollingTimer);        
        }
        scrollingTimer = setTimeout(function() {
            if (state == states.panning) {
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "pointer";
            }
        }, 100);
    }

    /*
        Setup mousedown event listener.
        Used for drawing points and dragging points.
    */
    canvas.onmousedown = (e) => {
        let cursorGridPoint = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);
        if (state == states.panning) {
            canvas.style.cursor = "grabbing";
        } 
        if (state == states.drawingPoints) {
            for (let i = 0; i < points.length; i++) {
                if (cursorGridPoint.x <= points[i].x + 5 && cursorGridPoint.x >= points[i].x - 5) {
                    if (cursorGridPoint.y <= points[i].y + 5 && cursorGridPoint.y >= points[i].y - 5) {
                        latched = true;
                        latchedPoint.point = points[i];
                        latchedPoint.index = i;
                        return;
                    }
                }
            }
            let newPoint = new Point(ctx, cursorGridPoint.x, cursorGridPoint.y);
            points.push(newPoint);
            newPoint.draw();
        }
    }

    /*
        Setup mouseup event listener.
        Used for drawing.
    */
    canvas.onmouseup = (e) => {
        if (cursorLocation.x >= canvas.width - 50 && cursorLocation.x <= canvas.width - 10) {
            if (cursorLocation.y >= 10 && cursorLocation.y <= 50) {
                points.splice(latchedPoint.index, 1);
                // Clear the canvas.
                clearCanvas(ctx);

                // Redraw the image.
                ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

                redrawPoints(points);
            }
        }

        if (state == states.panning) {
            canvas.style.cursor = "grab";
        } else if (state == states.drawingPoints) {
            canvas.style.cursor = "pointer";
            latched = false;
            latchedPoint.point = null;
            latchedPoint.index = null;
        }
    }

    canvas.onmouseleave = (e) => {
        if (state == states.drawingPoints) {
            latched = false;
            canvas.style.cursor = "pointer";
        }
        trashcan.style.background = "#fff";
        trashcan.style.color = "#4A5056";
    }

    // Represents the states of the canvas.
    const states = {
        drawingPoints: 0,
        drawingLines: 1,
        panning: 2
    };

    // Stores the current state of the canvas (initially panning).
    let state = states.panning;

    // Store all objects drawn on the canvas.
    let points = [];

    // Change state when the point button is clicked.
    pointButton.onclick = (e) => {
        if (state != states.drawingPoints) {
            state = states.drawingPoints;
            canvas.style.cursor = "pointer";
            pointButton.style.background = "#71815f"
            pointButton.style.color = "#fff"
            lineButton.style.background = "#fff"
            lineButton.style.color = "#4A5056"
        } else {
            state = states.panning;
            canvas.style.cursor = "grab";
            pointButton.style.background = "#fff"
            pointButton.style.color = "#4A5056"
        }
    }

    // Change state when the line button is clicked.
    lineButton.onclick = (e) => {
        if (state != states.drawingLines) {
            state = states.drawingLines;
            canvas.style.cursor = "pointer";
            lineButton.style.background = "#71815f"
            lineButton.style.color = "#fff"
            pointButton.style.background = "#fff"
            pointButton.style.color = "#4A5056"
        } else {
            state = states.panning;
            canvas.style.cursor = "grab";
            lineButton.style.background = "#fff"
            lineButton.style.color = "#4A5056"
        }
    }
}

//====================================================================================================
// Helper Functions
//====================================================================================================

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
 * Clears the entire canvas, regardless of transform.
 * @param {CanvasRenderingContext2D} ctx: The ctx of the canvas to clear.
 */
function clearCanvas(ctx) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}