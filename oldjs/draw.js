class Draw {

    constructor(element, width = 650, height = 300) {
        this.canvas = document.getElementById(element);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas element initialized on ' + element);
    }

    color(c) {
        this.ctx.fillStyle = c;
        this.ctx.strokeStyle = c;
    }

    width(px) {
        this.ctx.lineWidth = px;
    }

    line(p1, p2) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, this.canvas.height-p1.y);
        this.ctx.lineTo(p2.x, this.canvas.height-p2.y);
        this.ctx.stroke();
    }

    point(p, r=2) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, this.canvas.height-p.y, r, 0, 2*Math.PI);
        this.ctx.stroke();
    }

    rect(p, d) {
        this.ctx.strokeRect(p.x, this.canvas.height-p.y, d.x, d.y);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}

let drawSurface = (s, out) => { 
    out.color(s.color); 
    out.width(4);
    out.line(s.p1, s.p2) 
};

let drawRay = (r, out) => { 
    out.color(r.color); 
    out.width(2);
    out.line(r.pos, r.pos.add(r.dir)); 
    let d = 6;
    let top = new Ray(r.pos.add(r.dir.normalize().normal().scale(d)), r.dir);
    let bottom = new Ray(r.pos.subtract(r.dir.normalize().normal().scale(d)), r.dir);
    let t = r.dir.length() - d;
    out.line(top.normalize().pointAt(t), r.pos.add(r.dir));
    out.line(bottom.normalize().pointAt(t), r.pos.add(r.dir));
    out.width(1);
    out.line(top.normalize().pointAt(t), r.pos.add(r.dir));
    out.line(bottom.normalize().pointAt(t), r.pos.add(r.dir));
    out.width(2);
    out.point(r.pos); 
};