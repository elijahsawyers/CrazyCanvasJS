/**
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

import Coordinate from './Coordinate';

/** Represents an image to be displayed in a DrawingCanvas. */
export default class CanvasImage {

    /** The HTMLImageElement to be drawn onto the canvas. */
    image: HTMLImageElement;

    /** The (x, y) coordinate of the image on the canvas. */
    coordinate: Coordinate;

    /**
     * Creates an image positioned at the specified canvas' ctx's x and y location.
     *
     * @param image: A path to an image, or an HTMLImageElement.
     * @param x: The canvas' ctx's x-value to place the image.
     * @param y: The canvas' ctx's y-value to place the image.
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
     * @param factor: The factor to scale the image by.
     */
    scale(factor: number): void {
        this.image.width *= factor;
        this.image.height *= factor;
    }

    /**
     * Changes the location of the image.
     *
     * @param x: The new x-value.
     * @param y: The new y-value.
     */
    changeCoordinate(x: number, y: number): void {
        this.coordinate = { x, y };
    }
}