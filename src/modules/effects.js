// src/modules/effects.js

let meteors = [];
let stars = [];
let nextMeteorAt = 0;
let lastTime = performance.now();
let meteorAnimationId = 0;
let lastMeteorPaintAt = 0;
let lastClickEffectAt = 0;
let isLowPower = false;
let isMeteorEnabled = true;
let isClickEffectsEnabled = true;

// DOM Nodes
let clickEffectLayer = null;
let canvas = null;
let ctx = null;

// Object pools for click particles
const heartPool = [];
const sparkPool = [];

// Performance callback (to check if music is playing, etc.)
let isMusicActivelyPlaying = () => false;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getHeartElement() {
  if (heartPool.length > 0) return heartPool.pop();
  const heart = document.createElement("img");
  heart.src = "./assets/effects/blue-heart.png";
  heart.alt = "";
  heart.className = "click-heart";
  return heart;
}

function getSparkElement() {
  if (sparkPool.length > 0) return sparkPool.pop();
  const spark = document.createElement("span");
  spark.className = "click-spark";
  return spark;
}

function releaseHeart(heart) {
  heart.remove();
  if (heartPool.length < 50) heartPool.push(heart);
}

function releaseSpark(spark) {
  spark.remove();
  if (sparkPool.length < 30) sparkPool.push(spark);
}

export function spawnClickEffect(event) {
  if (!isClickEffectsEnabled || isLowPower) return;
  if (event.button !== 0 && event.button !== undefined) return;
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  if (event.target.closest("input, button, select, textarea, label, dialog, .music-player, .shortcut-menu")) return;

  const now = performance.now();
  if (now - lastClickEffectAt < 180) return; // Throttle clicks
  lastClickEffectAt = now;

  const x = `${event.clientX}px`;
  const y = `${event.clientY}px`;
  const heartsCount = 3;

  for (let index = 0; index < heartsCount; index += 1) {
    const heart = getHeartElement();
    const angle = -135 + index * 28 + randomBetween(-12, 12);
    const distance = randomBetween(28, 88);
    const radians = (angle * Math.PI) / 180;
    
    heart.style.setProperty("--click-x", x);
    heart.style.setProperty("--click-y", y);
    heart.style.setProperty("--heart-dx", `${Math.cos(radians) * distance}px`);
    heart.style.setProperty("--heart-dy", `${Math.sin(radians) * distance - randomBetween(8, 34)}px`);
    heart.style.setProperty("--heart-size", `${randomBetween(18, 34)}px`);
    heart.style.setProperty("--heart-scale", String(randomBetween(0.68, 1.18)));
    heart.style.setProperty("--heart-rotate", `${randomBetween(-18, 18)}deg`);
    heart.style.setProperty("--heart-delay", `${index * 26}ms`);
    heart.style.setProperty("--heart-duration", `${randomBetween(820, 1180)}ms`);
    
    clickEffectLayer.append(heart);
    heart.addEventListener("animationend", () => releaseHeart(heart), { once: true });
  }

  const sparkCount = 1;
  for (let index = 0; index < sparkCount; index += 1) {
    const spark = getSparkElement();
    const angle = -150 + index * 36 + randomBetween(-10, 10);
    const distance = randomBetween(34, 76);
    const radians = (angle * Math.PI) / 180;
    
    spark.style.setProperty("--click-x", x);
    spark.style.setProperty("--click-y", y);
    spark.style.setProperty("--spark-dx", `${Math.cos(radians) * distance}px`);
    spark.style.setProperty("--spark-dy", `${Math.sin(radians) * distance}px`);
    spark.style.setProperty("--spark-angle", `${angle}deg`);
    spark.style.setProperty("--spark-width", `${randomBetween(24, 48)}px`);
    spark.style.setProperty("--spark-delay", `${index * 38}ms`);
    spark.style.setProperty("--spark-duration", `${randomBetween(720, 1060)}ms`);
    
    clickEffectLayer.append(spark);
    spark.addEventListener("animationend", () => releaseSpark(spark), { once: true });
  }
}

function spawnMeteor(now) {
  const y = Math.random() * window.innerHeight * 0.35 + 28;
  const length = Math.random() * 120 + 150;
  meteors.push({
    x: window.innerWidth + 80,
    y,
    vx: -(Math.random() * 300 + 560),
    vy: Math.random() * 90 + 130,
    length,
    life: 1,
    hue: Math.random() > 0.5 ? "pink" : "cyan"
  });
  nextMeteorAt = now + Math.random() * 4600 + 2800;
}

function drawStars(now) {
  for (const star of stars) {
    const alpha = 0.18 + Math.abs(Math.sin(now / 620 + star.phase)) * 0.46;
    ctx.fillStyle = `rgba(236, 229, 255, ${alpha})`;
    ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
  }
}

function drawMeteor(meteor) {
  const tailX = meteor.x + meteor.length;
  const tailY = meteor.y - meteor.length * 0.24;
  const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
  const glow = meteor.hue === "pink" ? "255, 143, 204" : "133, 231, 255";

  gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.life})`);
  gradient.addColorStop(0.18, `rgba(${glow}, ${meteor.life * 0.92})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 4;
  ctx.strokeStyle = gradient;
  ctx.shadowColor = `rgba(${glow}, 0.9)`;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(meteor.x, meteor.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${meteor.life})`;
  ctx.fillRect(Math.round(meteor.x - 2), Math.round(meteor.y - 9), 4, 18);
  ctx.fillStyle = `rgba(${glow}, ${meteor.life * 0.72})`;
  ctx.fillRect(Math.round(meteor.x - 6), Math.round(meteor.y - 4), 12, 8);
  ctx.restore();
}

function animate(now) {
  if (document.hidden || isMusicActivelyPlaying() || !isMeteorEnabled || isLowPower) {
    meteorAnimationId = 0;
    return;
  }

  // Cap framerate
  if (now - lastMeteorPaintAt < 1000 / 30) {
    meteorAnimationId = requestAnimationFrame(animate);
    return;
  }
  lastMeteorPaintAt = now;

  const delta = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawStars(now);

  if (now > nextMeteorAt) spawnMeteor(now);

  meteors = meteors.filter((meteor) => {
    meteor.x += meteor.vx * delta;
    meteor.y += meteor.vy * delta;
    meteor.life -= delta * 0.36;
    drawMeteor(meteor);
    return meteor.life > 0 && meteor.x > -meteor.length - 80 && meteor.y < window.innerHeight + 80;
  });

  meteorAnimationId = requestAnimationFrame(animate);
}

export function startMeteorAnimation() {
  if (meteorAnimationId || document.hidden || isMusicActivelyPlaying() || !isMeteorEnabled || isLowPower) return;
  lastTime = performance.now();
  lastMeteorPaintAt = 0;
  meteorAnimationId = requestAnimationFrame(animate);
}

export function stopMeteorAnimation() {
  cancelAnimationFrame(meteorAnimationId);
  meteorAnimationId = 0;
  meteors = [];
  if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

export function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.25));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.floor(window.innerWidth / 42) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.72,
    size: Math.random() > 0.72 ? 2 : 1,
    phase: Math.random() * Math.PI * 2
  }));
}

export function updateEffectsPerformanceSettings(settings) {
  isLowPower = settings.lowPower;
  isMeteorEnabled = settings.meteors;
  isClickEffectsEnabled = settings.clickEffects;

  if (isMeteorEnabled && !isLowPower && !isMusicActivelyPlaying()) {
    startMeteorAnimation();
  } else {
    stopMeteorAnimation();
  }
}

export function initEffects({ musicCheckCallback }) {
  if (musicCheckCallback) isMusicActivelyPlaying = musicCheckCallback;

  clickEffectLayer = document.createElement("div");
  clickEffectLayer.className = "click-effect-layer";
  document.body.append(clickEffectLayer);

  canvas = document.querySelector("#meteorCanvas");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("click", spawnClickEffect);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopMeteorAnimation();
    } else {
      startMeteorAnimation();
    }
  });
}
