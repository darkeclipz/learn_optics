class Vec2 {
            
    constructor(x, y=x){
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    scale(scalar) {
        return new Vec2(scalar * this.x, scalar * this.y);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    lengthSq() {
        return this.dot(this);
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        let l = this.length();
        return new Vec2(this.x / l, this.y / l);
    }

    normal() {
        return new Vec2(-this.y, this.x);
    }

    rotate(angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new Vec2(cos * this.x + sin * this.y, -sin * this.x + cos * this.y);
    }

    angle(other) {
        return Math.acos(Math.abs(this.dot(other)) / Math.sqrt(this.dot(this) + other.dot(other)));
    }

    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

}