/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import Coordinate from './Coordinate';

/** Represents a point in a canvas' ctx. */
export default class CanvasPoint {

    /** The radius of the canvas point when drawn onto the canvas. */
    _radius: number = 5;

    /** The color to fill the point with when drawing onto the canvas. */
    _fillStyle: string = 'red';

    /** The (x, y) coordinate of the point on the canvas. */
    coordinate: Coordinate;

    /**
     * Creates a point positioned at the specified canvas' ctx's x and y location.
     *
     * @param x: The canvas' ctx's x-value to place the point.
     * @param y: The canvas' ctx's y-value to place the point.
     * @param connections: A list of connections.
     */
    constructor(x: number = 0, y: number = 0, public connections: Array<CanvasPoint> = []) {
        this.coordinate = {
            x,
            y
        };
    }

    /**
     * Changes the location on the canvas of the point. Note: must redraw the canvas
     * to see the updated location.
     *
     * @param x: The new x-value.
     * @param y: The new y-value.
     */
    changeCoordinate(x: number, y: number): void {
        this.coordinate = { x, y };
    }

    /**
     * Adds a connection to the list of connections.
     *
     * @param point: The point to add to the list of connections. 
     */
    addConnection(point: CanvasPoint): void {
        this.connections.push(point);
    }

    /**
     * Removes a point from the list of connections.
     *
     * @param pointToDelete the point to remove from the list of connections.
     */
    deleteConnection(pointToDelete: CanvasPoint) {
        this.connections = this.connections.filter((point) => point != pointToDelete);
    }
}
