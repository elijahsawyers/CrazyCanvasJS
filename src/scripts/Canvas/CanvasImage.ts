/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import Coordinate from './Coordinate';

/** Represents an image to be displayed in a DrawingCanvas. */
export default class CanvasImage {

    image: HTMLImageElement;
    coordinate: Coordinate;

    /**
     * Creates an image positioned at the specified canvas' ctx's x and y location.
     *
     * @param {string | HTMLImageElement} image: A path to an image, or an HTMLImageElement.
     * @param {number} x: The canvas' ctx's x-value to place the image.
     * @param {number} y: The canvas' ctx's y-value to place the image.
     */
    constructor(
        image: string | HTMLImageElement,
        x: number = 0,
        y: number = 0
    ) {
        if (typeof(image) === 'string') {
            this.image = new Image();
            this.image.src = image;
        } else {
            this.image = image;
        }

        this.coordinate = { x, y };
    }

    /**
     * Scales the image by some factor.
     *
     * @param {number} factor: The factor to scale the image by.
     */
    scale(factor: number): void {
        this.image.width *= factor;
        this.image.height *= factor;
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