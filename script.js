let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

// Variáveis do jogo
let backgroundImage = new Image();
backgroundImage.src = 'background.jpg';

let player;
let enemies = [];
let bullets = [];
let score = 0;
let kills = 0;
let gameOver = false;

// Configurações iniciais
function startGame() {
    player = new Player(370, 500, 50, 50, 'player.png');
    createEnemies();
    setInterval(updateGameArea, 20);
    window.addEventListener('keydown', function(e) {
        keys[e.keyCode] = true;
    });
    window.addEventListener('keyup', function(e) {
        keys[e.keyCode] = false;
    });
}

// Função para criar aeronaves inimigas
function createEnemies() {
    for (let i = 0; i < 2; i++) {
        let enemy = new Enemy(100 + i * 600, 50, 50, 50, 'enemy.png');
        enemies.push(enemy);
    }
}

// Atualiza o jogo a cada frame
function updateGameArea() {
    if (gameOver) return;

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    player.update();
    player.checkBounds();

    // Atualiza e desenha as aeronaves inimigas
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].move();
        enemies[i].shoot(); // Adiciona disparo para todas as aeronaves inimigas

        // Verifica colisão entre jogador e aeronaves inimigas
        if (player.isColliding(enemies[i])) {
            player.takeDamage();
            if (player.health <= 0) {
                endGame();
                return;
            }
        }

        // Atualiza e desenha os tiros
        for (let j = 0; j < bullets.length; j++) {
            bullets[j].update();
            // Verifica colisão de tiros com aeronaves inimigas
            if (enemies[i].isColliding(bullets[j])) {
                enemies[i].takeDamage();
                bullets.splice(j, 1);
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    score++;
                    kills++;
                    if (kills === 5 || kills === 15) {
                        adjustEnemies();
                    }
                    if (kills === 15) {
                        endGame();
                        return;
                    }
                }
            }
        }
    }

    // Atualiza e desenha os tiros do jogador
    for (let k = 0; k < bullets.length; k++) {
        bullets[k].update();
        if (bullets[k].y < 0) {
            bullets.splice(k, 1);
        }
    }

    // Mostra a pontuação na tela
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 20, 30);
}

// Função para ajustar tamanho e velocidade das aeronaves inimigas
function adjustEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].size -= 10;
        enemies[i].speed += 1;
    }
}

// Função para encerrar o jogo
function endGame() {
    gameOver = true;
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
}

// Classe para aeronaves do jogador
class Player {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.health = 3; // Vidas do jogador
    }

    update() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    checkBounds() {
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }

    moveLeft() {
        this.x -= 5;
    }

    moveRight() {
        this.x += 5;
    }

    shoot() {
        let bullet = new Bullet(this.x + this.width / 2, this.y, 5, 10, 'blue');
        bullets.push(bullet);
    }

    takeDamage() {
        this.health--;
    }

    isColliding(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y
        );
    }
}

// Classe para aeronaves inimigas
class Enemy {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speed = 2;
        this.size = 50;
        this.health = 1; // Vida inicial do inimigo
    }

    update() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x += this.speed;
        if (this.x <= 0 || this.x >= canvas.width - this.width) {
            this.speed *= -1;
        }
    }

    shoot() {
        // Implementação básica de disparo para todas as aeronaves inimigas
        let now = Date.now();
        let shootDelay = 1500; // Ajuste o atraso de tiro do inimigo

        if (now - lastEnemyShootTime > shootDelay) {
            let startX = this.x + this.width / 2;
            let startY = this.y + this.height;
            bullets.push(new Bullet(startX, startY, 5, 10, 'red', -3, true));
            lastEnemyShootTime = now;
        }
    }

    takeDamage() {
        this.health--;
        this.image.src = 'explosion.png';
        setTimeout(() => {
            this.image.src = '';
        }, 300);
    }

    isColliding(bullet) {
        return (
            bullet.x < this.x + this.width &&
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
    }
}

// Classe para tiros
class Bullet {
    constructor(x, y, width, height, color, speedY, isEnemyBullet) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speedY = speedY; // Velocidade do tiro no eixo Y
        this.isEnemyBullet = isEnemyBullet; // Indica se é um tiro de inimigo
    }

    update() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y += this.speedY, this.width, this.height);
    }
}

// Controle de teclas
let keys = {};
window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
});

// Loop principal do jogo
function updateGame() {
    if (keys[65]) player.moveLeft();
    if (keys[68]) player.moveRight();
    if (keys[32]) player.shoot();
}

setInterval(updateGame, 20); // Atualiza o jogo a cada 20ms
