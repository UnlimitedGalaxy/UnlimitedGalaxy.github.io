const FOCUS_POSITION = 1200,
  SPRING = 0.01,
  FRICTION = 0.9;

class PARTICLE {
  constructor(t) {
    this.center = t, this.x = 0, this.y = 0, this.z = 0, this.vx = 0, this.vy = 0, this.vz = 0, this.nextX = 0, this.nextY = 0, this.nextZ = 0;
  }
  
  setAxis(t) {
    this.nextX = t.x, this.nextY = t.y, this.nextZ = t.z, this.color = t.color;
  }
  
  rotateX(t) {
    const i = Math.sin(t),
      e = Math.cos(t),
      s = this.nextY * e - this.nextZ * i,
      h = this.nextZ * e + this.nextY * i,
      n = this.y * e - this.z * i,
      a = this.z * e + this.y * i;
    this.nextY = s, this.nextZ = h, this.y = n, this.z = a;
  }
  
  rotateY(t) {
    const i = Math.sin(t),
      e = Math.cos(t),
      s = this.nextX * e - this.nextZ * i,
      h = this.nextZ * e + this.nextX * i,
      n = this.x * e - this.z * i,
      a = this.z * e + this.x * i;
    this.nextX = s, this.nextZ = h, this.x = n, this.z = a;
  }
  
  rotateZ(t) {
    const i = Math.sin(t),
      e = Math.cos(t),
      s = this.nextX * e - this.nextY * i,
      h = this.nextY * e + this.nextX * i,
      n = this.x * e - this.y * i,
      a = this.y * e + this.x * i;
    this.nextX = s, this.nextY = h, this.x = n, this.y = a;
  }
  
  step() {
    this.vx += (this.nextX - this.x) * SPRING, this.vy += (this.nextY - this.y) * SPRING, this.vz += (this.nextZ - this.z) * SPRING, this.vx *= FRICTION, this.vy *= FRICTION, this.vz *= FRICTION, this.x += this.vx, this.y += this.vy, this.z += this.vz;
  }
  
  getAxis2D() {
    this.step();
    const t = FOCUS_POSITION / (FOCUS_POSITION + this.z);
    return { x: this.center.x + this.x * t, y: this.center.y - this.y * t };
  }
}

const lineHeight = 7;
const praticle_count = 1e3;

function getRequestParam(t) {
  const i = t || window.location.search,
    e = {};
  if (i.indexOf('?') !== -1) {
    const t = i.substr(1).split('&');
    for (let i = 0; i < t.length; i += 1) e[t[i].split('=')[0]] = t[i].split('=')[1];
  }
  return e;
}

function color(t) {
  return `hsla(${t.h},${t.s},${t.l},${t.a})`;
}

const ArcCanvas = {};

function createArcCanvas(t) {
  const i = document.createElement('canvas'),
    e = i.getContext('2d');
  i.setAttribute('width', 40), i.setAttribute('height', 40), e.fillStyle = t, e.arc(20, 20, 20, 0, 2 * Math.PI), e.fill(), ArcCanvas[t] = i;
}

class Scene {
  constructor(t, i, e) {
    this.ctx = t, this.draw = this.draw.bind(this), this.init(i, e);
  }
  
  init(t, i) {
    this.width = t, this.height = i, this.center = {
      x: t / 2,
      y: i / 2,
    }, this.geometrys = [], this.activeGeometry = null, this.tick = 0, this.actionIndex = -1, this.particles = [];
    for (let t = 0; t < praticle_count; t++) this.particles.push(new PARTICLE(this.center));
    this.clear(), cancelAnimationFrame(this.raf);
  }
  
  clear() {
    this.ctx.fillStyle = '#010101';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  build(t) {
    this.actions = t, this.geometrys = this.actions.map(t => (t.func ? t.func : this.buildGeometry(t.texts))), this.geometrys.length && this.nextAction();
  }
  
  buildGeometry(t) {
    const i = [];
    let e = '';
    t.forEach(t => {
      e += t.text;
    });
    const s = [ +!+[] + !+[] ] + [ +[] ] + [ +[] ] | 0,
      h = ~~(s * this.height / this.width),
      n = document.createElement('canvas'),
      a = n.getContext('2d');
    n.setAttribute('width', s), n.setAttribute('height', h), a.fillStyle = '#000', a.font = 'bold 10px Arial';
    const c = a.measureText(e),
      r = Math.min(0.8 * h * 10 / lineHeight, 0.8 * s * 10 / c.width);
    a.font = `bold ${r}px Arial`;
    const o = a.measureText(e);
    let x = (s - o.width) / 2;
    const l = (h + r / 10 * lineHeight) / 2;
    return Object.values(t).forEach(t => {
      a.clearRect(0, 0, s, h), a.fillText(t.text, x, l), x += a.measureText(t.text).width;
      const e = a.getImageData(0, 0, s, h),
        n = [];
      for (let t = 0, i = e.width * e.height; t < i; t++) {
        e.data[4 * t + 3] && n.push({
          x: t % e.width / e.width,
          y: t / e.width / e.height,
        });
      }
      i.push({ color: t.hsla, points: n });
    }), i;
  }
  // 主要用来设置particle的，初始化变量
  nextAction() {
    this.actionIndex++;
    // this.actionIndex >= this.actions.length && (this.actionIndex = 0);
    this.activeGeometry = this.geometrys[this.actionIndex];
    this.tick = 0;
    this.setParticle();
  }
  
  setParticle() {
    if (typeof this.activeGeometry === 'function') {
      this.particles.forEach(t => {
        t.setAxis(this.activeGeometry(this.width, this.height));
      });
    } else {
      const t = this.activeGeometry.length;
      this.particles.forEach((i, e) => {
        let s = this.activeGeometry[e % t],
          h = s.points[~~(Math.random() * s.points.length)];
        i.setAxis({
          x: h.x * canvasWidth - this.center.x,
          y: (1 - h.y) * canvasHeight - this.center.y,
          z: ~~(30 * Math.random()),
          color: s.color,
        });
      });
    }
  }
  
  renderParticles() {
    this.particles.forEach(t => {
      const i = t.getAxis2D();
      if (this.ctx.beginPath(), getRequestParam().img === '1') this.ctx.drawImage(HeartCanvas, i.x - 15, i.y - 15, 30, 30); else {
        const e = color(t.color);
        ArcCanvas[e] || createArcCanvas(e), this.ctx.drawImage(ArcCanvas[e], i.x - 2, i.y - 2, 4, 4);
      }
    });
  }
  
  draw() {
    this.tick++;
    if ((this.actionIndex + 1) === this.actions.length && this.tick >= this.actions[this.actionIndex].lifeTime) {
      const convas = document.getElementById('mycanvas');
      convas.style.display = 'none';
      window.fireworkObj.fire();
      return null;
    }
    this.tick >= this.actions[this.actionIndex].lifeTime && this.nextAction();
    this.clear();
    this.renderParticles();
    this.raf = requestAnimationFrame(this.draw);
  }
}

let canvas,
  ctx,
  canvasWidth,
  canvasHeight,
  scene,
  img,
  HeartCanvas;

function load() {
  canvas = document.querySelector('#mycanvas'), ctx = canvas.getContext('2d'), createHeartCanvas(), reset(), (scene = new Scene(ctx, canvasWidth, canvasHeight)).build(Actions), scene.draw();
}

function createHeartCanvas() {
  HeartCanvas = document.getElementById('tulip');
}

function reset() {
  canvasWidth = window.innerWidth, canvasHeight = window.innerHeight;
  const t = window.devicePixelRatio || 1;
  canvas.width = canvasWidth * t, canvas.height = canvasHeight * t, ctx.scale(t, t), scene && scene.init(canvasWidth, canvasHeight), scene && scene.build(Actions), scene && scene.draw();
}

window.addEventListener('load', load), window.addEventListener('resize', reset);


const eQuote = document.querySelector('#neat');

const regex = /\ /;
// save the original paragraph as array of words
// regex = /[,.?!;:]/; /* Uncomment for sentences */
const aQuote = eQuote.innerHTML.split(regex);

// wrap each word with a span
eQuote.innerHTML = '';
for (const word in aQuote) {
  eQuote.innerHTML += '<span>' + aQuote[word] + '</span>';
}
// ...and save them for later
const eWords = document.querySelectorAll('span');

function initFloatWords() {
  for (let i = 0; i < 20; i++) {
    fHighlightRandomWord(eWords);
  }
}
initFloatWords();
function fireFloatWords() {
  const repeat = setInterval(function() {
    if (Math.random() > 0.85) fClearAllHighlights(eQuote);
    fHighlightRandomWord(eWords);
  }, 275);
}

function fHighlightRandomWord(e) {
  const iRandom = Math.floor(Math.random() * e.length);
  e[iRandom].classList.add('highlight');
}

function fClearAllHighlights(e) {
  const nlHighlights = e.querySelectorAll('.highlight');
  // convert the nodeList into an array
  const aHighlights = Array.prototype.slice.call(nlHighlights);
  // remove .highlight from the spans which have it
  Array.prototype.map.call(aHighlights, function() {
    arguments[0].classList.remove('highlight');
  });
}

const Fireworks = function() {
  /* =============================================================================*/
  /* Utility
  /*=============================================================================*/
  const self = this;
  const rand = function(rMi, rMa) { return ~~((Math.random() * (rMa - rMi + 1)) + rMi); };
  const hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2) { return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1); };
  window.requestAnimFrame = function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) { window.setTimeout(a, 1E3 / 60); }; }();
  
  /* =============================================================================*/
  /* Initialize
  /*=============================================================================*/
  self.init = function() {
    self.dt = 0;
    self.oldTime = Date.now();
    self.canvas = document.createElement('canvas');
    self.canvasContainer = $('#canvas-container');
    self.initTime = 8000; // 绽放开始时间
    self.canvas.id = '#firworks';
    let player = $("#audio")[0];
    self.canvasContainer.on('click', function(e) {
      if (player.paused) {
        try {
          player.play();
        } catch (e) {
        }
      }
    });
    const canvasContainerDisabled = document.getElementById('canvas-container');
    self.canvas.onselectstart = function() {
      return false;
    };
    
    self.canvas.width = self.cw = window.innerWidth;
    self.canvas.height = self.ch = window.innerHeight;
    
    self.particles = [];
    self.partCount = 30;
    self.fireworks = [];
    self.mx = self.cw / 2;
    self.my = self.ch / 2;
    self.currentHue = 326;
    self.partSpeed = 5;
    self.partSpeedVariance = 10;
    self.partWind = 50;
    self.partFriction = 5;
    self.partGravity = 1;
    self.hueMin = 306;
    self.hueMax = 334;
    self.fworkSpeed = 2;
    self.fworkAccel = 4;
    self.hueVariance = 30;
    self.flickerDensity = 20;
    self.showShockwave = false;
    self.showTarget = true;
    self.clearAlpha = 25;
    
    self.canvasContainer.append(self.canvas);
    self.ctx = self.canvas.getContext('2d');
    self.ctx.lineCap = 'round';
    self.ctx.lineJoin = 'round';
    self.lineWidth = 1;
    self.bindEvents();
    self.canvasLoop();
    
    self.canvas.onselectstart = function() {
      return false;
    };
    
    
  };
  
  /* =============================================================================*/
  /* Particle Constructor
  /*=============================================================================*/
  const Particle = function(x, y, hue) {
    this.x = x;
    this.y = y;
    this.coordLast = [
      { x, y },
      { x, y },
      { x, y },
    ];
    this.angle = rand(0, 360);
    this.speed = rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance));
    this.friction = 1 - self.partFriction / 100;
    this.gravity = self.partGravity / 2;
    this.hue = rand(hue - self.hueVariance, hue + self.hueVariance);
    this.brightness = rand(50, 80);
    this.alpha = rand(40, 100) / 100;
    this.decay = rand(10, 50) / 1000;
    this.wind = (rand(0, self.partWind) - (self.partWind / 2)) / 25;
    this.lineWidth = self.lineWidth;
  };
  
  Particle.prototype.update = function(index) {
    const radians = this.angle * Math.PI / 180;
    const vx = Math.cos(radians) * this.speed;
    const vy = Math.sin(radians) * this.speed + this.gravity;
    this.speed *= this.friction;
    
    this.coordLast[2].x = this.coordLast[1].x;
    this.coordLast[2].y = this.coordLast[1].y;
    this.coordLast[1].x = this.coordLast[0].x;
    this.coordLast[1].y = this.coordLast[0].y;
    this.coordLast[0].x = this.x;
    this.coordLast[0].y = this.y;
    
    this.x += vx * self.dt;
    this.y += vy * self.dt;
    
    this.angle += this.wind;
    this.alpha -= this.decay;
    
    if (!hitTest(0, 0, self.cw, self.ch, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2) || this.alpha < 0.05) {
      self.particles.splice(index, 1);
    }
  };
  
  Particle.prototype.draw = function() {
    const coordRand = (rand(1, 3) - 1);
    self.ctx.beginPath();
    self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
    self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
    self.ctx.closePath();
    self.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    self.ctx.stroke();
    
    if (self.flickerDensity > 0) {
      const inverseDensity = 50 - self.flickerDensity;
      if (rand(0, inverseDensity) === inverseDensity) {
        self.ctx.beginPath();
        self.ctx.arc(Math.round(this.x), Math.round(this.y), rand(this.lineWidth, this.lineWidth + 3) / 2, 0, Math.PI * 2, false);
        self.ctx.closePath();
        const randAlpha = rand(50, 100) / 100;
        self.ctx.fillStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + randAlpha + ')';
        self.ctx.fill();
      }
    }
  };
  
  /* =============================================================================*/
  /* Create Particles
  /*=============================================================================*/
  self.createParticles = function(x, y, hue) {
    let countdown = self.partCount;
    while (countdown--) {
      self.particles.push(new Particle(x, y, hue));
    }
  };
  
  /* =============================================================================*/
  /* Update Particles
  /*=============================================================================*/
  self.updateParticles = function() {
    let i = self.particles.length;
    while (i--) {
      const p = self.particles[i];
      p.update(i);
    }
  };
  
  /* =============================================================================*/
  /* Draw Particles
  /*=============================================================================*/
  self.drawParticles = function() {
    let i = self.particles.length;
    while (i--) {
      const p = self.particles[i];
      p.draw();
    }
  };
  
  /* =============================================================================*/
  /* Firework Constructor
  /*=============================================================================*/
  const Firework = function(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.hitX = false;
    this.hitY = false;
    this.coordLast = [
      { x: startX, y: startY },
      { x: startX, y: startY },
      { x: startX, y: startY },
    ];
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = self.fworkSpeed;
    this.angle = Math.atan2(targetY - startY, targetX - startX);
    this.shockwaveAngle = Math.atan2(targetY - startY, targetX - startX) + (90 * (Math.PI / 180));
    this.acceleration = self.fworkAccel / 100;
    this.hue = self.currentHue;
    this.brightness = rand(50, 80);
    this.alpha = rand(50, 100) / 100;
    this.lineWidth = self.lineWidth;
    this.targetRadius = 1;
  };
  
  Firework.prototype.update = function(index) {
    self.ctx.lineWidth = this.lineWidth;
    
    vx = Math.cos(this.angle) * this.speed,
      vy = Math.sin(this.angle) * this.speed;
    this.speed *= 1 + this.acceleration;
    this.coordLast[2].x = this.coordLast[1].x;
    this.coordLast[2].y = this.coordLast[1].y;
    this.coordLast[1].x = this.coordLast[0].x;
    this.coordLast[1].y = this.coordLast[0].y;
    this.coordLast[0].x = this.x;
    this.coordLast[0].y = this.y;
    
    if (self.showTarget) {
      if (this.targetRadius < 8) {
        this.targetRadius += 0.25 * self.dt;
      } else {
        this.targetRadius = 1 * self.dt;
      }
    }
    
    if (this.startX >= this.targetX) {
      if (this.x + vx <= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * self.dt;
      }
    } else {
      if (this.x + vx >= this.targetX) {
        this.x = this.targetX;
        this.hitX = true;
      } else {
        this.x += vx * self.dt;
      }
    }
    
    if (this.startY >= this.targetY) {
      if (this.y + vy <= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * self.dt;
      }
    } else {
      if (this.y + vy >= this.targetY) {
        this.y = this.targetY;
        this.hitY = true;
      } else {
        this.y += vy * self.dt;
      }
    }
    
    if (this.hitX && this.hitY) {
      const randExplosion = rand(0, 9);
      self.createParticles(this.targetX, this.targetY, this.hue);
      self.fireworks.splice(index, 1);
    }
  };
  
  Firework.prototype.draw = function() {
    self.ctx.lineWidth = this.lineWidth;
    
    const coordRand = (rand(1, 3) - 1);
    self.ctx.beginPath();
    self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
    self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
    self.ctx.closePath();
    self.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    self.ctx.stroke();
    
    if (self.showTarget) {
      self.ctx.save();
      self.ctx.beginPath();
      self.ctx.arc(Math.round(this.targetX), Math.round(this.targetY), this.targetRadius, 0, Math.PI * 2, false);
      self.ctx.closePath();
      self.ctx.lineWidth = 1;
      self.ctx.stroke();
      self.ctx.restore();
    }
    
    if (self.showShockwave) {
      self.ctx.save();
      self.ctx.translate(Math.round(this.x), Math.round(this.y));
      self.ctx.rotate(this.shockwaveAngle);
      self.ctx.beginPath();
      self.ctx.arc(0, 0, 1 * (this.speed / 5), 0, Math.PI, true);
      self.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + rand(25, 60) / 100 + ')';
      self.ctx.lineWidth = this.lineWidth;
      self.ctx.stroke();
      self.ctx.restore();
    }
  };
  
  /* =============================================================================*/
  /* Create Fireworks
  /*=============================================================================*/
  self.createFireworks = function(startX, startY, targetX, targetY) {
    self.fireworks.push(new Firework(startX, startY, targetX, targetY));
  };
  
  /* =============================================================================*/
  /* Update Fireworks
  /*=============================================================================*/
  self.updateFireworks = function() {
    let i = self.fireworks.length;
    while (i--) {
      const f = self.fireworks[i];
      f.update(i);
    }
  };
  
  /* =============================================================================*/
  /* Draw Fireworks
  /*=============================================================================*/
  self.drawFireworks = function() {
    let i = self.fireworks.length;
    while (i--) {
      const f = self.fireworks[i];
      f.draw();
    }
  };
  
  /* =============================================================================*/
  /* Events
  /*=============================================================================*/
  self.bindEvents = function() {
    $(window).on('resize', function() {
      clearTimeout(self.timeout);
      self.timeout = setTimeout(function() {
        self.ctx.lineCap = 'round';
        self.ctx.lineJoin = 'round';
      }, 100);
    });
    
    $(self.canvas).on('mousedown', function(e) {
      const randLaunch = rand(0, 5);
      self.mx = e.pageX - self.canvasContainer.offset().left;
      self.my = e.pageY - self.canvasContainer.offset().top;
      self.currentHue = rand(self.hueMin, self.hueMax);
      self.createFireworks(self.cw / 2, self.ch, self.mx, self.my);
      
      $(self.canvas).on('touchmove.fireworks', function(e) {
        const randLaunch = rand(0, 5);
        self.mx = e.pageX - self.canvasContainer.offset().left;
        self.my = e.pageY - self.canvasContainer.offset().top;
        self.currentHue = rand(self.hueMin, self.hueMax);
        self.createFireworks(self.cw / 2, self.ch, self.mx, self.my);
      });
      
    });
    
    $(self.canvas).on('mouseup', function(e) {
      $(self.canvas).off('touchmove.fireworks');
    });
    
  };
  
  /* =============================================================================*/
  /* Clear Canvas
  /*=============================================================================*/
  self.clear = function() {
    self.particles = [];
    self.fireworks = [];
    self.ctx.clearRect(0, 0, self.cw, self.ch);
  };
  
  /* =============================================================================*/
  /* Delta
  /*=============================================================================*/
  self.updateDelta = function() {
    const newTime = Date.now();
    self.dt = (newTime - self.oldTime) / 16;
    self.dt = (self.dt > 5) ? 5 : self.dt;
    self.oldTime = newTime;
  };
  
  /* =============================================================================*/
  /* Main Loop
  /*=============================================================================*/
  self.canvasLoop = function() {
    requestAnimFrame(self.canvasLoop, self.canvas);
    self.updateDelta();
    self.ctx.globalCompositeOperation = 'destination-out';
    self.ctx.fillStyle = 'rgba(0,0,0,' + self.clearAlpha / 100 + ')';
    self.ctx.fillRect(0, 0, self.cw, self.ch);
    self.ctx.globalCompositeOperation = 'lighter';
    self.updateFireworks();
    self.updateParticles();
    self.drawFireworks();
    self.drawParticles();
  };
  
  self.init();
  self.fire = function() {
    let initialLaunchCount = 10;
    // let player = $("#audio")[0];
    // $('#firworks').on('click.play', function(e) {
    //   debugger;
    //   if (player) {
    //     try {
    //       player.play();
    //     } catch (e) {
    //     }
    //   }
    // });
    while (initialLaunchCount--) {
      setTimeout(function() {
        self.fireworks.push(new Firework(self.cw / 2, self.ch, rand(50, self.cw - 50), rand(50, self.ch / 2) - 50));
      }, initialLaunchCount * 200);
    }
    setTimeout(() => {
      fireFloatWords();
    }, initialLaunchCount * 200 + 1500);
  };
};

window.fireworkObj = new Fireworks();
