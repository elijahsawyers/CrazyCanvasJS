export class Point {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.fill = false;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = "red";
        this.ctx.strokeStyle = "red";
        if (this.fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    updateLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}

export function redrawPoints(points) {
    for (let i = 0; i < points.length; i++) {
        points[i].draw();
    }
}