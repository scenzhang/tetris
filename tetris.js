class Board {
  constructor(cols = 10, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.boardArr = [];
    this.lose = false;
    this.interval;
    this.currentPiece = null;
    this.currentX = null;
    this.currentY = null;
    this.score = 0;
    this.clear();
    this.pieces = [
      [
        1, 1, 1, 1,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        1, 1, 1, 0,
        1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        1, 1, 1, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        1, 1, 0, 0,
        1, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        1, 1, 0, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        0, 1, 1, 0,
        1, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      [
        0, 1, 0, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    ];
  }
  addPiece() {
    var i = Math.floor(Math.random() * this.pieces.length); //keep i to index into colors
    var piece = this.pieces[i];

    this.currentPiece = [];
    for (var y = 0; y < 4; y++) {
      this.currentPiece[y] = [];
      for (var x = 0; x < 4; x++) {
        var pieceIdx = 4 * y + x; //index into the piece array which is 1d
        this.currentPiece[y][x] = piece[pieceIdx] ? i + 1 : 0; //subtract 1 when rendering to get correct color, or don't render if 0
      }
    }
    this.currentX = this.cols / 2;
    this.currentY = 0;
  }
  clear() {
    this.boardArr = Array.from({
      length: this.rows
    }, () => Array.from({
      length: this.cols
    }, () => 0));
  }

  tick() {
    if (this.valid(0, 1)) {
      this.currentY++;
    } else {
      //piece has reached bottom
      this.setPiece();
      this.clearLines();
      if (this.lose) {
        // newGame();
        return false;
      }
      this.addPiece();
    }
  }
  setPiece() {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        if (this.currentPiece[y][x]) {
          this.boardArr[y + this.currentY][x + this.currentX] = this.currentPiece[y][x]; //currenty and x are where current starts
        }
      }
    }
  }
  rotateCurrRight() {
    var newCurr = [];
    for (var y = 0; y < 4; y++) {
      newCurr[y] = [];
      for (var x = 0; x < 4; x++) {
        newCurr[y][x] = this.currentPiece[x][3 - y];
      }
    }
    return newCurr;
  }
  rotateCurrLeft() {
    var newCurr = [];
    for (var y = 0; y < 4; y++) {
      newCurr[y] = [];
      for (var x = 0; x < 4; x++) {
        newCurr[y][x] = this.currentPiece[3 - x][y];
      }
    }
    return newCurr;
  }

  clearLines() {
    for (var y = this.rows - 1; y >= 0; y--) {
      var filled = true;
      for (var x = 0; x < this.cols; x++) {
        if (this.boardArr[y][x] == 0) {
          filled = false;
          break;
        }
      }
      if (filled) {
        this.score++;
        for (var clearY = y; clearY > 0; clearY--) {
          for (var x = 0; x < this.cols; x++) {
            this.boardArr[clearY][x] = this.boardArr[clearY - 1][x]; //'drop' line above
          }
        }
        y++; //we just cleared the line at y so have to check the new line at y again
      }
    }
  }

  valid(xOffset = 0, yOffset = 0, piece = this.currentPiece) {

    var newX = xOffset + this.currentX;
    var newY = yOffset + this.currentY;
    for (var y = 0; y < 4; y++) {
      var pieceY = y + newY;
      for (var x = 0; x < 4; x++) {
        var pieceX = x + newX;
        if (piece[y][x]) {
          if (typeof this.boardArr[pieceY] === 'undefined' ||
            typeof this.boardArr[pieceY][pieceX] === 'undefined' ||
            this.boardArr[pieceY][pieceX] ||
            pieceX < 0 || pieceX >= this.cols || pieceY < 0 || pieceY >= this.rows) {
              if (newY === 1) this.lose = true; //current piece is at the top and invalid, so lose
              return false;
          }
        }
      }
    }
    return true;
  }

  moveCurr(move) {
    switch (move) {
      case 'left':
        if (this.valid(-1)) {
          this.currentX--;
        }
        break;
      case 'right':
        if (this.valid(1)) {
          this.currentX++;
        }
        break;
      case 'down':
        if (this.valid(0, 1)) {
          this.currentY++;
        }
        break;
      case 'rotLeft':
        var rotated = this.rotateCurrLeft();
        if (this.valid(0, 0, rotated)) {
          this.currentPiece = rotated;
        }
        break;
      case 'rotRight':
        var rotated = this.rotateCurrRight();
        if (this.valid(0, 0, rotated)) {
          this.currentPiece = rotated;
        }
        break;
      default:
        break;
    }
  }


}

class Game {
  constructor(board, ctx, width = 300, height = 600) {
    this.board = board;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.colors = ['cyan', 'orange', 'blue', 'yellow', 'red', 'lightgreen', 'magenta'];
    this.interval = null;
  }
  drawSquare(x, y) {
    var squareWidth = this.width / this.board.cols;
    var squareHeight = this.height / this.board.rows;
    this.ctx.fillRect(squareWidth * x, squareHeight * y, squareWidth - 1, squareHeight - 1);
    this.ctx.strokeRect(squareWidth * x, squareHeight * y, squareWidth - 1, squareHeight - 1);
  }

  render() {
    $('#score').html(this.board.score);
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = 'black';
    for (var x = 0; x < this.board.cols; x++) {
      for (var y = 0; y < this.board.rows; y++) {
        if (this.board.boardArr[y][x]) {
          this.ctx.fillStyle = this.colors[this.board.boardArr[y][x] - 1];
          this.drawSquare(x, y);
        }
      }
    }

    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        if (this.board.currentPiece[y][x]) {
          this.ctx.fillStyle = this.colors[this.board.currentPiece[y][x] - 1];
          this.drawSquare(this.board.currentX + x, this.board.currentY + y);
        }
      }
    }
  }
}

var game = new Game(new Board(), $('#canvas')[0].getContext('2d'));
game.board.addPiece();
game.interval = setInterval( () => {
  game.board.tick();
}, 250);
setInterval( () => game.render(), 30);
var keys = {
  37: 'left',
  39: 'right',
  38: 'rotLeft',
  40: 'down',
  82: 'rotRight',
  32: 'drop'

};
$('body').keydown(function (e) {
  game.board.moveCurr(keys[e.which]);
  game.render();
});