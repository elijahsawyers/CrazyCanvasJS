/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import Coordinate from './Coordinate';

/** Represents a point in a canvas' ctx. */
export default class CanvasPoint {

    _radius: number = 5;
    _fillStyle: string = 'red';
    coordinate: Coordinate;

    /**
     * Creates a point positioned at the specified canvas' ctx's x and y location.
     *
     * @param {number} x: The canvas' ctx's x-value to place the point.
     * @param {number} y: The canvas' ctx's y-value to place the point.
     * @param {Array<CanvasPoint>} connections: A list of connections.
     */
    constructor(x: number = 0, y: number = 0, public connections: Array<CanvasPoint> = []) {
        this.coordinate = {
            x,
            y
        };
    }

    /**
     * Changes the location of the point.
     *
     * @param {number} x: The new x-value.
     * @param {number} y: The new y-value.
     */
    changeCoordinate(x: number, y: number): void {
        this.coordinate = { x, y };
    }

    /**
     * Adds a connection to the list of connections.
     *
     * @param {CavnasPoint} point: The point to add to the list of connections. 
     */
    addConnection(point: CanvasPoint): void {
        this.connections.push(point);
    }
}
