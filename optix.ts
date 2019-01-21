class Optix {
    
    scene: Scene;
    out: CanvasDraw;
    frame: number = 0;

    constructor(public element: string, width: number = window.innerWidth, height: number = window.innerHeight) { 

        this.out = new CanvasDraw(element, width, height);
        this.render();
        console.log('Optix initialized.');
    }

    render() {

        requestAnimationFrame(() => this.render());
        if(!this.scene) return;

        this.frame++;
        this.out.clear();
        this.scene.animateShapes();
        this.scene.drawShapes(this.out);
        this.scene.traceRays(this.out);
        this.scene.drawLights(this.out);
        this.out.flush();
    }

    static createScene() {
        return new Scene();
    }

    static createMedium() {
        return new Medium();
    }

    static createLaser(pos: Vec2, rot: number = 0, scale: number = 1, color: Vec3) {
        return new Laser(pos, rot, scale, color);
    }

    static createSpotLight() {
        throw new Error("Not implemented.");
    }

    static createDirectionalLight() {
        throw new Error("Not implemented.");
    }

    static createTriangle(pos: Vec2, rot: number = 0, scale: number, medium: Medium, color: Vec3): Triangle {
        return new Triangle(pos, rot, scale, medium, color);
    }

    static createRectangle(pos: Vec2, rot: number, scale: number, medium: Medium, color: Vec3, dimension: Vec2) {
        return new Rectangle(pos, rot, scale, medium, color, dimension);
    }

}

class Scene {

    lights: Light[];
    shapes: Shape[];

    constructor() {
        this.lights = [];
        this.shapes = [];
    }

    animateShapes() {
        for(let shape of this.shapes) {
            if(shape.animation) {
                shape.animate();
            }
        }
    }

    drawShapes(out: CanvasDraw) {

        for(let shape of this.shapes) {
            out.setColor(shape.color.toRgb());
            out.setStyle(DrawStyle.Stroke);
            let segments = shape.getLineSegments();
            for(let segment of segments) {
                out.line(segment.p1, segment.p2);

                // draw normals
                // let midline = segment.p1.add(segment.p2).scale(0.5);
                // out.point(midline);
                // let dn = segment.toRay().dir.normal().normalize();
                // out.line(midline, midline.add(dn.scale(25)));
            }
            out.setStyle(DrawStyle.Fill);
            if(shape.fill) {
                out.setColor(new Vec4(shape.fillColor, shape.fillAlpha).toRgba());
                out.setStyle(DrawStyle.Fill);
                out.polygon(shape.getPolygon());
            }
        }
    }

    drawLights(out: CanvasDraw) {
        out.setStyle(DrawStyle.Fill);
        out.setColor('gray');
        for(let light of this.lights) {
            if(light instanceof Laser) {
                out.rect(light.pos.subtract(new Vec2(1).scale(4)), new Vec2(8, -8));
            }
        }
    }

    traceRays(out: CanvasDraw) {

        for(let light of this.lights) {
            out.setColor('red');
            let rays = light.getRays();
            for(let ray of rays) {
                ray.dir = ray.dir.scale(new Vec2(out.canvas.width, out.canvas.height).lengthSq());
                this.trace(ray, out);
            }
        }

    }

    trace(ray: Ray, out: CanvasDraw, stackIndex = 0) {

        if(stackIndex == 64) return;

        let closestHit: Hit;
        let closestShape: Shape;

        for(let shape of this.shapes) {
            for(let segment of shape.getLineSegments()) {
                let hit = ray.intersect(segment.toRay());
                if(hit.hit && (!closestHit || closestHit.dist > hit.dist)) {
                    closestHit = hit;
                    closestShape = shape;
                }
            }
        }

        if(closestHit) {

            let hit = closestHit;
            out.line(ray.pos, hit.pos);

            if(closestShape.medium.absorb) {
                return;
            }
            if(closestShape.medium.reflect) {
                let dr = ray.reflect(hit.trg.dir);
                let reflectedRay = new Ray(hit.pos, dr.scale(new Vec2(out.canvas.width, out.canvas.height).lengthSq()));
                this.trace(reflectedRay, out, stackIndex + 1);
            }
            if(closestShape.medium.refract) {

            }
        }
        else {
            out.line(ray.pos, ray.pos.add(ray.dir));
        }
    }
}

interface Transform {

    pos: Vec2;
    rot: number;
    scale: number;

}

class Light implements Transform {

    constructor(public pos: Vec2, public rot: number, public scale: number, public color: Vec3) { }

    getRays(): Ray[] {

        throw new Error("Method not implemented.");
    }

}

class Laser extends Light {

    constructor(public pos: Vec2, public rot: number, public scale: number, public color: Vec3) 
    { super(pos, rot, scale, color); }

    getRays(): Ray[] {
        return [new Ray(this.pos, new Vec2(1, 0).rotate(this.rot))];
    }
}

class SpotLight extends Light {

    constructor(public pos: Vec2, public rot: number, public scale: number, public color: Vec3, 
        public rays: number = 1, public angle: number = 0) 
    { super(pos, rot, scale, color); }

    getRays(): Ray[] {
        throw new Error("Method not implemented.");
    }
}

class DirectionalLight extends Light {

    constructor(public pos: Vec2, public rot: number, public scale: number, public color: Vec3, 
        public rays: number = 1, public spacing: number = 0) 
    { super(pos, rot, scale, color); }
    
    getRays(): Ray[] {
        throw new Error("Method not implemented.");
    }

}

interface Animate<T> {

    animation: Function;
    animate();

}

class Shape implements Transform, Animate<Shape> {

    fill: boolean = false;
    fillColor: Vec3;
    fillAlpha: number = 1;
    animation: Function;
    
    constructor(public pos: Vec2, public rot: number = 0, public scale: number = 1, public medium: Medium, public color: Vec3) { }

    getLineSegments(): LineSegment[] {
        throw new Error("Method not implemented.");
    }

    getPolygon(): Vec2[] {
        throw new Error("Method not implemented.");
    }

    animate() {
        if(this.animation)
            this.animation(this);
    }
}

class Triangle extends Shape {

    constructor(public pos: Vec2, public rot: number = 0, public scale: number = 1, public medium: Medium, public color: Vec3) 
    { super(pos, rot, scale, medium, color); }

    generator = (r) => new Vec2(this.scale * Math.cos(2*Math.PI*r), this.scale * Math.sin(2*Math.PI*r));

    getLineSegments(): LineSegment[] {
        let p1 = this.generator(1/3 + this.rot).add(this.pos);
        let p2 = this.generator(2/3 + this.rot).add(this.pos);
        let p3 = this.generator(3/3 + this.rot).add(this.pos);
        return [new LineSegment(p1, p3), new LineSegment(p3, p2), new LineSegment(p2, p1)]
    }

    getPolygon(): Vec2[] {
        let p1 = this.generator(1/3 + this.rot).add(this.pos);
        let p2 = this.generator(2/3 + this.rot).add(this.pos);
        let p3 = this.generator(3/3 + this.rot).add(this.pos);
        return [p1, p2, p3];
    }
}


class Rectangle extends Shape {

    constructor(public pos: Vec2, public rot: number = 0, public scale: number = 1, public medium: Medium, public color: Vec3, public dimension: Vec2) 
    { super(pos, rot, scale, medium, color); }

    generator = (t) => new Vec2(this.dimension.x*this.scale*Math.cos(2*Math.PI*t), this.dimension.y*this.scale*Math.sin(2*Math.PI*t));

    getLineSegments(): LineSegment[] {
        let p1 = this.generator(1/4 + 1/8).add(this.pos);
        let p2 = this.generator(2/4 + 1/8).add(this.pos);
        let p3 = this.generator(3/4 + 1/8).add(this.pos);
        let p4 = this.generator(4/4 + 1/8).add(this.pos);
        return [new LineSegment(p1, p4), new LineSegment(p4, p3), new LineSegment(p3, p2), new LineSegment(p2, p1)];
    }

    getPolygon(): Vec2[] {
        let p1 = this.generator(1/4 + 1/8).add(this.pos);
        let p2 = this.generator(2/4 + 1/8).add(this.pos);
        let p3 = this.generator(3/4 + 1/8).add(this.pos);
        let p4 = this.generator(4/4 + 1/8).add(this.pos);
        return [p1, p2, p3, p4];
    }
}

// A line segment is defined between two points: p1 and p2.
class LineSegment {

    constructor(public p1: Vec2, public p2: Vec2) { }

    toRay(): Ray {
        return new Ray(this.p1, this.p2.subtract(this.p1));
    }

}

interface Hit {
    hit: boolean;
    pos: Vec2;
    src: Ray;
    trg: Ray;
    dist: number;
}

// A ray has a position `pos`, and a direction `dir. The paramatric
// form of the ray is p + tr.
class Ray {

    constructor(public pos: Vec2, public dir: Vec2) { }

    toLineSegment(): LineSegment {
        return new LineSegment(this.pos, this.pos.add(this.dir));
    }

    pointAt(t: number): Vec2 {
        return this.pos.add(this.dir.scale(t));
    }
    
    normalize(): Ray {
        return new Ray(this.pos, this.dir.normalize());
    }
    
    intersect(ray: Ray): Hit {
    
        let eps = 0.0000000001;
        let t = ray.pos.subtract(this.pos).cross(this.dir) / this.dir.cross(ray.dir);
        let u = ray.pos.subtract(this.pos).cross(ray.dir) / this.dir.cross(ray.dir);

        if(ray.dir.cross(this.dir) != 0 && t >= 0 && t <= 1 && u - eps >= 0 && u + eps <= 1) {
            let p = this.pos.add(this.dir.scale(u))
            return { hit: true, pos: p, src: this, trg: ray, dist: this.pos.subtract(p).length() };
        } 
        
        return { hit: false, pos: undefined, src: this, trg: undefined, dist: undefined };
    }
    
    reflect(surfaceNormal: Vec2): Vec2 {
    
        let sn = surfaceNormal.normalize();
        let di = this.dir.normalize();
        let dndi = 2 * sn.dot(di);
        let ds = sn.scale(dndi).subtract(di);
        return ds;
    }

    refract(surfaceNormal: Vec2): Vec2 {
        return this.dir;
    }

}

// The medium contains all the possible parameters that
// affects how a ray of light interacts with a shape.
//
// When a ray of light hits the medium, three things can occur:
//
//  1. The light is reflected. If the light is reflected at equal
//     angles, this is a specular reflection. The `diffuseFactor`
//     adds a random offset to the angle of reflection, which
//     makes the reflection diffuse.
//  
//  2. The light is refracted. The refracted angle is calculated
//     based on the refractive index.
//
//  3. The light is absorbed. This is not implement yet.
class Medium {

    reflect: boolean;
    diffuseFactor: number;

    refract: boolean;
    refractiveIndex: number;

    absorb: boolean;
    absorptionRate: number;

    static GetMirror(): Medium {
        let m = new Medium();
        m.reflect = true;
        m.diffuseFactor = 0;
        return m;
    }

    static GetWater(): Medium {
        let m = new Medium();
        m.refract = true;
        m.refractiveIndex = 1.33;
        return m;
    }

}

// Vector of two components, used for the geometry.
class Vec2 { 

    constructor(public x: number, public y: number = x) { }

    add(other: Vec2) : Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vec2) : Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    scale(scalar: number) : Vec2 {
        return new Vec2(scalar * this.x, scalar * this.y);
    }

    dot(other: Vec2) : number {
        return this.x * other.x + this.y * other.y;
    }

    lengthSq() : number {
        return this.dot(this);
    }

    length() : number {
        return Math.sqrt(this.lengthSq());
    }

    normalize() : Vec2 {
        let l = this.length();
        return new Vec2(this.x / l, this.y / l);
    }

    normal() : Vec2 {
        return new Vec2(-this.y, this.x);
    }

    rotate(angle: number) : Vec2 {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new Vec2(cos * this.x + sin * this.y, -sin * this.x + cos * this.y);
    }

    angle(other: Vec2) : number {
        return Math.acos(Math.abs(this.dot(other)) / Math.sqrt(this.dot(this) + other.dot(other)));
    }

    cross(other: Vec2) : number {
        return this.x * other.y - this.y * other.x;
    }

    mix(other: Vec2, t: number) : Vec2 {
        return new Vec2(t * this.x + (1-t) * other.x, t * this.y + (1-t) * other.y)
    }
    
    apply(f) {
        return new Vec2(f(this.x), f(this.y));
    }

}

// Vector of three components, used for r, g, b colors.
// Components can be accessed with xyz or rgb.
class Vec3 {

    r: number;
    g: number;
    b: number;

    constructor(public x: number, public y: number = x, public z: number = x) { 
        this.r = x; this.g = y; this.b = z;
    }

    add(other: Vec3) : Vec3 {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other: Vec3) : Vec3 {
        return new Vec3(this.x - other.x, this.y - other.y, this.y - other.y);
    }

    scale(scalar: number) : Vec3 {
        return new Vec3(scalar * this.x, scalar * this.y, scalar * this.z);
    }

    mix(other: Vec3, t: number) : Vec3 {
        return new Vec3(t * this.x + (1-t) * other.x, t * this.y + (1-t) * other.y, t * this.z + (1-t) * other.z)
    }

    toRgb(): string {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }

    static fromHex(hex: string): Vec3 {

        if (hex.length != 6) {
            console.warn("Hex color '" + hex + "' must be 6 characters.");
            return;
        }

        let r = '0x' + hex.substring(0, 2);
        let g = '0x' + hex.substring(2, 4);
        let b = '0x' + hex.substring(4, 6);
        return new Vec3(parseInt(r), parseInt(g), parseInt(b));
    }

}

// Vector of four components, used for an alpha channel.
class Vec4 {
    constructor(public u: Vec3, public w: number) { }
    toRgba(): string {
        return 'rgba(' + this.u.r + ', ' + this.u.g + ', ' + this.u.b + ',' + this.w + ')';
    }
}

// Wrapper for drawing with canvas.
class CanvasDraw {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    drawStyle: DrawStyle = DrawStyle.Stroke;

    bufferCanvas: HTMLCanvasElement;
    bufferCtx: CanvasRenderingContext2D;

    constructor(public element, public width = 650, public height = 300) {
        this.canvas = <HTMLCanvasElement>document.getElementById(element);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas element initialized on ' + element);
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
        this.bufferCtx = this.bufferCanvas.getContext('2d');
    }

    flush() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.bufferCanvas, 0, 0);
    }

    setColor(c: string) {
        this.bufferCtx.fillStyle = c;
        this.bufferCtx.strokeStyle = c;
    }

    setStyle(ds: DrawStyle) {
        this.drawStyle = ds;
    }

    setWidth(w: number){
        this.bufferCtx.lineWidth = w;
    }

    line(p1: Vec2, p2: Vec2) {
        this.bufferCtx.beginPath();
        this.bufferCtx.moveTo(p1.x, this.canvas.height-p1.y);
        this.bufferCtx.lineTo(p2.x, this.canvas.height-p2.y);
        this.bufferCtx.stroke();
    }

    point(p: Vec2, r: number = 2) {
        this.bufferCtx.beginPath();
        this.bufferCtx.arc(p.x, this.canvas.height-p.y, r, 0, 2*Math.PI);
        if(this.drawStyle == DrawStyle.Fill) this.bufferCtx.fill();
        else this.bufferCtx.stroke();
    }

    rect(p: Vec2, d: Vec2) {
        if(this.drawStyle == DrawStyle.Fill) this.bufferCtx.fillRect(p.x, this.canvas.height-p.y, d.x, d.y);
        else this.bufferCtx.strokeRect(p.x, this.canvas.height-p.y, d.x, d.y);
    }

    polygon(ps: Vec2[]) {
        this.bufferCtx.beginPath();
        this.bufferCtx.moveTo(ps[0].x, this.canvas.height-ps[0].y);
        for(let i=1; i < ps.length; i++) {
            this.bufferCtx.lineTo(ps[i].x, this.canvas.height-ps[i].y);
        }
        this.bufferCtx.lineTo(ps[0].x, this.canvas.height-ps[0].y);
        if(this.drawStyle == DrawStyle.Fill) this.bufferCtx.fill();
        else this.bufferCtx.stroke();
    }

    clear() {
        this.bufferCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}

enum DrawStyle {
    Stroke,
    Fill
}
