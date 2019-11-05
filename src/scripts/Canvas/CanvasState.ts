/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/**
 * Represents the three possible states of the canvas.
 * 
 * 1. panning: to pan around and zoom.
 * 2. drawingPoints: drawing points and dragging points onto the canvas.
 * 3. drawingConnections: drawing connections onto the canvas.
 */
enum CanvasState {
    panning, drawingPoints, drawingConnections
}

export default CanvasState;
