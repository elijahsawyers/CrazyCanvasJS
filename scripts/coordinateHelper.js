/**
 * @file Coordinate conversion helpers.
 * @author Elijah Sawyers <elijahsawyers@gmail.com>
 */

/**
 * Converts a point in the canvas to the corresponding grid point.
 * @param {CanvasRenderingContext2D} ctx: The grid to convert to.
 * @param {number} x: The x-value of the canvas point.
 * @param {number} y: The y-value of the canvas point.
 */
export function canvasPointToGridPoint(ctx, x, y) {
    let t = ctx.getTransform();
    return {
        x: ((x - t.e) / t.a),
        y: ((y - t.f) / t.d)
    };
}