(function oneko() {
  const isReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isReducedMotion) return;

  const nekoEl = document.createElement("div");

  let nekoPosX = 32;
  let nekoPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  const spriteWidth = 48; // Sprite width
  const spriteHeight = 48; // Sprite height
  const spriteSets = {
    idleS: [
      [0, 0],
      [4, 0], [5, 0], [6, 0], [7, 0],
      [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
    ], // Idle south
    idleN: [
      [1, 0],
      [4, 0], [5, 0], [6, 0], [7, 0],
      [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
    ], // Idle north
    idleE: [
      [2, 0],
      [4, 0], [5, 0], [6, 0], [7, 0],
      [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
    ], // Idle east
    idleW: [
      [3, 0],
      [4, 0], [5, 0], [6, 0], [7, 0],
      [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
    ], // Idle west
    E: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]], // Walk east
    N: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]], // Walk north
    S: [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]], // Walk south
    W: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]], // Walk west
    idleWE: [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5]], // Idle west
    idleEE: [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6]], // Idle east
  };

  function init() {
    nekoEl.id = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = `${spriteWidth}px`;
    nekoEl.style.height = `${spriteHeight}px`;
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - spriteWidth / 2}px`;
    nekoEl.style.top = `${nekoPosY - spriteHeight / 2}px`;
    nekoEl.style.zIndex = 2147483647;

    let nekoFile = "./static/oneko.gif"; // Corrected path
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.cat) {
      nekoFile = curScript.dataset.cat;
    }
    nekoEl.style.backgroundImage = `url(${nekoFile})`;

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `-${sprite[0] * spriteWidth}px -${
      sprite[1] * spriteHeight
    }px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle(direction) {
    idleTime += 1;

    if (idleAnimation === null) {
      idleAnimation = direction;
      idleAnimationFrame = 0;
    }

    setSprite(idleAnimation, idleAnimationFrame);
    idleAnimationFrame += 1;

    // Transition to looping frames after the initial set
    if (idleAnimationFrame >= spriteSets[idleAnimation].length) {
      idleAnimationFrame = spriteSets[idleAnimation].length - 8; // Start looping last row
    }
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < spriteWidth) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        idle(diffX > 0 ? "idleW" : "idleE");
      } else {
        idle(diffY > 0 ? "idleN" : "idleS");
      }
      return;
    }

    idleTime = 0;
    resetIdleAnimation();

    let direction = "";
    if (diffY / distance > 0.5) direction = "N";
    if (diffY / distance < -0.5) direction = "S";
    if (diffX / distance > 0.5) direction += "W";
    if (diffX / distance < -0.5) direction += "E";

    // Use single-direction sprites (N, S, E, W) only
    if (direction.length > 1) {
      direction = direction[0];
    }

    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(
      Math.max(spriteWidth / 2, nekoPosX),
      window.innerWidth - spriteWidth / 2
    );
    nekoPosY = Math.min(
      Math.max(spriteHeight / 2, nekoPosY),
      window.innerHeight - spriteHeight / 2
    );

    nekoEl.style.left = `${nekoPosX - spriteWidth / 2}px`;
    nekoEl.style.top = `${nekoPosY - spriteHeight / 2}px`;
  }

  init();
})();





