{

    let optix = new Optix('example2', 650, 300);
    optix.scene = Optix.createScene();
    
    let medium = Optix.createMedium();
    medium.reflect = true;
    medium.refract = true;
    
    //let shape = Optix.createRectangle(new Vec2(450, 150), -Math.PI/4, 190, medium, Vec3.fromHex('4520fc'), new Vec2(0.5, 0.85).normalize());
    let shape = Optix.createTriangle(new Vec2(500, 150), Math.PI/3, 100, medium, Vec3.fromHex('4520fc'));
    shape.animation = (s) => { 
        s.rot += 0.001; 
        s.medium.refractiveIndex = (Math.cos(s.rot) * 0.5 + 0.5) * 2 + 1; // Range the refractive index between [1, 3].
    }
    shape.fill = true;
    shape.fillColor = Vec3.fromHex('4520fc');
    shape.fillAlpha = 0.25;

    let nLasers = 10;
    let spacing = 8;

    for(let i=0; i <= nLasers; i++){
        optix.scene.lights.push(Optix.createLaser(new Vec2(50, 150 - nLasers * spacing / 2 + i*spacing), 0, Vec3.fromHex('ff0000')));
    }
   
    optix.out.setWidth(1);
    optix.scene.shapes.push(shape);

};