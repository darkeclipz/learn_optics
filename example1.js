{

    const COLOR_RED = Vec3.fromHex('fc4520');
    const COLOR_BLUE = Vec3.fromHex('4520fc');
    const COLOR_YELLOW = Vec3.fromHex('d7fc20');
    const COLOR_PURPLE = Vec3.fromHex('6200ee');
    const COLOR_CYANGREEN = Vec3.fromHex('03dac6')
    const COLOR_BLACK = new Vec3(0);
    
    let optix = new Optix('example1', 650, 300);
    optix.scene = Optix.createScene();
    
    let reflectiveMedium = Optix.createMedium();
    reflectiveMedium.reflect = true;
    
    let absorbingMedium = Optix.createMedium();
    absorbingMedium.absorb = true;
    
    let triangle = Optix.createTriangle(new Vec2(525, 150), 0, 100, reflectiveMedium, COLOR_BLUE);
    triangle.fill = true;
    triangle.fillColor = COLOR_BLUE;
    triangle.fillAlpha = 0.25;
    triangle.animation = (tri) => tri.rot += 0.0005;
    
    let stri1 = Optix.createTriangle(new Vec2(350, 100), 0, 50, reflectiveMedium, COLOR_BLUE);
    stri1.fill = true;
    stri1.fillColor = COLOR_BLUE;
    stri1.fillAlpha = 0.25;
    stri1.animation = (tri) => tri.rot += 0.0007;
    
    let stri2 = Optix.createTriangle(new Vec2(200, 200), 0, 50, absorbingMedium, COLOR_BLACK);
    stri2.fill = true;
    stri2.fillColor = COLOR_BLACK;
    stri2.fillAlpha = 0.25;
    stri2.animation = (tri) => tri.rot += 0.0009;
    
    let nLasers = 24;
    let spaceLasers = 8;
    let pos = new Vec2(50, 150);
    pos.y -= nLasers * spaceLasers / 2;
    for(let i=0; i <= nLasers; i++) {
        let laser = Optix.createLaser(pos.add(new Vec2(0, i*spaceLasers).apply(Math.floor)), 0, Vec3.fromHex('ff0000'));
        optix.scene.lights.push(laser);
    }
    
    optix.out.setWidth(1);
    optix.scene.shapes.push(stri1);
    optix.scene.shapes.push(stri2);
    optix.scene.shapes.push(triangle);

};