// src/modules/pet.js

const petStates = {
  move: "./assets/pet/move.gif",
  seal: "./assets/pet/seal.gif",
  sigh: "./assets/pet/sigh.gif",
  stare: "./assets/pet/stare.gif",
  excited: "./assets/pet/excited.gif"
};

let petX = Math.round(window.innerWidth * 0.42);
let petY = Math.round(window.innerHeight * 0.67);
let petTarget = null;
let petAnimationId = 0;
let petLastMoveAt = 0;
let petIdleTimer = 0;
let petReturnTimer = 0;
let petDragging = false;
let petDragOffsetX = 0;
let petDragOffsetY = 0;
let petPointerMoved = false;
let petLastPointerX = 0;

let isPetMotionEnabled = true;
let isLowPower = false;

// DOM Elements
let petSprite = null;
let petImage = null;

// Throttling for pointermove
let pointerMoveTicking = false;

function petBounds() {
  const size = petSprite.getBoundingClientRect().width || 112;
  const margin = 18;
  return {
    size,
    minX: margin,
    minY: Math.max(76, margin),
    maxX: Math.max(margin, window.innerWidth - size - margin),
    maxY: Math.max(margin, window.innerHeight - size - 92)
  };
}

function clampPetPosition(x, y) {
  const bounds = petBounds();
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y))
  };
}

function setPetImage(state) {
  const next = petStates[state] || petStates.move;
  if (!petImage.src.endsWith(next.replace("./", ""))) {
    petImage.src = next;
  }
}

function setPetDirection(dx) {
  if (Math.abs(dx) < 1) return;
  petSprite.classList.toggle("is-facing-left", dx < 0);
}

export function placePet(x, y) {
  if (!petSprite) return;
  const pos = clampPetPosition(x, y);
  petX = pos.x;
  petY = pos.y;
  petSprite.style.transform = `translate3d(${Math.round(petX)}px, ${Math.round(petY)}px, 0)`;
}

function randomPetTarget() {
  const bounds = petBounds();
  const forbidden = {
    x1: window.innerWidth * 0.22,
    x2: window.innerWidth * 0.78,
    y1: window.innerHeight * 0.22,
    y2: window.innerHeight * 0.6
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    if (x < forbidden.x1 || x > forbidden.x2 || y < forbidden.y1 || y > forbidden.y2) {
      return { x, y };
    }
  }

  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY)
  };
}

export function clearPetTimers() {
  window.clearTimeout(petIdleTimer);
  window.clearTimeout(petReturnTimer);
  window.cancelAnimationFrame(petAnimationId);
}

export function startPetMove() {
  if (!isPetMotionEnabled || isLowPower) {
    clearPetTimers();
    setPetImage("seal");
    return;
  }
  if (petDragging) return;
  window.clearTimeout(petIdleTimer);
  setPetImage("move");
  petTarget = randomPetTarget();
  setPetDirection(petTarget.x - petX);
  const speed = 0.85 + Math.random() * 0.45;

  function step(now) {
    if (petDragging || !petTarget) return;
    if (now - petLastMoveAt < 1000 / 24) {
      petAnimationId = requestAnimationFrame(step);
      return;
    }
    petLastMoveAt = now;

    const dx = petTarget.x - petX;
    const dy = petTarget.y - petY;
    const distance = Math.hypot(dx, dy);

    if (distance < 2) {
      placePet(petTarget.x, petTarget.y);
      petTarget = null;
      startPetIdle();
      return;
    }

    placePet(petX + (dx / distance) * speed, petY + (dy / distance) * speed);
    petAnimationId = requestAnimationFrame(step);
  }

  petAnimationId = requestAnimationFrame(step);
}

export function startPetIdle() {
  if (!isPetMotionEnabled || isLowPower) return;
  if (petDragging) return;
  setPetImage(Math.random() > 0.5 ? "seal" : "sigh");
  petIdleTimer = window.setTimeout(startPetMove, 1800 + Math.random() * 2400);
}

function startPetTemporaryState(state, duration = 1800) {
  if (petDragging) return;
  window.cancelAnimationFrame(petAnimationId);
  window.clearTimeout(petIdleTimer);
  window.clearTimeout(petReturnTimer);
  setPetImage(state);
  petReturnTimer = window.setTimeout(startPetMove, duration);
}

export function updatePetPerformanceSettings(settings) {
  isPetMotionEnabled = settings.petMotion;
  isLowPower = settings.lowPower;

  if (isPetMotionEnabled && !isLowPower) {
    startPetIdle();
  } else {
    clearPetTimers();
    setPetImage("seal");
  }
}

export function handlePetResize() {
  placePet(petX, petY);
}

export function initPet() {
  petSprite = document.querySelector("#petSprite");
  petImage = document.querySelector("#petImage");

  if (!petSprite || !petImage) return;

  placePet(window.innerWidth * 0.42, window.innerHeight * 0.67);

  if (isPetMotionEnabled && !isLowPower) {
    petIdleTimer = window.setTimeout(startPetMove, 600);
  } else {
    setPetImage("seal");
  }

  petSprite.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    clearPetTimers();
    petDragging = true;
    petPointerMoved = false;
    petSprite.classList.add("is-dragging");
    setPetImage("excited");
    const rect = petSprite.getBoundingClientRect();
    petDragOffsetX = event.clientX - rect.left;
    petDragOffsetY = event.clientY - rect.top;
    petLastPointerX = event.clientX;
    petSprite.setPointerCapture(event.pointerId);
  });

  petSprite.addEventListener("pointermove", (event) => {
    if (!petDragging) return;
    petPointerMoved = true;
    
    // Throttle pet dragging with requestAnimationFrame for performance
    if (!pointerMoveTicking) {
      window.requestAnimationFrame(() => {
        setPetDirection(event.clientX - petLastPointerX);
        petLastPointerX = event.clientX;
        placePet(event.clientX - petDragOffsetX, event.clientY - petDragOffsetY);
        pointerMoveTicking = false;
      });
      pointerMoveTicking = true;
    }
  });

  petSprite.addEventListener("pointerup", (event) => {
    if (!petDragging) return;
    petDragging = false;
    petSprite.classList.remove("is-dragging");
    if (petSprite.hasPointerCapture(event.pointerId)) {
      petSprite.releasePointerCapture(event.pointerId);
    }

    if (petPointerMoved) {
      startPetTemporaryState("excited", 950);
    } else {
      startPetTemporaryState("stare", 1700);
    }
  });

  petSprite.addEventListener("click", (event) => {
    event.preventDefault();
  });
}
