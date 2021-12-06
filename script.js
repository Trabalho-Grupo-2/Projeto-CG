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

// GLOBAL VARIABLES//
let score = 0,
  acelleration = 0.1,
  angle = 0,
  enemyCount = 20,
  chanceOfEncounter = 1,
  scores = [],
  health = 3,
  playerName = "",
  secondSeconds = 999999999999999,
  spaceshipColor = "spaceshipWhite",
  backShoot = false,
  InsertNameAnimationTimer,
  powerUpTimer,
  pwSlowAsteroids = false,
  myLeaderBoard = localStorage.getItem("Leaderboard") ? JSON.parse(localStorage.getItem("Leaderboard")) : []

//SPACESHIP COLOR

let color = ["Blue", "Green", "Pink", "Red", "White", "Yellow"];

//MOUSE COORDINATES//

let x, y;

//GAMESTART AND BACKBUTTON CONTROL BOOL //
let gamestart = false,
  backButtonBool = false,
  insertNameBool = false,
  arrowHeadBool = false;

// OBJECT ARRAYS // 

const asteroids = [],
  ships = [],
  missiles = [],
  powerUps = [],
  enemyMissiles = [];

//IMPORTING SPRITES AND ADDING TO ARRAY //

let images = {};
loadImage("asteroid");
loadSpaceship(spaceshipColor);
loadImage("enemy");
loadImage("undo");
loadImage("heart");
loadImage("arrowHeadLeft");
loadImage("arrowHeadRight");
loadImage("heartred");
loadImage("bullet");
loadImage("clock");

function loadImage(name) {
  images[name] = new Image();
  images[name].src = "sprites/" + name + ".png";
  images[name].onload = function () { };
}

function loadSpaceship(name) {
  images["spaceshipColor"] = new Image();
  images["spaceshipColor"].src = "sprites/" + name + ".png";
  images["spaceshipColor"].onload = function () { }
}

for (var i = 0; i < color.length; i++) {
  loadSpaceship("spaceship" + color[i])
}
// CONTROLS//

let keys = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  SpaceBar: false,
};

//SETTING CONTROL KEYS //

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

  if (arrowHeadBool == true) {
    if (x >= 190 && x <= 270 && y >= 320 && y <= 405) {
      changeColor(-1)
    }
    if (x >= 640 && x <= 720 && y >= 320 && y <= 405) {
      changeColor(1)
    }
  }
});

// PLAYER CLASS WITH METHODS //

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.velocity = 0;
    this.maxVelocity = 6;
    this.minVelocity = 0
    this.size = 50;
    this.image = images.spaceshipColor;
  }

  accelerate() {
    if (this.velocity < this.maxVelocity) {
      this.velocity += 0.02;
    }
  }

  brake() {
    if (this.velocity > this.minVelocity) {
      this.velocity -= 0.08;
    }
    if (this.velocity < 0) {
      this.velocity = 0;
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

    this.x += this.velocity * Math.cos(this.angle * Math.PI / 180 - (Math.PI / 2));
    this.y += this.velocity * Math.sin(this.angle * Math.PI / 180 - (Math.PI / 2));

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

  changeColor() {
    this.image = images.spaceshipColor;
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
    this.xVelocity = Math.round(Math.random() * 3 + 0.5) / 3;
    this.yVelocity = Math.round(Math.random() * 3 + 0.5) / 3;
    this.image = images.asteroid;
    this.size = Math.round(Math.random() * 50 + 50);
    if (pwSlowAsteroids) {
      this.xVelocity = this.xVelocity / 2;
      this.yVelocity = this.yVelocity / 2
    }
  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.x < -300 || this.x > W + 300 || this.y < -300 || this.y > H + 300) {
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
      } else {
        this.xVelocity = -this.xVelocity
      }
    }
    if (this.signalX == 1 && this.signalY == 1) {
      this.startX = Math.round(Math.random() * W);
      this.startY = H + 200;
      if (this.startX > W / 2) {
        this.xVelocity = -this.xVelocity
        this.yVelocity = -this.yVelocity
      } else {
        this.yVelocity = -this.yVelocity
      }
    }
  }
  destroy() {
    asteroids.splice(asteroids.indexOf(this), 1);
    let roll = Math.random();
    if (roll > 0.02) {
      asteroids.push(
        new Asteroid())
      asteroids[asteroids.length - 1].getStartLocation()
    } else {
      ships.push(
        new Ship(Math.round(Math.random() * W), Math.round(Math.random() * H))
      );
    }
  }
}

//ENEMY SHIP CLASS DEFINITION //

class Ship {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.signalX = 0;
    this.signalY = 0;
    this.getStartLocation();
    this.x = this.startX;
    this.y = this.startY;
    this.angle = 0;
    this.size = 50;
    this.image = images.enemy;
    this.xVelocity = Math.round(Math.random() * 3 + 0.5) / 5;
    this.yVelocity = Math.round(Math.random() * 3 + 0.5) / 5;
    this.shoot = setInterval(() => {
      enemyMissiles.push(new EnemyMissile(this.x+ this.size/2, this.y+this.size/2,(Math.random() * 360) * (180/Math.PI)));
},1000)

  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.x < -this.size / 2) {
      this.x = W;
    }
    if (this.x > W + this.size / 2) {
      this.x = -this.size / 2;
    }
    if (this.y < 0 - this.size / 2) {
      this.y = H;
    }
    if (this.y > H) {
      this.y = this.size / 2;
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
    ships.splice(ships.indexOf(this), 1);
    clearInterval(this.shoot);
    let roll = Math.random();
    if (roll > 0.02) {
      asteroids.push(
        new Asteroid(
        ))
      asteroids[asteroids.length - 1].getStartLocation()
    }
    else {
      ships.push(
        new Ship
      );
    }
  }
}

//ENEMY MISSILES CLASS DEFINITION //

class EnemyMissile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.color = "red";
    this.size = 7;
    this.velocity = 3;
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
      enemyMissiles.splice(enemyMissiles.indexOf(this), 1);
    }
  }
}

//PLAYER MISSILE CLASS DEFINITION //

class Missile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.color = "white";
    this.size = 7;
    this.velocity = 3;
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
  firstSecond = (firstSecond - (firstSecond % 1000)) / 500;

  if (secondSeconds < firstSecond && backShoot == false) {
    missiles.push(new Missile(myPlayer.x, myPlayer.y, myPlayer.angle));
  }
  if (secondSeconds < firstSecond && backShoot == true) {
    missiles.push(new Missile(myPlayer.x, myPlayer.y, myPlayer.angle));
    missiles.push(new Missile(myPlayer.x, myPlayer.y, myPlayer.angle + 180));

  }


  secondSeconds = firstSecond
}

//FUNCTION THAT CHOOSES IF WE CREATE AN ASTEROID OR AN ENEMY SHIP (10% CHANGE IT IS A SHIP)//

function createAsteroidsOrEnemys() {
  chanceOfEncounter = Math.round(Math.random() * chanceOfEncounter);
  if (chanceOfEncounter > 0.9) {
    ships.push(
    );
    enemyCount--;

    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid()
      )
    }
    enemyCount++;

  } else {
    for (let i = 0; i < enemyCount; i++) {
      asteroids.push(
        new Asteroid()
      );

    }

  }
}

// CLASS FOR POWERUPS //

class PowerUp {
  constructor(image) {
    this.image = image;
    this.size = 30;
    this.x = this.size / 2 + (Math.random() * (W - this.size / 2));
    this.y = this.size / 2 + (Math.random() * (H - this.size / 2));
    setTimeout(() => {
      this.destroy();
    }, 5000)

  }
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }
  destroy() {
    powerUps.pop();
    console.log("destroyed");
  }
}

// FUNCTION THAT ROLLS A DICE FOR A POWER UP //

function PowerupHandler() {
  setInterval(() => {
    let roll = Math.random();

    if (roll < 1 / 3) {
      powerUps.push(new PowerUp(images.heartred));

    }
    else if (roll < 2 / 3) {
      powerUps.push(new PowerUp(images.bullet));

    }
    else {
      powerUps.push(new PowerUp(images.clock));
    }
  }, 10000)
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

  document.getElementById('canvas1').style.cursor = 'none';
  loadSpaceship(spaceshipColor);
  myPlayer.changeColor()
  PowerupHandler();
  render();
}

//FUNCTIONS TO INSERT NAME ON CANVAS //

function insertName() {
  insertNameBool = true
  document.getElementById("menu").style.display = "none";
  clear();

  playerName = ""

  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Insert Name", W / 2, H / 5);
  backButton();

  clearInterval(InsertNameAnimationTimer)
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

  clearInterval(InsertNameAnimationTimer)
  typeWritter(ctx.measureText(playerName).width)

}

//FUNCTION THAT CREATES THE TYPEWRITTER EFFECT //

function typeWritter(nameLength) {
  let flag = false;
  InsertNameAnimationTimer = setInterval(function () {
    if (flag) {
      flag = false;
      ctx.fillRect(W / 2 + (nameLength) / 2, H / 2 + 7, 20, 6)
    } else {
      flag = true;
      ctx.clearRect(W / 2 + (nameLength) / 2, H / 2 + 7, 20, 6)
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

function options() {
  document.getElementById("menu").style.display = "none";
  clear();

  ctx.font = "45px llpixel";
  ctx.textAlign = "center";
  ctx.fillText("Options", W / 2, H / 5);
  backButton();
  changeColorSprite();

  arrowHeadBool = true;

  ctx.drawImage(images.arrowHeadLeft, (W / 6) - 20, H / 2 - 40, 200, 200)
  ctx.drawImage(images.arrowHeadRight, ((W / 6) * 4) - 20, H / 2 - 40, 200, 200)
}

//FUNCTIONS TO CHANGE SHIP COLOR//

function changeColor(n) {

  let index = color.indexOf(spaceshipColor.replace("spaceship", "")) + n

  if (index == color.length) {
    index = 0
  }
  if (index == -1) {
    index = color.length - 1
  }
  spaceshipColor = "spaceship" + color[index]

  changeColorSprite();
}

function changeColorSprite() {
  loadSpaceship(spaceshipColor);
  ctx.drawImage(images.spaceshipColor, (W / 2) - 90, (H / 2) - 45, 180, 180)
}

//FUNCTION TO CALL THE GAME MENU//

function callMenu() {
  clear();
  clearInterval(InsertNameAnimationTimer)
  clearInterval(powerUpTimer)

  health = 3;
  document.getElementById("menu").style.display = "inline-block";
  let bg = document.getElementById("canvas1");
  bg.style.backgroundImage = "url(sprites/galaxy.gif)";
  bg.style.backgroundSize = "cover";
  gamestart = false;
  insertNameBool = false;
  arrowHeadBool = false;
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
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 25, 30);
}

// LEADERBOARD FILTER //

function filterLeaderboard(a, b) {

  if (a.pScore < b.pScore) {
    return 1;
  }
  if (a.pScore > b.pScore) {
    return -1;
  }
  return 0;
}

//FUNCTION TO PERSIST LOCALLY BEST 5 SCORES //

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

// SETTING INICIAL ENEMYS //

createAsteroidsOrEnemys();


// GLOBAL FUNCTION TO DETECT COLISIONS //
function checkColision(obj1, obj2) {
  if (
    obj1.x + obj1.size >= obj2.x &&
    obj1.x <= obj2.x + obj2.size &&
    obj1.y + obj1.size >= obj2.y &&
    obj1.y <= obj2.y + obj2.size
  ) {
    return true;
  }
}

// SPECIFIC FUNCTIONS TO LOOK FOR COLISIONS BETWEEN CERTAIN OBJECTS AND RESPECTIVE EFFECTS //

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
      ships.push(new Ship);
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
        missile.x = 1000;
        missile.y = 1000;
        ship.destroy();
        score += 500;
      }
    }
  }
  for ( enemyMissile of enemyMissiles) {
    if( checkColision(myPlayer,enemyMissile)){
      health--;
      myPlayer.x = W / 2 - 50;
      myPlayer.y = H / 2 - 50;
      myPlayer.angle = 0;
      enemyMissile.x = -300;
      enemyMissile.y = -300;
      enemyMissile.destroy();
    }
  }
  for (powerUp of powerUps) {
    if (checkColision(myPlayer, powerUp)) {
      if (powerUp.image == images.heartred) {
        health++;
      }
      if (powerUp.image == images.bullet) {
        backShoot = true;
        setTimeout(() => {
          backShoot = false;
        }, 5000);
      }
      if (powerUp.image == images.clock) {
        pwSlowAsteroids = true;
        asteroids.forEach(function (asteroid) {
          asteroid.xVelocity = asteroid.xVelocity / 2;
          asteroid.yVelocity = asteroid.yVelocity / 2;
        })
        setTimeout(() => {
          pwSlowAsteroids = false;
          asteroids.forEach(function (asteroid) {
            asteroid.xVelocity = asteroid.xVelocity * 2;
            asteroid.yVelocity = asteroid.yVelocity * 2;
          })
        }, 5000)

      }
      console.log("colision");
      powerUp.destroy();
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

    powerUps.forEach(powerUp => {
      powerUp.draw();
    })

    ships.forEach(spaceship => {
      spaceship.draw();
      spaceship.update();
    });

    myPlayer.turnShip();
    myPlayer.update();
    
    if (keys.ArrowUp == false) {
      myPlayer.brake();
    }
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
    enemyMissiles.forEach((missile) => {
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