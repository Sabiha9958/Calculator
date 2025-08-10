// DOM Elements
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const historyList = document.getElementById("history-list");
const themeToggle = document.getElementById("theme-toggle");
const toggleAdvanced = document.getElementById("toggle-advanced");
const advancedPanel = document.getElementById("advanced-panel");
const calculatorContainer = document.querySelector(".calculator-container");
const calculatorMain = document.getElementById("calculator-main");
const convertBtn = document.getElementById("convert-btn");
const fireRainContainer = document.getElementById("fire-rain");
const iceRainContainer = document.getElementById("ice-rain");

// Expression state
let expression = "";

// Math helper functions
function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
function sqrt(x) {
  return Math.sqrt(x);
}
function pow(x, y) {
  return Math.pow(x, y);
}
function ln(x) {
  return Math.log(x);
}
function log(x) {
  return Math.log10(x);
}

// Play subtle click sound
function playClick() {
  const clickSound = new Audio(
    "https://www.myinstants.com/media/sounds/mouse-click.mp3"
  );
  clickSound.volume = 0.15;
  clickSound.play().catch(() => {});
}

// Handle input (both keyboard & mouse)
function handleInput(value, action) {
  if (action === "clear") {
    expression = "";
    display.value = "";
  } else if (action === "delete") {
    expression = expression.slice(0, -1);
    display.value = expression;
  } else if (action === "equals") {
    if (!expression.trim()) return;
    try {
      let finalExp = expression
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "log(")
        .replace(/ln\(/g, "ln(")
        .replace(/sqrt\(/g, "sqrt(")
        .replace(/pow\(/g, "pow(")
        .replace(/factorial\(/g, "factorial(");

      let result = eval(finalExp);

      if (typeof result === "number" && !Number.isFinite(result))
        throw new Error("Out of range");
      if (isNaN(result)) throw new Error("Invalid computation");

      display.value = result;
      historyList.innerHTML =
        `<li>${expression} = ${result}</li>` + historyList.innerHTML;
      expression = String(result);
    } catch {
      display.value = "Error";
      expression = "";
    }
  } else if (value) {
    expression += value;
    display.value = expression;
  }
}

// Button clicks
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    playClick();
    handleInput(btn.dataset.value, btn.dataset.action);
  });
});

// Keyboard input support
document.addEventListener("keydown", (e) => {
  const allowedKeys = "0123456789+-*/().";
  if (allowedKeys.includes(e.key)) {
    handleInput(e.key, null);
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleInput(null, "equals");
  } else if (e.key === "Backspace") {
    handleInput(null, "delete");
  } else if (e.key === "Escape") {
    handleInput(null, "clear");
  }
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀ Light";
  } else {
    themeToggle.textContent = "🌙 Dark";
  }
});

// Advanced panel slide toggle & resize main calculator container accordingly
toggleAdvanced.addEventListener("click", () => {
  advancedPanel.classList.toggle("show");
  calculatorContainer.classList.toggle("expanded");
  toggleAdvanced.textContent = advancedPanel.classList.contains("show")
    ? "🔽 Hide Advanced"
    : "🛠 Show Advanced";
});

// Unit converter functionality
convertBtn.addEventListener("click", () => {
  const val = parseFloat(document.getElementById("unit-input").value);
  const from = document.getElementById("unit-from").value;
  const to = document.getElementById("unit-to").value;
  const factors = { m: 1, km: 0.001, cm: 100, mm: 1000 };
  if (!isNaN(val)) {
    const converted = (val / factors[from]) * factors[to];
    document.getElementById(
      "unit-result"
    ).textContent = `${val} ${from} = ${converted} ${to}`;
  } else {
    document.getElementById("unit-result").textContent = "Invalid input";
  }
});

// FIRE AND ICE PARTICLES WITH ATTACKS AND CLEANING EFFECTS

// Utilities
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createFireParticle(leftPct, bottomPx) {
  const spark = document.createElement("div");
  const size = randomRange(3, 8);
  spark.classList.add("attack-particle", "fire-attack");
  spark.style.width = `${size}px`;
  spark.style.height = `${size * 1.8}px`;
  spark.style.borderRadius = "50%";
  spark.style.position = "fixed";
  spark.style.left = `${leftPct}vw`;
  spark.style.bottom = `${bottomPx}px`;
  spark.style.opacity = randomRange(0.6, 1);
  spark.style.filter = `drop-shadow(0 0 ${randomRange(
    5,
    12
  )}px rgba(255, 100, 30, 0.9))`;

  document.body.appendChild(spark);
  return spark;
}

function createIceParticle(leftPct, topPx) {
  const drop = document.createElement("div");
  const size = randomRange(3, 8);
  drop.classList.add("attack-particle", "ice-attack");
  drop.style.width = `${size}px`;
  drop.style.height = `${size * 6}px`;
  drop.style.position = "fixed";
  drop.style.left = `${leftPct}vw`;
  drop.style.top = `${topPx}px`;
  drop.style.opacity = randomRange(0.6, 1);
  drop.style.filter = `drop-shadow(0 0 ${randomRange(
    6,
    14
  )}px rgba(50, 180, 255, 0.9))`;
  drop.style.borderRadius = "60% 60% 100% 100% / 70% 70% 100% 100%";

  document.body.appendChild(drop);
  return drop;
}

// Move particle with easing and call callback on finish
function animateParticle(particle, pathFunc, duration, onComplete) {
  const start = performance.now();

  function animate(time) {
    let elapsed = time - start;
    let t = Math.min(elapsed / duration, 1);
    const [x, y] = pathFunc(t);
    particle.style.transform = `translate(${x}px, ${y}px)`;
    particle.style.opacity = 1 - t;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      particle.remove();
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(animate);
}

// Randomly float fire particles drifting upward and sideways in fire panel
function fireParticleDrift() {
  const fire = fireRainContainer;
  const spark = document.createElement("div");
  const size = randomRange(3, 7);
  spark.classList.add("attack-particle", "fire-attack");
  spark.style.width = `${size}px`;
  spark.style.height = `${size * 1.8}px`;
  spark.style.borderRadius = "50%";
  spark.style.position = "absolute";
  spark.style.bottom = "0";
  spark.style.left = `${randomRange(0, 100)}%`;
  spark.style.opacity = randomRange(0.4, 0.8);
  spark.style.filter = `drop-shadow(0 0 ${randomRange(
    5,
    10
  )}px rgba(255, 90, 0, 0.7))`;

  fire.appendChild(spark);

  let posY = 0;
  let posX = parseFloat(spark.style.left);
  const speedY = randomRange(0.5, 1);
  const speedX = randomRange(-0.25, 0.25);

  function drift() {
    posY += speedY;
    posX += speedX;
    spark.style.bottom = posY + "px";
    spark.style.left = `${posX}%`;

    if (posY > window.innerHeight || posX < -10 || posX > 110) {
      spark.remove();
    } else {
      requestAnimationFrame(drift);
    }
  }

  drift();
}

// Randomly float ice particles falling and swaying in ice panel
function iceParticleDrift() {
  const ice = iceRainContainer;
  const drop = document.createElement("div");
  const size = randomRange(3, 7);
  drop.classList.add("attack-particle", "ice-attack");
  drop.style.width = `${size}px`;
  drop.style.height = `${size * 6}px`;
  drop.style.position = "absolute";
  drop.style.top = "0";
  drop.style.left = `${randomRange(0, 100)}%`;
  drop.style.opacity = randomRange(0.4, 0.8);
  drop.style.borderRadius = "60% 60% 100% 100% / 70% 70% 100% 100%";
  drop.style.filter = `drop-shadow(0 0 ${randomRange(
    7,
    14
  )}px rgba(50, 180, 255, 0.7))`;

  ice.appendChild(drop);

  let posY = 0;
  let posX = parseFloat(drop.style.left);
  const speedY = randomRange(1.5, 3);
  const swayAmplitude = randomRange(10, 20);
  const swayFrequency = randomRange(0.02, 0.04);

  function drift() {
    posY += speedY;
    posX =
      parseFloat(drop.style.left) +
      Math.sin(posY * swayFrequency) * swayAmplitude;
    drop.style.top = posY + "px";
    drop.style.left = `${posX}%`;

    if (posY > window.innerHeight || posX < -10 || posX > 110) {
      drop.remove();
    } else {
      requestAnimationFrame(drift);
    }
  }

  drift();
}

// Attack animation triggers with glow on calculator panel and particles attacking

function fireAttack() {
  // Glow calculator with fire effect
  calculatorMain.classList.add("fire-attack");
  setTimeout(() => calculatorMain.classList.remove("fire-attack"), 1200);

  // Create multiple attack particles moving from left side to calculator
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const startLeftVW = randomRange(0, 48);
      const startBottomPx = randomRange(-20, window.innerHeight * 0.5);

      const particle = createFireParticle(startLeftVW, startBottomPx);

      // Calculate trajectory to calculator center with random offset
      const calcRect = calculatorMain.getBoundingClientRect();
      const targetX = calcRect.left + calcRect.width / 2 + randomRange(-50, 50);
      const targetY = calcRect.top + calcRect.height / 2 + randomRange(-40, 40);

      const startX = (startLeftVW / 100) * window.innerWidth;
      const startY = window.innerHeight - startBottomPx;

      animateParticle(
        particle,
        function (t) {
          const x =
            startX + (targetX - startX) * t + Math.sin(t * Math.PI * 4) * 25;
          const y =
            startY + (targetY - startY) * t - Math.cos(t * Math.PI * 5) * 15;
          return [x - startX, y - startY];
        },
        1400,
        () => particle.remove()
      );
    }, i * 100);
  }
}

function iceAttack() {
  // Glow calculator with ice effect
  calculatorMain.classList.add("ice-attack");
  setTimeout(() => calculatorMain.classList.remove("ice-attack"), 1200);

  // Create multiple attack particles moving from right side to calculator
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const startLeftVW = randomRange(52, 100);
      const startTopPx = randomRange(-20, window.innerHeight * 0.5);

      const particle = createIceParticle(startLeftVW, startTopPx);

      // Calculate trajectory to calculator center with random offset
      const calcRect = calculatorMain.getBoundingClientRect();
      const targetX = calcRect.left + calcRect.width / 2 + randomRange(-50, 50);
      const targetY = calcRect.top + calcRect.height / 2 + randomRange(-40, 40);

      const startX = (startLeftVW / 100) * window.innerWidth;
      const startY = startTopPx;

      animateParticle(
        particle,
        function (t) {
          const x =
            startX + (targetX - startX) * t + Math.sin(t * Math.PI * 6) * 20;
          const y =
            startY + (targetY - startY) * t + Math.cos(t * Math.PI * 3) * 20;
          return [x - startX, y - startY];
        },
        1400,
        () => particle.remove()
      );
    }, i * 90);
  }
}

// Continually create floating drifting fire and ice particles
function startBackgroundParticles() {
  setInterval(() => {
    fireParticleDrift();
  }, 140);

  setInterval(() => {
    iceParticleDrift();
  }, 90);
}

// Randomly trigger attacks on calculator
function attackLoop() {
  const interval = randomRange(4000, 7000);
  setTimeout(() => {
    if (Math.random() < 0.5) {
      fireAttack();
    } else {
      iceAttack();
    }
    attackLoop();
  }, interval);
}

// Start all animations
startBackgroundParticles();
attackLoop();
