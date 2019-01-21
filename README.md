# Geometric Optics

This repository contains various things that I've created while studying Geometric Optics.

 * [Document with Wikipedia information](https://darkeclipz.github.io/learn_optics/optics.html) describing each topic concisely.
 * Implementation of a JavaScript optics engine (Optix) with HTML canvas.

# Applications

The following list are three ideas that I'm working on when I have time.

 * Implement a 2D optics engine.
 * Implement a 3D ray tracer.
 * Implement a 3D spectral ray tracer, see reference 6.

# Optix API

The API documentation for Optix will be added here.

## Getting started

First you need to include `optix.js` into your HTML page.

```html
<script src="optix.js"></script>
```

Also add a `canvas` element. To initialize an example scene in Optix:

```javascript
let optix = new Optix('canvas', 650, 300);
optix.scene = Optix.createScene();

let medium = Optix.createMedium();
medium.reflect = true;

let light = Optix.createLaser(new Vec2(50, 150), 0, Vec3.fromHex('ff0000'));
optix.scene.lights.push(light);

let shape = Optix.createTriangle(new Vec2(500, 150), 
    Math.PI/3, 100, medium, Vec3.fromHex('4520fc'));
shape.animation = (s) => s.rot += 0.001;
shape.fill = true;
shape.fillColor = Vec3.fromHex('4520fc');
shape.fillAlpha = 0.25;
optix.scene.shapes.push(shape);
```

## Scene

A scene holds all the functions to have all the components interact within a scene. An instance always requires a scene. A scene can be created in the following way:

```javascript
let scene = Optix.createScene();
```

The scene keeps track of the following objects:

 * `lights` as a list.
 * `shapes` as a list.

### Initialization example

This example shows how to initialize Optix.

```javscript
let optix = new Optix('canvas');
optix.scene = Optix.createScene();
optix.scene.lights.push(new Light(...));
optix.scene.shapes.push(new Shape(...));
```

At this moment, the scene should be rendered.

## Lights

Light are sources of rays that are traced throughout a scene. The path that a ray takes is rendered on the screen.

### Laser

A laser light is a single beam of light that has a position and is pointed towards a direction. 

To create a new laser light, and add it to the scene:

```javascript
let laser = Optix.createLaser(pos; Vec2, rot, color: Vec3);
optix.scene.lights.push(laser);
```

## Mediums

Medium determine how the physics should behave when it collides with a shape. 

```javascript
let medium = Optix.createMedium();
```

### Reflection

Set the `reflect` parameter to `true` to enable reflection. If the `diffuseFactor` is `0` the reflection is specular. Increasing the `diffuseFactor` will make the reflection more diffuse.

```javascript
let medium = Optix.createMedium();
medium.reflect = true;
medium.diffuseFactor = 0;
```

### Refraction

Set the `refract` parameter to `true` to enable refraction. Based on the `refractiveIndex`, the refractive ray will be calculated through the medium.

```javascript
let medium = Optix.createMedium();
medium.refract = true;
medium.refractiveIndex = 1.33; // water
```

### Absorbing

Set the `absorb` parameter to `true` to absorb all the incident rays.

```javascript
let medium = Optix.createMedium();
medium.absorb = true;
```

## Shapes

Shapes can be used to add different objects to the scene. Every shape has a medium attached to it. Based on the type of medium that is attached to the shape the physics will behave differently.

### Triangle

The first shape is a triangle. Triangles can be used to create prisms. 

To create a new triangle and add it to the scene:

```javascript
let triangle = Optix.createTriangle(pos: Vec2, rot: number, scale: number, 
    medium: number, color: Vec3);

optix.scene.shapes.push(triangle);
```

# Example

This is a list of a few examples:

 * [Law of Reflection](https://darkeclipz.github.io/learn_optics/example_optix.html)

# References

 1. https://en.wikipedia.org/wiki/Specular_reflection
 2. https://en.wikipedia.org/wiki/Refraction
 3. https://en.wikipedia.org/wiki/Refractive_index
 4. https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/565282#565282
 5. https://www.khanacademy.org/science/physics/geometric-optics
 6. https://people.eecs.berkeley.edu/~cecilia77/graphics/a6/#part2