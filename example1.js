let example1 = new Draw('example1');      
let angle = 0;
let renderExample1 = () => {

    requestAnimationFrame(renderExample1);
    example1.clear();
    
    let surface = new Surface(new Vec2(500, 25), new Vec2(600, 275));
    let ray = new Ray(new Vec2(50, 150), new Vec2(1, 0).rotate(Math.cos(angle) * Math.PI / 16)
        .normalize()
        .scale(25));

    let longRay = new Ray(new Vec2(50, 150), new Vec2(1, 0).rotate(Math.cos(angle) * Math.PI / 16)
        .normalize()
        .scale(new Vec2(example1.canvas.width, example1.canvas.height).length()),
        'gray');

    drawSurface(surface, example1);
    
    let intersection = longRay.intersect(surface.toRay());

    if(intersection) {

        example1.width(2);
        example1.color('red');
        example1.line(ray.pos.add(ray.dir), intersection);

        let sn = surface.toRay().dir.normal().normalize();
        example1.width(1);
        example1.color('gray');

        example1.ctx.setLineDash([5, 3])
        example1.line(intersection, intersection.add(sn.scale(100)));
        example1.ctx.setLineDash([1, 0])

        let di = longRay.dir;
        let dndi = 2 * sn.dot(di);
        let ds = sn.scale(dndi).subtract(di);

        let reflectionRay = new Ray(intersection, 
            ds.normalize().scale(-new Vec2(example1.canvas.width, example1.canvas.height).length()));
        drawRay(reflectionRay, example1);

        let angle = sn.angle(longRay.dir);

    }
    else drawRay(longRay, example1);
    
    drawRay(ray, example1);
    angle += 0.01;
};

renderExample1();