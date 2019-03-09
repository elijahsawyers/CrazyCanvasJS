/*
    Created by Elijah Sawyers on 03/07/19.

    Abstract:
    This file contains drawing functionality for the canvas. Using an HTML5 canvas,
    we load in a png and draw vertices/edges on top of it.
 */

/*  
    
*/
function main() {
    // Grab the canvas and set its height/width.
    const canvas = document.getElementById("PDFCanvas");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.width/2;

    // If the browser supports canvas elements, grab the context.
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
    }

    canvas.onmousemove = function(e) {
        console.log("made it here");
        let mousePos = getMousePos(canvas, e); 
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        ctx.arc(mousePos.x, mousePos.y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

/*
    Constructor function for Node objects.
*/
function Node() {

}

/*
    Constructor function for Edge objects.
*/
function Edge() {

}

// Start executing after the document loads.
window.onload = main