const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restart');
const scoreSound = document.getElementById('scoreSound');
const hitSound = document.getElementById('hitSound');

let playerPos = window.innerWidth / 2 - 25;
let speed = 7;
let obstacles = [];
let score = 0;
let highScore = 0;
let spawnTimer = 0;
let spawnInterval = 700;
let lastTime = 0;
let isGameOver = false;
let keys = {};
let obstacleSpeed = 4;
const speedIncrement = 1;
const scorePerSpeedIncrease = 30;
const maxObstaclesPerSpawn = 4;
const minObstaclesPerSpawn = 3;

// Stars background
const stars = [];
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('stars');
    star.style.top = Math.random() * window.innerHeight + 'px';
    star.style.left = Math.random() * window.innerWidth + 'px';
    game.appendChild(star);
    stars.push({ el: star, speed: 0.5 + Math.random() });
}

// Player movement
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function movePlayer() {
    if (keys['ArrowLeft'] || keys['a']) { playerPos -= speed; if (playerPos < 0) playerPos = 0; }
    if (keys['ArrowRight'] || keys['d']) { playerPos += speed; if (playerPos > window.innerWidth - 50) playerPos = window.innerWidth - 50; }
    player.style.left = playerPos + 'px';
}

// Spawn obstacles
function spawnObstacle() {
    let count = minObstaclesPerSpawn + Math.floor(Math.random() * (maxObstaclesPerSpawn - minObstaclesPerSpawn + 1));
    for (let j = 0; j < count; j++) {
        const obs = document.createElement('div');
        obs.classList.add('obstacle');
        obs.style.width = (30 + Math.random() * 60) + 'px';
        obs.style.height = (20 + Math.random() * 30) + 'px';
        obs.style.left = Math.random() * (window.innerWidth - parseInt(obs.style.width)) + 'px';
        obs.style.top = '-50px';
        game.appendChild(obs);
        let lateral = Math.random() > 0.6;
        let dir = Math.random() > 0.5 ? 1 : -1;
        obstacles.push({ el: obs, speed: obstacleSpeed, lateral: lateral, direction: dir });
    }
}

// Particle effect
function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.background = color;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        game.appendChild(p);
        let angle = Math.random() * 2 * Math.PI;
        let spd = 2 + Math.random() * 2;
        let life = 30 + Math.random() * 30;
        let frame = 0;

        function animate() {
            if (frame > life) { p.remove(); return; }
            let dx = Math.cos(angle) * spd * frame / 5;
            let dy = Math.sin(angle) * spd * frame / 5;
            p.style.transform = `translate(${dx}px,${dy}px)`;
            frame++;
            requestAnimationFrame(animate);
        }
        animate();
    }
}

// Game loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    if (isGameOver) return;

    stars.forEach(s => {
        let top = parseFloat(s.el.style.top);
        top += s.speed;
        if (top > window.innerHeight) top = 0;
        s.el.style.top = top + 'px';
    });

    movePlayer();

    spawnTimer += delta;
    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        spawnObstacle();
    }

    obstacles.forEach((obsObj, index) => {
        let obs = obsObj.el;
        let top = parseFloat(obs.style.top);
        top += obsObj.speed;
        obs.style.top = top + 'px';

        if (obsObj.lateral) {
            let left = parseFloat(obs.style.left);
            left += obsObj.direction * 1.5;
            if (left <= 0 || left >= window.innerWidth - parseFloat(obs.style.width)) obsObj.direction *= -1;
            obs.style.left = left + 'px';
        }

        const playerRect = player.getBoundingClientRect();
        const obsRect = obs.getBoundingClientRect();
        if (playerRect.x < obsRect.x + obsRect.width &&
            playerRect.x + playerRect.width > obsRect.x &&
            playerRect.y < obsRect.y + obsRect.height &&
            playerRect.y + playerRect.height > obsRect.y) {
            hitSound.currentTime = 0;
            hitSound.play();
            createParticles(playerRect.x + 25, playerRect.y + 25, '#ff0');
            endGame();
        }

        if (top > window.innerHeight) {
            obs.remove();
            obstacles.splice(index, 1);
            score++;
            scoreEl.textContent = 'Score: ' + score;
            scoreSound.currentTime = 0;
            scoreSound.play();
            if (score > highScore) {
                highScore = score;
                highScoreEl.textContent = 'High Score: ' + highScore;
            }

            if (score % scorePerSpeedIncrease === 0) {
                obstacleSpeed += speedIncrement;
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    gameOverEl.style.display = 'block';
}

restartBtn.addEventListener('click', () => {
    obstacles.forEach(o => o.el.remove());
    obstacles = [];
    score = 0;
    scoreEl.textContent = 'Score: 0';
    playerPos = window.innerWidth / 2 - 25;
    player.style.left = playerPos + 'px';
    obstacleSpeed = 4;
    isGameOver = false;
    lastTime = 0;
    spawnTimer = 0;
    gameOverEl.style.display = 'none';
    requestAnimationFrame(gameLoop);
});

requestAnimationFrame(gameLoop);