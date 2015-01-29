// Stores some data about the game state
var gameState = {
    columnWidth: 101,
    rowHeight: 83,
    enemyRows: [1, 2, 3],
    enemyCount: 3,
    minEnemySpeed: 100,
    maxEnemySpeed: 400,
    totalRows: 6,
    totalColumns: 5,
    score: 0,
    randomEnemyRow: function() {
        return gameHelpers.drawRandom(this.enemyRows);
    },
    render: function() {
        // Add the score to the canvas
        var scoreText = "Score: " + this.score;

        ctx.font = "16pt Impact";
        ctx.fillStyle = "White";
        ctx.fillText(scoreText, 20, 100);

        ctx.strokeStyle = "Black";
        ctx.lineWidth = 2;
        ctx.strokeText(scoreText, 20, 100);
    }
};

// Provides simple helpers
var gameHelpers = {
    // Returns a random number between min and max inclusive
    random: function(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    },
    // Draws a random element from an array
    drawRandom: function(arr) {
        return arr[this.random(0, arr.length - 1)];
    }
};

// Enemies our player must avoid
var Enemy = function() {
    this.reset();

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += (dt * this.speed);

    if (this.x > gameState.totalColumns * gameState.columnWidth) this.reset();
    if (this.collidesWithPlayer(player)) player.kill();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Resets the enemy to a new initial state.
Enemy.prototype.reset = function() {
    this.x = -gameState.columnWidth;
    this.row = gameState.randomEnemyRow();
    this.y = gameState.rowHeight * this.row - 20;

    this.speed = gameHelpers.random(gameState.minEnemySpeed, gameState.maxEnemySpeed);
};

// Determines if a player and enemy collide
Enemy.prototype.collidesWithPlayer = function(player) {
    var rowCollision = this.row === player.row;

    var hitbox = player.hitbox();
    // if the enemy is in the player's hitbox
    var colCollision = this.x + gameState.columnWidth >= hitbox.left && this.x <= hitbox.right;

    return rowCollision && colCollision;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

// Our player
var Player = function() {
    this.reset();
    this.sprite = 'images/char-boy.png';
};

// Updates the position of the player given the input
Player.prototype.update = function() {
    if (!this.input) return;

    if (this.input === 'left' && this.column > 0) {
        this.column--;
    } else if (this.input === 'right' && this.column < gameState.totalColumns - 1) {
        this.column++;
    } else if (this.input === 'down' && this.row < gameState.totalRows - 1) {
        this.row++;
    } else if (this.input === 'up' && this.row > 0) {
        this.row--;
        if (this.row === 0) this.score();
    }
    this.input = null;
};

// Draws the player on the board
Player.prototype.render = function() {
    var x =  gameState.columnWidth * this.column;
    var y = gameState.rowHeight * this.row - 30;
    ctx.drawImage(Resources.get(this.sprite), x, y);
};

// Saves the input so it can be applied
Player.prototype.handleInput = function(input) {
    // only allow one input per update
    this.input = input;
};

// Resets the player to the initial position
Player.prototype.reset = function() {
    this.input = null;
    this.column = 2;
    this.row = 5;

    // number of pixels enemy has to enter column to register a hit
    this.hitOffset = 40;
};

// Called when the player scores to make gameState adjustments and reset
// their position.
Player.prototype.score = function() {
    gameState.score += 20;

    // Increase the enemy speed going forward
    gameState.minEnemySpeed *= 1.2;
    gameState.maxEnemySpeed *= 1.2;

    this.reset();
};

// Called when an enemy kills the player; resets the player and makes gameState
// adjustements
Player.prototype.kill = function() {
    gameState.score -= 10;

    // Decrease the enemy speed for the next iteration,
    // but don't let it get too slow
    gameState.minEnemySpeed = Math.max(10, gameState.minEnemySpeed * 0.8);
    gameState.maxEnemySpeed = Math.max(40, gameState.maxEnemySpeed * 0.8);

    this.reset();
};

// Returns a left and right hitbox for the player that can be used in collision
// detection.
Player.prototype.hitbox = function() {
    return {
        left: this.column * gameState.columnWidth + this.hitOffset,
        right: (this.column + 1) * gameState.columnWidth - this.hitOffset
    };
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i=0; i<gameState.enemyCount; i++) {
    allEnemies.push(new Enemy());
}
var player = new Player();



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
