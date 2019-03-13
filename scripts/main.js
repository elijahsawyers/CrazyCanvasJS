/**
 * @file Manages the main functionality for the canvas
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

 import {PNG} from "./PNG.js";
 import {Point, redrawPoints} from "./draw.js";
 import {canvasPointToGridPoint} from "./coordinateHelper.js";

// Start executing after the page loads.
window.onload = main;

/** The main function for our simple application. */ 
function main() {
    // Grab the canvas and set its height/width (maintaining the 2:1 ratio).
    const canvas = document.getElementById("PDFCanvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.width/2;

    // Initialize the canvas, its events, and enable drawing functionality.
    initializeCanvasWithImage(canvas, "../static/images/chalkboard.png");
}

/**
 * This function initializes the canvas by displaying an image, setting up panning and zooming, 
 * and enabling drawing functionality.
 * @param {CanvasRenderingContext2D} canvas: The canvas for drawing.
 * @param {string} src: The path of the png image to be drawn.
 */
function initializeCanvasWithImage(canvas, src) {

    // Set initial cursor style.
    canvas.style.cursor = "grab";

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

    // Grab the 2d context of the canvas.
    let ctx = canvas.getContext("2d");

    // The image that's drawn onto the canvas.
    let png = new PNG(src);

    // The cursor's location on the canvas.
    let cursorLocation = {
        x: 0,
        y: 0
    }

    // Tells if a point is currently grabbed.
    let latched = false;

    // The point that is being grabbed.
    let latchedPoint = {
        point: null,
        index: null
    };

    // Timer to determine if the user is scrolling.
    var scrollingTimer = null;

    // Represents the different states of the canvas.
    const states = {
        drawingPoints: 0,
        drawingLines: 1,
        panning: 2
    };

    // Stores the current state of the canvas (initially panning).
    let state = states.panning;

    // Store all points drawn onto the canvas.
    let points = [];

    //====================================================================================================
    // Event Listeners
    //====================================================================================================

    // Resizes the canvas, maintaining 2:1 ratio, and redraws everything.
    window.onresize = () => {
        // Grab the previous ctx transform (can't use ctx.save because resizing the canvas clears the cache).
        let t = ctx.getTransform();

        //...therefore, we have to...
        // ...clear the canvas...
        clearCanvas(ctx);

        // ...change the width and height of the canvas...
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.width/2;

        // ...translate and scale the grid by the previous transform...
        ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);

        // ...redraw the image based on the new origin...
        ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

        // ...and lastly, redraw the points and lines.
        redrawPoints(points);
    }

    // Load in the PNG image, and draw it when it loads.
    png.onload = () => {
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
    
    /* 
        Setup mousemove event listenter.
        Used for panning and storing the cursor's location.
    */
    canvas.onmousemove = (e) => {
        // If the cursor is over the trashcan, restyle it.
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

        // If a point is being grabbed, don't pan; instead, move the point by the mouse movement.
        if (latched) {
            // Set the curser to indicate a point is grabbed.
            canvas.style.cursor = "grabbing";
            
            /* 
                Move the latched point by the result of dividing the mouse movement by scale.
                Diving by the scale causes the movement speed to be slower the more that you zoom in.
            */
            latchedPoint.point.updateLocation(latchedPoint.point.x + (e.movementX / ctx.getTransform().a), latchedPoint.point.y + (e.movementY / ctx.getTransform().d));

            // Clear the canvas.
            clearCanvas(ctx);

            // Redraw the image.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

            // Redraw all points.
            redrawPoints(points);
        }

        // If the mouse is clicked and the state is "panning," pan the canvas.
        if (e.which == 1 && state == states.panning) {
            // Clear the canvas.
            clearCanvas(ctx);

            /* 
                Translate the origin of the grid by the result of dividing movement by scale.
                Diving by the scale causes the panning speed to be slower the more that you zoom in.
            */
            ctx.translate(e.movementX / ctx.getTransform().a, e.movementY / ctx.getTransform().d);

            // Redraw the image.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

            // Redraw all points.
            redrawPoints(points);
        }
    }

    /*
        Setup mousewheel event listener.
        Used for zooming.
    */
    canvas.onmousewheel = (e) => {
        // Set the curser to indicate zoom.
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

            // Redraw the image.
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

            // Redraw the image.
            ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);
        }

        // Redraw all points.
        redrawPoints(points);

        // Use a timer to determine if zooming has stopped, and if so, set the curser to indicate zooming has stopped.
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
        // Calculate the mouse pointer's location in the grid's coordinate system.
        let cursorGridPoint = canvasPointToGridPoint(ctx, cursorLocation.x, cursorLocation.y);

        // If the state is "panning," set the curser to indicate panning.
        if (state == states.panning) {
            canvas.style.cursor = "grabbing";
        } 

        // If the state is "drawingPoints:"
        if (state == states.drawingPoints) {
            // Determine if the clicked mouse point contains a point, if so, latch onto the point...
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
            // ...otherwise, create a new point at that location, and draw it.
            let newPoint = new Point(ctx, cursorGridPoint.x, cursorGridPoint.y);
            points.push(newPoint);
            newPoint.draw();
        }
    }

    /*
        Setup mouseup event listener.
        Used for drawing or deleting points.
    */
    canvas.onmouseup = (e) => {
        // If the cursor is released over the trashcan while latched onto a point, delete it.
        if (cursorLocation.x >= canvas.width - 50 && cursorLocation.x <= canvas.width - 10) {
            if (cursorLocation.y >= 10 && cursorLocation.y <= 50) {
                if (latched) {
                    // Remove the point from the points array.
                    points.splice(latchedPoint.index, 1);

                    // Clear the canvas.
                    clearCanvas(ctx);

                    // Redraw the image.
                    ctx.drawImage(png, png.canvasX, png.canvasY, png.width, png.height);

                    // Redraw all points.
                    redrawPoints(points);
                }
            }
        }

        // If the state is "panning," reset the cursor so that it's no longer grabbing.
        if (state == states.panning) {
            canvas.style.cursor = "grab";
        }
        /* 
            If the state is "drawingPoints," reset the cursor so that it's no longer grabbing, 
            reset latched point, and indicate that you're no longer latched. 
        */
        else if (state == states.drawingPoints) {
            canvas.style.cursor = "pointer";
            latched = false;
            latchedPoint.point = null;
            latchedPoint.index = null;
        }
    }

    /*
        Setup mouseleave event listener.
        Used for reseting misc. styles.
    */
    canvas.onmouseleave = (e) => {
        if (state == states.drawingPoints) {
            latched = false;
            canvas.style.cursor = "pointer";
        }
        trashcan.style.background = "#fff";
        trashcan.style.color = "#4A5056";
    }

    /*
        Setup pointButton onclick event listener.
        Used for changing state.
    */
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

    /*
        Setup lineButton onclick event listener.
        Used for changing state.
    */
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
 * Clears the entire canvas, regardless of transform.
 * @param {CanvasRenderingContext2D} ctx: The ctx of the canvas to clear.
 */
export function clearCanvas(ctx) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}
