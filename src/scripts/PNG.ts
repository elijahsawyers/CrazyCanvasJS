/**
 * @file Image helper.
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/** 
 * Class representing a PNG image to be displayed in a canvas.
 * @extends Image 
 */
export class PNG extends Image {
    canvasX: number;
    canvasY: number;

    /** 
     * Creates a PNG image positioned at canvas location (0, 0).
     * @param {string} src: The path to the png.
     * @param {CanvasRenderingContext2D} src: The ctx to draw onto.
     */
    constructor(public src: string, public ctx: CanvasRenderingContext2D) {
        super();
        this.canvasX = 0;
        this.canvasY = 0;
    }

    /** 
     * Scales the PNG image by some factor. 
     * @param {number} factor: The factor to scale the PNG by.
     */
    scale(factor: number): void {
        this.width *= factor;
        this.height *= factor;
    }

    /** 
     * Update the stored location of the PNG image, if you change it in the canvas. 
     * @param {number} x: The new x-value on the canvas where the PNG is drawn.
     * @param {number} y: The new y-value on the canvas where the PNG is drawn.
     */
    changeLocation(x: number, y: number): void {
        this.canvasX = x;
        this.canvasY = y;
    }
}