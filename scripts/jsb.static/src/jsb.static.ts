
// NOT IMPLEMENTED
// JS implementation of essential primitive types with least binding code

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    abs() {
        return new Vector2(Math.abs(this.x), Math.abs(this.y));
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    length_squared() {
        return this.x * this.x + this.y * this.y;
    }
}
