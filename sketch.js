let song;
let fft;
let particles = [];


function preload() {
    song = loadSound("Ambiance.mp3")
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES)
    song.setVolume(0.3)
    fft = new p5.FFT()
}

function draw() {
    background(30, 30, 40);
    translate(width / 2, height/2)
    strokeWeight(1);
    
    fft.analyze()
    amp = fft.getEnergy(20, 200)
    
    var p = new Particle()
    particles.push(p);

    for (var i = particles.length - 1; i >= 0; i--){
        if (!particles[i].edges()) {
            particles[i].update(amp > 235)
            particles[i].show()
            particles[i].lines(particles)
            particles[i].repel()
        } else {
            particles.splice(i, 1)
        }
    }

    stroke(255);
    strokeWeight(2);
    noFill();

    var my = map(mouseY, 0, width, 0.5, 2)

    var spectrum = fft.linAverages(150)
    for (var t = -1; t <= 1; t += 2) {
        beginShape()
        for (var i = 0; i < spectrum.length/2; i++) {
            var angle = map(i, 0, spectrum.length/2, 0, 181);
            var amp = spectrum[i];

            var r1 = 70;
            var r2 = map(amp, 0, 255, 100, 210);

            // inner
            var x1 = r1 * sin(angle) * t;
            var y1 = r1 * cos(angle);
            
            // outer
            var x2 = r2 * sin(angle) * t;
            var y2 = r2 * cos(angle);

            line(x1, y1, x2, y2)
        }
        endShape()
    } 

    var mx = map(mouseX, width/2, width, 0.5, 3);
    var wave = fft.waveform();
    
    for (var t = -1; t <= 1; t += 2) {
        beginShape()
        for (var i = 0; i <= 180; i += 0.5) {
            var index = floor(map(i, 0, width/4, 0, wave.length - 1));

            var r = map(wave[index]*mx, -1, 1, 150, 350)
            
            var x = r * sin(i) * t;
            var y = r * cos(i);
            vertex(x, y)
        }
        endShape()
    }
    
}


class Particle {
    constructor() {
        this.pos = p5.Vector.random2D().mult(250);
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

        this.w = random(3, 5);
    }
    
    update(cond) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        if (cond) {
            this.pos.add(this.vel);
            this.pos.add(this.vel);
            this.pos.add(this.vel);
        }
    }

    edges() {
        if (this.pos.x < -width / 2 || this.pos.x > width / 2 ||
        this.pos.y < -height / 2 || this.pos.y > height / 2) {
            return true
        } else {
            return false
        }
    }

    show() {
        noStroke()
        fill(255)
        ellipse(this.pos.x, this.pos.y, this.w)
    }

    lines(particles) {
        particles.forEach(particle => {
            const d = dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
            if (d < 50) {
                stroke('rgba(255,255,255,0.2)');
                line(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
            }
        });
    }

    repel() { 
        const d = dist(this.pos.x, this.pos.y, mouseX-width/2, mouseY-height/2)
        if (d <= 150) {
            for (var i = 0; i < 7; i++) {
                this.pos.add(this.vel);
            }
        }
    }
}



function mouseClicked() {
    if (song.isPlaying()) {
        song.pause()
        noLoop()
    } else {
        song.play()
        loop()
    }
}