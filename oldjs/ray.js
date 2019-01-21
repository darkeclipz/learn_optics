class Ray {

    constructor(p, d, color='red') {
        this.pos = p;
        this.dir = d;
        this.color = color;
    }

    pointAt(t) {
        return this.pos.add(this.dir.scale(t));
    }

    normalize() {
        return new Ray(this.pos, this.dir.normalize());
    }

    intersect(ray) {

        let t = ray.pos.subtract(this.pos).cross(this.dir) / this.dir.cross(ray.dir);
        let u = ray.pos.subtract(this.pos).cross(ray.dir) / this.dir.cross(ray.dir);

        if(ray.dir.cross(this.dir) != 0 && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return this.pos.add(this.dir.scale(u));
        } 
        
        return undefined;
    }

    reflect(surfaceNormal) {

        let sn = surfaceNormal;
        let di = this.dir;
        let dndi = 2 * sn.dot(di);
        let ds = sn.scale(dndi).subtract(di);
        return ds;
    }

}