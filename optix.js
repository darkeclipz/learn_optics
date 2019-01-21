var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Optix = /** @class */ (function () {
    function Optix(element, width, height) {
        if (width === void 0) { width = window.innerWidth; }
        if (height === void 0) { height = window.innerHeight; }
        this.element = element;
        this.frame = 0;
        this.out = new CanvasDraw(element, width, height);
        this.render();
        console.log('Optix initialized.');
    }
    Optix.prototype.render = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.render(); });
        if (!this.scene)
            return;
        this.frame++;
        this.out.clear();
        this.scene.animateShapes();
        this.scene.drawShapes(this.out);
        this.scene.traceRays(this.out);
        this.scene.drawLights(this.out);
        this.out.flush();
    };
    Optix.createScene = function () {
        return new Scene();
    };
    Optix.createMedium = function () {
        return new Medium();
    };
    Optix.createLaser = function (pos, rot, scale, color) {
        if (rot === void 0) { rot = 0; }
        if (scale === void 0) { scale = 1; }
        return new Laser(pos, rot, scale, color);
    };
    Optix.createSpotLight = function () {
        throw new Error("Not implemented.");
    };
    Optix.createDirectionalLight = function () {
        throw new Error("Not implemented.");
    };
    Optix.createTriangle = function (pos, rot, scale, medium, color) {
        if (rot === void 0) { rot = 0; }
        return new Triangle(pos, rot, scale, medium, color);
    };
    Optix.createRectangle = function (pos, rot, scale, medium, color, dimension) {
        return new Rectangle(pos, rot, scale, medium, color, dimension);
    };
    return Optix;
}());
var Scene = /** @class */ (function () {
    function Scene() {
        this.lights = [];
        this.shapes = [];
    }
    Scene.prototype.animateShapes = function () {
        for (var _i = 0, _a = this.shapes; _i < _a.length; _i++) {
            var shape = _a[_i];
            if (shape.animation) {
                shape.animate();
            }
        }
    };
    Scene.prototype.drawShapes = function (out) {
        for (var _i = 0, _a = this.shapes; _i < _a.length; _i++) {
            var shape = _a[_i];
            out.setColor(shape.color.toRgb());
            out.setStyle(DrawStyle.Stroke);
            var segments = shape.getLineSegments();
            for (var _b = 0, segments_1 = segments; _b < segments_1.length; _b++) {
                var segment = segments_1[_b];
                out.line(segment.p1, segment.p2);
                // draw normals
                // let midline = segment.p1.add(segment.p2).scale(0.5);
                // out.point(midline);
                // let dn = segment.toRay().dir.normal().normalize();
                // out.line(midline, midline.add(dn.scale(25)));
            }
            out.setStyle(DrawStyle.Fill);
            if (shape.fill) {
                out.setColor(new Vec4(shape.fillColor, shape.fillAlpha).toRgba());
                out.setStyle(DrawStyle.Fill);
                out.polygon(shape.getPolygon());
            }
        }
    };
    Scene.prototype.drawLights = function (out) {
        out.setStyle(DrawStyle.Fill);
        out.setColor('gray');
        for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
            var light = _a[_i];
            if (light instanceof Laser) {
                out.rect(light.pos.subtract(new Vec2(1).scale(4)), new Vec2(8, -8));
            }
        }
    };
    Scene.prototype.traceRays = function (out) {
        for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
            var light = _a[_i];
            out.setColor('red');
            var rays = light.getRays();
            for (var _b = 0, rays_1 = rays; _b < rays_1.length; _b++) {
                var ray = rays_1[_b];
                ray.dir = ray.dir.scale(new Vec2(out.canvas.width, out.canvas.height).lengthSq());
                this.trace(ray, out);
            }
        }
    };
    Scene.prototype.trace = function (ray, out, stackIndex) {
        if (stackIndex === void 0) { stackIndex = 0; }
        if (stackIndex == 64)
            return;
        var closestHit;
        var closestShape;
        for (var _i = 0, _a = this.shapes; _i < _a.length; _i++) {
            var shape = _a[_i];
            for (var _b = 0, _c = shape.getLineSegments(); _b < _c.length; _b++) {
                var segment = _c[_b];
                var hit = ray.intersect(segment.toRay());
                if (hit.hit && (!closestHit || closestHit.dist > hit.dist)) {
                    closestHit = hit;
                    closestShape = shape;
                }
            }
        }
        if (closestHit) {
            var hit = closestHit;
            out.line(ray.pos, hit.pos);
            if (closestShape.medium.absorb) {
                return;
            }
            if (closestShape.medium.reflect) {
                var dr = ray.reflect(hit.trg.dir);
                var reflectedRay = new Ray(hit.pos, dr.scale(new Vec2(out.canvas.width, out.canvas.height).lengthSq()));
                this.trace(reflectedRay, out, stackIndex + 1);
            }
            if (closestShape.medium.refract) {
            }
        }
        else {
            out.line(ray.pos, ray.pos.add(ray.dir));
        }
    };
    return Scene;
}());
var Light = /** @class */ (function () {
    function Light(pos, rot, scale, color) {
        this.pos = pos;
        this.rot = rot;
        this.scale = scale;
        this.color = color;
    }
    Light.prototype.getRays = function () {
        throw new Error("Method not implemented.");
    };
    return Light;
}());
var Laser = /** @class */ (function (_super) {
    __extends(Laser, _super);
    function Laser(pos, rot, scale, color) {
        var _this = _super.call(this, pos, rot, scale, color) || this;
        _this.pos = pos;
        _this.rot = rot;
        _this.scale = scale;
        _this.color = color;
        return _this;
    }
    Laser.prototype.getRays = function () {
        return [new Ray(this.pos, new Vec2(1, 0).rotate(this.rot))];
    };
    return Laser;
}(Light));
var SpotLight = /** @class */ (function (_super) {
    __extends(SpotLight, _super);
    function SpotLight(pos, rot, scale, color, rays, angle) {
        if (rays === void 0) { rays = 1; }
        if (angle === void 0) { angle = 0; }
        var _this = _super.call(this, pos, rot, scale, color) || this;
        _this.pos = pos;
        _this.rot = rot;
        _this.scale = scale;
        _this.color = color;
        _this.rays = rays;
        _this.angle = angle;
        return _this;
    }
    SpotLight.prototype.getRays = function () {
        throw new Error("Method not implemented.");
    };
    return SpotLight;
}(Light));
var DirectionalLight = /** @class */ (function (_super) {
    __extends(DirectionalLight, _super);
    function DirectionalLight(pos, rot, scale, color, rays, spacing) {
        if (rays === void 0) { rays = 1; }
        if (spacing === void 0) { spacing = 0; }
        var _this = _super.call(this, pos, rot, scale, color) || this;
        _this.pos = pos;
        _this.rot = rot;
        _this.scale = scale;
        _this.color = color;
        _this.rays = rays;
        _this.spacing = spacing;
        return _this;
    }
    DirectionalLight.prototype.getRays = function () {
        throw new Error("Method not implemented.");
    };
    return DirectionalLight;
}(Light));
var Shape = /** @class */ (function () {
    function Shape(pos, rot, scale, medium, color) {
        if (rot === void 0) { rot = 0; }
        if (scale === void 0) { scale = 1; }
        this.pos = pos;
        this.rot = rot;
        this.scale = scale;
        this.medium = medium;
        this.color = color;
        this.fill = false;
        this.fillAlpha = 1;
    }
    Shape.prototype.getLineSegments = function () {
        throw new Error("Method not implemented.");
    };
    Shape.prototype.getPolygon = function () {
        throw new Error("Method not implemented.");
    };
    Shape.prototype.animate = function () {
        if (this.animation)
            this.animation(this);
    };
    return Shape;
}());
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle(pos, rot, scale, medium, color) {
        if (rot === void 0) { rot = 0; }
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, pos, rot, scale, medium, color) || this;
        _this.pos = pos;
        _this.rot = rot;
        _this.scale = scale;
        _this.medium = medium;
        _this.color = color;
        _this.generator = function (r) { return new Vec2(_this.scale * Math.cos(2 * Math.PI * r), _this.scale * Math.sin(2 * Math.PI * r)); };
        return _this;
    }
    Triangle.prototype.getLineSegments = function () {
        var p1 = this.generator(1 / 3 + this.rot).add(this.pos);
        var p2 = this.generator(2 / 3 + this.rot).add(this.pos);
        var p3 = this.generator(3 / 3 + this.rot).add(this.pos);
        return [new LineSegment(p1, p3), new LineSegment(p3, p2), new LineSegment(p2, p1)];
    };
    Triangle.prototype.getPolygon = function () {
        var p1 = this.generator(1 / 3 + this.rot).add(this.pos);
        var p2 = this.generator(2 / 3 + this.rot).add(this.pos);
        var p3 = this.generator(3 / 3 + this.rot).add(this.pos);
        return [p1, p2, p3];
    };
    return Triangle;
}(Shape));
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(pos, rot, scale, medium, color, dimension) {
        if (rot === void 0) { rot = 0; }
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, pos, rot, scale, medium, color) || this;
        _this.pos = pos;
        _this.rot = rot;
        _this.scale = scale;
        _this.medium = medium;
        _this.color = color;
        _this.dimension = dimension;
        _this.generator = function (t) { return new Vec2(_this.dimension.x * _this.scale * Math.cos(2 * Math.PI * t), _this.dimension.y * _this.scale * Math.sin(2 * Math.PI * t)); };
        return _this;
    }
    Rectangle.prototype.getLineSegments = function () {
        var p1 = this.generator(1 / 4 + 1 / 8).add(this.pos);
        var p2 = this.generator(2 / 4 + 1 / 8).add(this.pos);
        var p3 = this.generator(3 / 4 + 1 / 8).add(this.pos);
        var p4 = this.generator(4 / 4 + 1 / 8).add(this.pos);
        return [new LineSegment(p1, p4), new LineSegment(p4, p3), new LineSegment(p3, p2), new LineSegment(p2, p1)];
    };
    Rectangle.prototype.getPolygon = function () {
        var p1 = this.generator(1 / 4 + 1 / 8).add(this.pos);
        var p2 = this.generator(2 / 4 + 1 / 8).add(this.pos);
        var p3 = this.generator(3 / 4 + 1 / 8).add(this.pos);
        var p4 = this.generator(4 / 4 + 1 / 8).add(this.pos);
        return [p1, p2, p3, p4];
    };
    return Rectangle;
}(Shape));
// A line segment is defined between two points: p1 and p2.
var LineSegment = /** @class */ (function () {
    function LineSegment(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    LineSegment.prototype.toRay = function () {
        return new Ray(this.p1, this.p2.subtract(this.p1));
    };
    return LineSegment;
}());
// A ray has a position `pos`, and a direction `dir. The paramatric
// form of the ray is p + tr.
var Ray = /** @class */ (function () {
    function Ray(pos, dir) {
        this.pos = pos;
        this.dir = dir;
    }
    Ray.prototype.toLineSegment = function () {
        return new LineSegment(this.pos, this.pos.add(this.dir));
    };
    Ray.prototype.pointAt = function (t) {
        return this.pos.add(this.dir.scale(t));
    };
    Ray.prototype.normalize = function () {
        return new Ray(this.pos, this.dir.normalize());
    };
    Ray.prototype.intersect = function (ray) {
        var eps = 0.0000000001;
        var t = ray.pos.subtract(this.pos).cross(this.dir) / this.dir.cross(ray.dir);
        var u = ray.pos.subtract(this.pos).cross(ray.dir) / this.dir.cross(ray.dir);
        if (ray.dir.cross(this.dir) != 0 && t >= 0 && t <= 1 && u - eps >= 0 && u + eps <= 1) {
            var p = this.pos.add(this.dir.scale(u));
            return { hit: true, pos: p, src: this, trg: ray, dist: this.pos.subtract(p).length() };
        }
        return { hit: false, pos: undefined, src: this, trg: undefined, dist: undefined };
    };
    Ray.prototype.reflect = function (surfaceNormal) {
        var sn = surfaceNormal.normalize();
        var di = this.dir.normalize();
        var dndi = 2 * sn.dot(di);
        var ds = sn.scale(dndi).subtract(di);
        return ds;
    };
    Ray.prototype.refract = function (surfaceNormal) {
        return this.dir;
    };
    return Ray;
}());
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
var Medium = /** @class */ (function () {
    function Medium() {
    }
    Medium.GetMirror = function () {
        var m = new Medium();
        m.reflect = true;
        m.diffuseFactor = 0;
        return m;
    };
    Medium.GetWater = function () {
        var m = new Medium();
        m.refract = true;
        m.refractiveIndex = 1.33;
        return m;
    };
    return Medium;
}());
// Vector of two components, used for the geometry.
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        if (y === void 0) { y = x; }
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.add = function (other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    };
    Vec2.prototype.subtract = function (other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    };
    Vec2.prototype.scale = function (scalar) {
        return new Vec2(scalar * this.x, scalar * this.y);
    };
    Vec2.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
    };
    Vec2.prototype.lengthSq = function () {
        return this.dot(this);
    };
    Vec2.prototype.length = function () {
        return Math.sqrt(this.lengthSq());
    };
    Vec2.prototype.normalize = function () {
        var l = this.length();
        return new Vec2(this.x / l, this.y / l);
    };
    Vec2.prototype.normal = function () {
        return new Vec2(-this.y, this.x);
    };
    Vec2.prototype.rotate = function (angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        return new Vec2(cos * this.x + sin * this.y, -sin * this.x + cos * this.y);
    };
    Vec2.prototype.angle = function (other) {
        return Math.acos(Math.abs(this.dot(other)) / Math.sqrt(this.dot(this) + other.dot(other)));
    };
    Vec2.prototype.cross = function (other) {
        return this.x * other.y - this.y * other.x;
    };
    Vec2.prototype.mix = function (other, t) {
        return new Vec2(t * this.x + (1 - t) * other.x, t * this.y + (1 - t) * other.y);
    };
    Vec2.prototype.apply = function (f) {
        return new Vec2(f(this.x), f(this.y));
    };
    return Vec2;
}());
// Vector of three components, used for r, g, b colors.
// Components can be accessed with xyz or rgb.
var Vec3 = /** @class */ (function () {
    function Vec3(x, y, z) {
        if (y === void 0) { y = x; }
        if (z === void 0) { z = x; }
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = x;
        this.g = y;
        this.b = z;
    }
    Vec3.prototype.add = function (other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    };
    Vec3.prototype.subtract = function (other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.y - other.y);
    };
    Vec3.prototype.scale = function (scalar) {
        return new Vec3(scalar * this.x, scalar * this.y, scalar * this.z);
    };
    Vec3.prototype.mix = function (other, t) {
        return new Vec3(t * this.x + (1 - t) * other.x, t * this.y + (1 - t) * other.y, t * this.z + (1 - t) * other.z);
    };
    Vec3.prototype.toRgb = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };
    Vec3.fromHex = function (hex) {
        if (hex.length != 6) {
            console.warn("Hex color '" + hex + "' must be 6 characters.");
            return;
        }
        var r = '0x' + hex.substring(0, 2);
        var g = '0x' + hex.substring(2, 4);
        var b = '0x' + hex.substring(4, 6);
        return new Vec3(parseInt(r), parseInt(g), parseInt(b));
    };
    return Vec3;
}());
// Vector of four components, used for an alpha channel.
var Vec4 = /** @class */ (function () {
    function Vec4(u, w) {
        this.u = u;
        this.w = w;
    }
    Vec4.prototype.toRgba = function () {
        return 'rgba(' + this.u.r + ', ' + this.u.g + ', ' + this.u.b + ',' + this.w + ')';
    };
    return Vec4;
}());
// Wrapper for drawing with canvas.
var CanvasDraw = /** @class */ (function () {
    function CanvasDraw(element, width, height) {
        if (width === void 0) { width = 650; }
        if (height === void 0) { height = 300; }
        this.element = element;
        this.width = width;
        this.height = height;
        this.drawStyle = DrawStyle.Stroke;
        this.canvas = document.getElementById(element);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas element initialized on ' + element);
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = width;
        this.bufferCanvas.height = height;
        this.bufferCtx = this.bufferCanvas.getContext('2d');
    }
    CanvasDraw.prototype.flush = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.bufferCanvas, 0, 0);
    };
    CanvasDraw.prototype.setColor = function (c) {
        this.bufferCtx.fillStyle = c;
        this.bufferCtx.strokeStyle = c;
    };
    CanvasDraw.prototype.setStyle = function (ds) {
        this.drawStyle = ds;
    };
    CanvasDraw.prototype.setWidth = function (w) {
        this.bufferCtx.lineWidth = w;
    };
    CanvasDraw.prototype.line = function (p1, p2) {
        this.bufferCtx.beginPath();
        this.bufferCtx.moveTo(p1.x, this.canvas.height - p1.y);
        this.bufferCtx.lineTo(p2.x, this.canvas.height - p2.y);
        this.bufferCtx.stroke();
    };
    CanvasDraw.prototype.point = function (p, r) {
        if (r === void 0) { r = 2; }
        this.bufferCtx.beginPath();
        this.bufferCtx.arc(p.x, this.canvas.height - p.y, r, 0, 2 * Math.PI);
        if (this.drawStyle == DrawStyle.Fill)
            this.bufferCtx.fill();
        else
            this.bufferCtx.stroke();
    };
    CanvasDraw.prototype.rect = function (p, d) {
        if (this.drawStyle == DrawStyle.Fill)
            this.bufferCtx.fillRect(p.x, this.canvas.height - p.y, d.x, d.y);
        else
            this.bufferCtx.strokeRect(p.x, this.canvas.height - p.y, d.x, d.y);
    };
    CanvasDraw.prototype.polygon = function (ps) {
        this.bufferCtx.beginPath();
        this.bufferCtx.moveTo(ps[0].x, this.canvas.height - ps[0].y);
        for (var i = 1; i < ps.length; i++) {
            this.bufferCtx.lineTo(ps[i].x, this.canvas.height - ps[i].y);
        }
        this.bufferCtx.lineTo(ps[0].x, this.canvas.height - ps[0].y);
        if (this.drawStyle == DrawStyle.Fill)
            this.bufferCtx.fill();
        else
            this.bufferCtx.stroke();
    };
    CanvasDraw.prototype.clear = function () {
        this.bufferCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return CanvasDraw;
}());
var DrawStyle;
(function (DrawStyle) {
    DrawStyle[DrawStyle["Stroke"] = 0] = "Stroke";
    DrawStyle[DrawStyle["Fill"] = 1] = "Fill";
})(DrawStyle || (DrawStyle = {}));
