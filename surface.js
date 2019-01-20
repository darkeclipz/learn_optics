class Surface {

    constructor(p1, p2, color = 'gray') {
        this.p1 = p1;
        this.p2 = p2;
        this.color = color;
    }

    toRay() {
        return new Ray(this.p1, this.p2.subtract(this.p1));
    }

}