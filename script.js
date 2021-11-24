// Getting the DOM element//
const canvas = document.querySelector("#canvas1");
// Getting its 2D rendering context//
const ctx = canvas.getContext("2d");

//CANVAS SIZE//
const W = canvas.width,
  H = canvas.height;

//FONTS AND STYLES//
ctx.fillStyle = "white";
ctx.font = "40px llpixel";

//VARIABLES//
let score = 0,
  acelleration = 0.1,
  angle = 0,
  enemyCount = 20,
  chanceOfEncounter = 1,
  scores = [],
  health = 3,
  playerName = "",
  secondSeconds = 999999999999999,
  flag = true,
  myLeaderBoard = localStorage.getItem("Leaderboard") ? JSON.parse(localStorage.getItem("Leaderboard")) : []

var myVar

//MOUSE COORDINATES//
let x, y;

//GAMESTART AND BACKBUTTON CONTROL BOOL
let gamestart = false,
  backButtonBool = false,
  insertNameBool = false;

// object arrays
const asteroids = [],
  ships = [],
  missiles = [];

//sprite imports
let images = {};
loadImage("asteroid");
loadImage("spaceship");
loadImage("enemy");
loadImage("undo");
loadImage("heart");

function loadImage(name) {
  images[name] = new Image();
  images[name].src = "sprites/" + name + ".png";
  images[name].onload = function () { };
}

// CONTROLS//

let keys = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  SpaceBar: false,
};

//ASSOCIATE METHODS ON KEYS DOWNS FOR MOVIMENT //

addEventListener("keydown", (event) => {
  if (event.key == "ArrowUp") {
    keys.ArrowUp = true;
  }
  if (event.key == "ArrowLeft") {
    keys.ArrowLeft = true;
  }
  if (event.key == "ArrowRight") {
    keys.ArrowRight = true;
  }
  if (event.keyCode == 32) {
    keys.SpaceBar = true;
    pushMissiles();
  }
  if (insertNameBool) {
    if (event.keyCode == 13) {
      startGame()
    }
    if (event.keyCode >= 65 && event.keyCode <= 90) {
      writeName(event.key)
    }
  }

  event.preventDefault();
});

//GIVE EFFECT TO KEYUP FOR MOVIMENT //
addEventListener("keyup", (event) => {
  if (event.key == "ArrowUp") {
    keys.ArrowUp = false;
  }
  if (event.key == "ArrowLeft") {
    keys.ArrowLeft = false;
  }
  if (event.key == "ArrowRight") {
    keys.ArrowRight = false;
  }
  if (event.keyCode == 32) {
    keys.SpaceBar = false;
  }
});

// DETECT MOUSE COORDENATES //

addEventListener("mousemove", (event) => {
  x = event.offsetX;
  y = event.offsetY;
  event.preventDefault();
});

//DETECT CLICK FOR BACK BUTTON //

addEventListener("click", () => {
  if (backButtonBool == true && x >= 750 && x <= 800 && y >= 85 && y <= 127) {
    callMenu();
  }
});

// PLAYER CLASS WITH METHODS //

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.maxVelocity = 2;
    this.size = 50;
    this.image = images.spaceship;
  }

  accelerate() {
    if (this.velocity < this.maxVelocity) {
      this.velocity += 0.02;
    }

    this.x += this.velocity * Math.cos(this.angle * Math.PI / 180 - (Math.PI / 2));
    this.y += this.velocity * Math.sin(this.angle * Math.PI / 180 - (Math.PI / 2));

  }

  brake() {
    if (this.velocity > this.minVelocity) {
      this.velocity -= 0.5;
    }
  }

  shoot() {
    Missile.draw();
  }

  turnLeft() {
    this.angle <= 0 ? (this.angle = 359) : (this.angle -= 1);
    this.turnShip();
  }

  turnRight() {
    this.angle >= 360 ? (this.angle = 1) : (this.angle += 1);
    this.turnShip();
  }

  turnShip() {
    ctx.save();

    ctx.translate(this.x + (this.size / 2), this.y + (this.size / 2));
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }

  update() {
    if (this.y < -this.size) {
      this.y = H;
    }
    if (this.y > H + this.size) {
      this.y = 0;
    }
    if (this.x < -this.size) {
      this.x = W;
    }
    if (this.x > W + this.size) {
      this.x = 0;
    }
  }
}

//CREATING NEW PLAYER FROM PREVIOUS CLASS//
const myPlayer = new Player(W / 2 - 50, H / 2 - 50);

// ASTEROIDS CLASS DEFINITION WITH METHODS//

class Asteroid {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.signalX = 0;
    this.signalY = 0;
    this.getStartLocation();
    this.x = this.startX;
    this.y = this.startY;
    this.xVelocity = Math.round(Math.random() * 3 + 0.5) / 5,
    this.yVelocity = Math.round(Math.random() * 3 + 0.5) / 5
    this.image = images.asteroid;
    this.size = Math.round(Math.random() * 70 + 30);
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if(this.x< -300 || this.x > W + 300 || this.y < -300 || this.y > H + 300){
      this.destroy();
    }
    this.x += this.xVelocity;
    this.y += this.yVelocity;
  }
  getStartLocation() {
    this.signalX = Math.round(Math.random() * 1);
    this.signalY = Math.round(Math.random() * 1);
    if (this.signalX == 0 && this.signalY == 0) {
      this.startX = Math.round(Math.random() * W);
      this.startY = -200;
      if (this.startX > W / 2) {
        this.xVelocity = -this.xVelocity
      }
    }
    if (this.signalX == 0 && this.signalY == 1) {
      this.startX = -200;
      this.startY = Math.round(Math.random() * H);
      if (this.startY > H / 2) {
        this.yVelocity = -this.yVelocity
      }
    }
    if (this.signalX == 1 && this.signalY == 0) {
      this.startX = W + 200;
      this.startY = Math.round(Math.random() * H);
      if (this.startY > H / 2) {
        this.xVelocity = -this.xVelocity
        this.yVelocity = -this.yVelocity
      }
      else {
        this.xVelocity = -this.xVelocity
      }
    }
    if (this.signalX == 1 && this.signalY == 1) {
      this.startX = Math.round(Math.random() * W);
      this.startY = H + 200;
      if (this.startX > W / 2) {
        this.xVelocity = -this.xVelocity
        this.yVelocity = -this.yVelocity
      }
      else {
        this.yVelocity = -this.yVelocity
      }
    }
  }
  destroy() {
    asteroids.splice(asteroids.indexOf(this), 1);
    let roll = Math.random();
    if(roll > 0.1){
    asteroids.push(
      new Asteroid(
      ))
      asteroids[asteroids.length-1].getStartLocation()
  }
  else{
    ships.push(
      new Ship(Math.round(Math.random() * W), Math.round(Math.random() * H))
    );
  }
}

}

//ENEMY SHIP CLASS DEFINITION //

class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.size = 50;
    this.image = images.enemy;
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.x > 0) {
      this.x = W - this.size;
    }
    if (this.x - this.size > W) {
      this.x = 0;
    }
    if (this.y - this.size < 0) {
      this.y = H;
    }
    if (this.y > H) {
      this.y = this.size;
    }
  }
  destroy() {
    ships.splice(ships.indexOf(this), 1);
  }
}

//PLAYER MISSILE CLASS DEFINITION //

class Missile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.color = "white";
    this.size = 10;
    this.velocity = 2;
    this.angle = angle;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.arc(this.x + (myPlayer.size / 2) * Math.cos(this.angle * Math.PI / 180 - (Math.PI / 2)), this.y - (myPlayer.size / 2) * Math.cos(this.angle * Math.PI / 180 - (Math.PI / 2)), this.size, 0, 2 * Math.PI)


    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.x += this.velocity * Math.cos(this.angle * Math.PI / 180 - (Math.PI / 2));
    this.y += this.velocity * Math.sin(this.angle * Math.PI / 180 - (Math.PI / 2));

  }
  destroy() {
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > W) {
      missiles.splice(missiles.indexOf(this), 1);
    }
  }
}

//METHOD TO ADD MISSILES TO THE ARRAY //

function pushMissiles() {

  firstSecond = new Date().getTime();
  firstSecond = (firstSecond - (firstSecond % 1000)) / 1000;

  if (secondSeconds < firstSecond) {
    missiles.push(new Missile(myPlayer.x, myPlayer.y, myPlayer.angle));
  }

  secondSeconds = firstSecond
}

//FUNCTION THAT CHOOSES IF WE CREATE AN ASTEROID OR AN ENEMY SHIP (10% CHANGE IT IS A SHIP)//

function createAsteroidsOrEnemys() {
  chanceOfEncounter = Math.round(Math.random() * chanceOfEncounter);
  if (chanceOfEncounter > 0.9) {
    ships.push(
      new Ship(Math.round(Math.random() * W), Math.round(Math.random() * H))
    );
    enemyCount--;

    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid(
        )
      )
    }
    enemyCount++;

  } else {
    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid(
        )
      );

    }

  }
}

//FUNCTION TO CLEAR CANVAS//

function clear() {
  ctx.clearRect(0, 0, W, H);
}

//FUNCTION TO START THE GAME ASSOCIATED TO HTML BUTTON//

function startGame() {
  gamestart = true;
  insertNameBool = false;
  document.getElementById("menu").style.display = "none";
  document.getElementById("canvas1").style.backgroundColor = "black";
  document.getElementById("canvas1").style.backgroundImage = "";
  console.log("Game started");
  render();
}

function insertName() {
  insertNameBool = true
  document.getElementById("menu").style.display = "none";
  clear();

  playerName = ""

  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Insert Name", W / 2, H / 5);
  backButton();

  clearInterval(myVar)
  typeWritter(0)
}

function writeName(char) {
  clear();

  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Insert Name", W / 2, H / 5);
  backButton();

  playerName += char

  ctx.fillText(playerName, W / 2, H / 2);

  clearInterval(myVar)
  typeWritter(ctx.measureText(playerName).width)

}

function typeWritter(nameLength) {
  myVar = setInterval(function () {
    if (flag) {
      flag = false;
      console.log("sim")
      ctx.fillRect(W / 2 + (nameLength)/2, H / 2 + 7, 20, 6)
    } else {
      flag = true;
      console.log("nao")
      ctx.clearRect(W / 2 + (nameLength)/2, H / 2 + 7, 20, 6)
    }
  }, 600)
}

//FUNCTION TO DISPLAY LEADERBOARD ASSOCIATED TO HTML BUTTON//

function leaderBoard() {
  document.getElementById("menu").style.display = "none";
  clear();
  backButton();
  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Leaderboard", W / 2, H / 5);
  ctx.font = "30px llpixel"
  ctx.fillText(`Name:`, W / 3.2, H / 3);
  ctx.font = "30px llpixel"
  ctx.fillText(`Score:`, W / 1.5, H / 3);
  for (let i = 1; i <= myLeaderBoard.length; i++) {
    ctx.font = "30px llpixel"
    ctx.fillText(`${myLeaderBoard[i - 1].pName}`, W / 3.2, H / 3 + (50 * i))
    ctx.font = "30px llpixel"
    ctx.fillText(`${myLeaderBoard[i - 1].pScore}`, W / 1.5, H / 3 + (50 * i))
  }

}

//FUNCTION TO DISPLAY HELP MENU ASSOCIATED TO HTML BUTTON//

function help() {
  document.getElementById("menu").style.display = "none";
  clear();
  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Help", W / 2, H / 5);
  backButton();
}

//FUNCTION TO CALL THE GAME MENU//

function callMenu() {
  clear();
  health = 3;
  document.getElementById("menu").style.display = "inline-block";
  let bg = document.getElementById("canvas1");
  bg.style.backgroundImage = "url(sprites/galaxy.gif)";
  bg.style.backgroundSize = "cover";
  gamestart = false;
  insertNameBool = false;
}

//FUNCTION THAT DEFINES THE BACKBUTTON//

function backButton() {
  backButtonBool = true;
  ctx.drawImage(images.undo, W - 150, 80, 50, 50);
}

//FUNCTION TO DISPLAY POINTS AND HP//

function displayHUD() {
  for (let i = 1; i < health + 1; i++) {
    ctx.drawImage(images.heart, 25 * i, 45, 20, 20);
  }
  ctx.font = "20px llpixel";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 25, 30);
}

function filterLeaderboard(a, b) {

  if (a.pScore < b.pScore) {
    return 1;
  }
  if (a.pScore > b.pScore) {
    return -1;
  }
  return 0;
}

function insertScore() {

  myLeaderBoard.push({
    pName: playerName,
    pScore: score
  });
  myLeaderBoard.sort(filterLeaderboard);
  if (myLeaderBoard.length > 5) {
    myLeaderBoard.pop();
  }
  localStorage.setItem("Leaderboard", JSON.stringify(myLeaderBoard));
}

createAsteroidsOrEnemys();

function checkColision(obj1, obj2) {
  if (
    obj1.x + obj1.size / 2 >= obj2.x - obj2.size / 2 &&
    obj1.x - obj1.size / 2 <= obj2.x + obj2.size / 2 &&
    obj1.y + obj1.size / 2 >= obj2.y - obj2.size / 2 &&
    obj1.y - obj1.size / 2 <= obj2.y + obj2.size / 2
  ) {
    return true;
  }
}

function colisionHandler() {
  for (asteroid of asteroids) {
    if (checkColision(myPlayer, asteroid)) {
      asteroid.destroy();
      health--;
      myPlayer.x = W / 2 - 50;
      myPlayer.y = H / 2 - 50;
      myPlayer.angle = 0;
    }
  }
  for (ship of ships) {
    if (checkColision(myPlayer, ship)) {
      ship.destroy();
      ships.push(new Ship(Math.round(Math.random() * W), Math.round(Math.random() * H)));
      health--;
    }
  }

  for (missile of missiles) {
    for (asteroid of asteroids) {
      if (checkColision(missile, asteroid)) {
        asteroid.destroy();
        missile.x = 1000;
        missile.y = 1000;
        missile.destroy();
        score += 100;
      }
    }
  }
  for (missile of missiles) {
    for (ship of ships) {
      if (checkColision(missile, ship)) {
        ship.destroy();
        ships.push()
        score += 1000;
      }
    }
  }
}

//RENDER FUNCTION//

function render() {
  if (gamestart == true) {
    clear();
    colisionHandler();
    asteroids.forEach((asteroid) => {
      asteroid.draw();
      asteroid.update();
    });

    ships.forEach(spaceship => {
      spaceship.draw();
    });

    myPlayer.turnShip();
    myPlayer.update();

    if (keys.ArrowUp == true) {
      myPlayer.accelerate();
    }
    if (keys.ArrowLeft == true) {
      myPlayer.turnLeft();
    }
    if (keys.ArrowRight == true) {
      myPlayer.turnRight();
    }
    if (keys.SpaceBar == true) {
      pushMissiles();
    }

    missiles.forEach((missile) => {
      missile.draw();
      missile.update();
      missile.destroy();
    });

    displayHUD();
    if (health == 0) {
      insertScore();
      callMenu();
      window.location.reload()
    }
  }
  requestAnimationFrame(render);
}