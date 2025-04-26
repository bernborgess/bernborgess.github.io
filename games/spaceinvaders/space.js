//@ts-check
// Board
const tileSize = 32;
const rows = 16;
const cols = 16;

const boardWidth = tileSize * cols;
const boardHeight = tileSize * rows;

let board;
/** @type {CanvasRenderingContext2D} */
let context;

/**
 * @typedef {Object} RigidBody
 * @property {number} x 
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

// Ship
const ship = {
    x: tileSize * cols / 2 - tileSize,
    y: tileSize * rows - tileSize * 2,
    width: tileSize * 2,
    height: tileSize,
    image: new Image(),
    dx: tileSize
};


// // Aliens
// /**
//  * @typedef {Object} Alien
//  * @extends RigidBody
//  * @property {HTMLImageElement} image
//  * @property {boolean} alive
//  */

/**
 * @typedef {Object} Alien
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {HTMLImageElement} image
 * @property {boolean} alive
 */

/** @type {Alien} */
const alienModel = {
    x: tileSize,
    y: tileSize,
    width: tileSize * 2,
    height: tileSize,
    image: new Image(),
    alive: true
};

/**
 * @param {Alien} a
 */
function lookAtAlien(a) {
    a.height
}

let aliensRows = 2;
let aliensCols = 3;

let alienCount = 0;
let aliensDx = 1;

/** @type {Alien[]} */
const aliens = [];

// Bullets
/**
 * @typedef {Object} Bullet
 * @extends RigidBody
 * @property {boolean} hit
 */

/** @type {Bullet[]} */
const bullets = [];

const bulletDy = -10;

// Scoring
let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementsByTagName("canvas")[0];
    if (!board) return;
    board.width = boardWidth;
    board.height = boardHeight;

    // @ts-ignore
    context = board.getContext("2d");
    if (!context) return;

    // Draw initial ship
    // Load images
    ship.image.src = "./assets/ship.png";
    ship.image.onload = function () {
        context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
    }

    alienModel.image.src = "./assets/alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {

    context.clearRect(0, 0, board.width, board.height);

    // Ship
    context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);

    // Aliens
    const anyAlienTouchesBorder = aliens.filter(a => a.alive)
        .some(a => !validPosition(a.x, a.width))

    if (anyAlienTouchesBorder) aliensDx *= -1;

    aliens.filter(a => a.alive)
        .forEach(a => {
            a.x += aliensDx;
            if (anyAlienTouchesBorder)
                a.y += a.height;

            // World Domination 💥
            if (a.y >= ship.y) gameOver = true;

            context.drawImage(a.image, a.x, a.y, a.width, a.height);
        });


    // Bullets
    bullets.forEach(b => {
        b.y += bulletDy;
        context.fillStyle = "white";
        context.fillRect(b.x, b.y, b.width, b.height);

        // Collision with aliens
        aliens
            .filter(a => a.alive)
            .filter(a => detectCollision(a, b))
            .forEach(a => {
                b.hit = true;
                a.alive = false;
                alienCount--;
                score += 100;
            });
    });

    bullets.splice(0, bullets.length, ...bullets.filter(b => b.y >= 0 && !b.hit));

    // Scoring
    context.fillStyle = "white";
    context.font = "18px monospace";
    context.fillText(`Score: ${score}`, 5, 20);

    // Next Level
    if (alienCount === 0) {
        aliensCols = Math.min(aliensCols + 1, cols / 2 - 2);
        aliensRows = Math.min(aliensRows + 1, rows - 4);
        aliensDx += 0.2;
        aliens.splice(0, aliens.length);
        bullets.splice(0, bullets.length);
        createAliens();
    }

    // Game Over
    if (gameOver) {
        context.fillStyle = "red";
        context.font = "42px monospace";
        context.fillText("Game Over", 150, 260);
        document.removeEventListener("keydown", moveShip);
        document.removeEventListener("keyup", shoot);
        return;
    }

    requestAnimationFrame(update);
}

/**
 * @param {number} x
 * @param {number} width
 */
function validPosition(x, width) {
    return !(x < 0 || x + width > boardWidth);
}

/**
 * @param {KeyboardEvent} ev
 */
function moveShip(ev) {
    const movs = {
        "ArrowLeft": -1,
        "ArrowRight": 1,
    }
    const dx = movs[ev.code] * ship.dx || 0;
    if (!validPosition(ship.x + dx, ship.width)) return;
    ship.x += dx;
}

/**
 * @param {number} length
 */
function range(length) {
    return Array.from({ length }, (v, i) => i);
}

function createAliens() {
    const cols = range(aliensCols);
    const rows = range(aliensRows);
    cols.forEach(c =>
        rows.forEach(r => {
            let alien = { ...alienModel };
            alien.x += c * alien.width;
            alien.y += r * alien.height;
            aliens.push(alien);
        })
    );
    alienCount = aliens.length;
}


/**
 * @param {KeyboardEvent} ev
 */
function shoot(ev) {
    if (ev.code !== "Space") return;

    /** @type {Bullet} */
    let bullet = {
        x: ship.x + ship.width * 15 / 32,
        y: ship.y,
        width: tileSize / 8,
        height: tileSize / 2,
        hit: false
    };
    bullets.push(bullet);
}

/**
 * @param {{ x: number; width: number; y: number; height: number; }} a
 * @param {{ x: number; width: number; y: number; height: number; }} b
 */
function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    )
}