/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import Coordinate from './Coordinate';

/** 
 * Represents an image to be displayed in a DrawingCanvas.
 *
 * @extends Image
 */
export default class CanvasImage extends Image {

    coordinate: Coordinate;

    /** 
     * Creates an image positioned at the specified canvas' ctx's x and y location.
     *
     * @param {string} src: The path to the image.
     * @param {number} x: The canvas' ctx's x-value to place the image.
     * @param {number} y: The canvas' ctx's y-value to place the image.
     */
    constructor(public src: string, public x: number = 0, public y: number = 0) {
        super();
        this.coordinate = {
            x,
            y
        }
    }

    /**
     * Scales the image by some factor.
     *
     * @param {number} factor: The factor to scale the image by.
     */
    scale(factor: number): void {
        this.width *= factor;
        this.height *= factor;
    }

    /**
     * Changes the location of the image.
     *
     * @param {number} x: The new x-value.
     * @param {number} y: The new y-value.
     */
    changeCoordinate(x: number, y: number): void {
        this.coordinate = { x, y };
    }
}