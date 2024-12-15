const SPEED = 5;
const ROTATION_ANGLE = 0.07
const FRICTION = 0.9
const PROJECTILE_SPEED = 8

const score = document.getElementById("score");
const finalScore = document.getElementById("final-score");

let projectiles = [];
let asteroids = [];
let player;
let started = false;
let gameIsOver = false;
let crashed = false;

const change = (from, to) => {
  document.getElementById(from).style.display = "none";
  document.getElementById(to).style.display = "";
  if (to === "game") {
    started = true;
  }
}

function reset() {
  score.innerText = 0;
  crashed = false;
  player = new Player();
  asteroids = [];
  projectiles = [];
  for (let i = 0; i < 5; i++) {
  	asteroids.push(new Asteroid());
  }
}

function setup() {
  const canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.parent('game');
  reset();
}


function draw() {
  if (crashed) {
    started = false;
    finalScore.textContent = score.innerText;
    change("game", "scoreboard");
    reset();
  }

  if (started) {
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    // fullscreen(true);
    canvas.parent('game');
    player.update();

    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i].update();
      if (!crashed && player.hit(asteroids[i])) {
        crashed = true;
      }
    }

    for (let i = 0; i < projectiles.length; ++i) {
      projectiles[i].update();
      let hit = false;

      for (let j = asteroids.length - 1; j >= 0; --j) {
        if (projectiles[i].hit(asteroids[j])) {
          score.innerText = Number(score.innerText) + Math.round(asteroids[j].r * 100);
          asteroids[j].split();
          asteroids.splice(j, 1);
          projectiles.splice(i, 1);
          --i;
          hit = true;
          break;
        }
      }

      if (!hit && projectiles[i].checkEdges()) {
        projectiles.splice(i, 1);
        --i;
      }
    }
  } 
}

class Player {
  constructor() {
    this.pos = createVector(width/2, height/2);
    this.r = 10;
    this.heading = 0;
    this.rotation = 0;
    this.vel = createVector(0, 0);
    this.speeding = false;
    this.limit = 255;
  }

  draw() {
    if (!crashed) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.heading); 
      fill(170, 1, 20, 255 - this.limit);
      strokeWeight(3);
      stroke(170, 1, 20, 220);

      beginShape();
        vertex(-10, 10);
        quadraticVertex(0, 0, -10, -10);
        vertex(20, 0);
      endShape(CLOSE);
      
      pop();
    }
  }

  update() {
    // update projectile limit
    if (frameCount % 10 == 0) {
    	this.limit += 10;
			this.limit = constrain(this.limit, 0, 255)
    }

    if (this.speeding) {
      const dir = createVector(Math.cos(this.heading), Math.sin(this.heading));
      this.vel = dir.mult(SPEED);
    } else {
      this.vel = this.vel.mult(FRICTION);
    }

    this.turn(); 
  	this.offScreen();
    
    this.pos.add(this.vel);
    this.draw();
  }

  offScreen() {
    if (this.pos.x > width + this.r) {
    	this.pos.x = 0 - this.r;
    } else if (this.pos.x < 0 - this.r) {
    	this.pos.x = width + this.r;
    } else if (this.pos.y < 0 - this.r) {
    	this.pos.y = height + this.r;
    } else if (this.pos.y > height + this.r) {
    	this.pos.y = 0 - this.r;
    }
  }

  hit(asteroid) {
  	if (this.pos.dist(asteroid.pos) < asteroid.r) {
    	return true;
    }
  }

  turn() {
  	this.heading += this.rotation;
    if (Math.abs(this.heading) >= TWO_PI) {
      if (this.heading > 0) {
      	this.heading -= TWO_PI;
      } else {
      	this.heading += TWO_PI;
      }
    }
  }

  setRotation(angle) {
  	this.rotation = angle;
  }
}

class Projectile {
  constructor(pos, heading) {
    this.pos = pos.copy();
    this.heading = heading;
    this.vel = p5.Vector.fromAngle(this.heading).mult(PROJECTILE_SPEED);
  }

  draw() {
    push();
    strokeWeight(7);
    stroke(255, 20, 20, 255);
    point(this.pos.x, this.pos.y);
    pop();
  }

  update() {
    this.draw()
    this.pos.add(this.vel);
  }

  hit(asteroid) {
    if (this.pos.dist(asteroid.pos) < asteroid.r) {
    	return true;
    }
  }

  checkEdges() {
  	return (
      this.pos.x > width ||
      this.pos.x < 0 ||
      this.pos.y > height ||
      this.pos.y < 0
    )
  }
}

class Asteroid {
  constructor(r, pos, vel) {
    if (pos) {
      this.pos = pos.copy();
      this.r = r;
      this.vel = vel;
    } else {
      // randomize entry
      if (random() > 0.5) {
        if (random() > 0.5) {
          this.pos = createVector(-100, random(height));
        } else {
          this.pos = createVector(width + 100, random(height));
        }  
      } else {
        if (random() > 0.5) {
          this.pos = createVector(random(width), -100);
        } else {
          this.pos = createVector(random(width), height + 100);
        }  
      }
      this.r = Math.floor(random(40, 90));
      this.vel = p5.Vector.random2D().mult(Math.floor(random(1, 2)));
    }

    this.rotation = random(-PI/30, PI/30);
    this.heading = 0;
    this.total = [];
    this.pts = Math.floor(random(5, 20));
    for (let i = 0; i < this.pts; i++){
      this.total.push(Math.floor(random(this.r / 8,this.r / 2)));
    }
  }

  draw() {
    push();
    fill(0);
    stroke(255);
    strokeWeight(3);
    beginShape();
    for (let i = 0; i < this.pts; i++) {
    	let angle = map(i, 0, this.pts, 0, TWO_PI);
      let x = (this.r - this.total[i]) * cos(this.heading + angle);
      let y = (this.r - this.total[i]) * sin(this.heading + angle);
      vertex(this.pos.x + x, this.pos.y + y);
    }
    endShape(CLOSE);
    pop();
  }

  update() {
    this.draw();
    this.pos.add(this.vel);
    this.heading += this.rotation;
    this.checkEdges();
  }

  checkEdges() {
  	if (this.pos.x > width + this.r) {
    	this.pos.x = 0 - this.r;
    } else if (this.pos.x < 0 - this.r) {
    	this.pos.x = width + this.r;
    } else if (this.pos.y < 0 - this.r) {
    	this.pos.y = height + this.r;
    } else if (this.pos.y > height + this.r) {
    	this.pos.y = 0 - this.r;
    }
  }

  split() {
    let newR = Math.floor(this.r / 2);
    let newPos = this.pos;
    let newVel1 = this.vel.copy();
    let newVel2 = this.vel.copy();
    newVel1.rotate(PI/4);
    newVel2.rotate(-PI/4);
    if (newR > 10) {
      asteroids.push(new Asteroid(newR, newPos, newVel1));
      asteroids.push(new Asteroid(newR, newPos, newVel2));
    } else if (random() < 0.4) {
      asteroids.push(new Asteroid());
    }
  }
}

function keyPressed() {
  if (!crashed) {
    if (key === "a") {
      player.setRotation(-ROTATION_ANGLE);
    } else if (key === "d") {
      player.setRotation(ROTATION_ANGLE);
    } else if (key === "w") {
      player.speeding = true;
    } else if (key === " ") {
      projectiles.push(new Projectile(player.pos, player.heading));
      player.limit -= 30;
    }
  }
}


function keyReleased() {
  if (key === "w") {
    player.speeding = false;
  }
  if (key !== " "){
  	player.setRotation(0);
  }
}

