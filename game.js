/*
  Code modified from:
  http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
  using graphics purchased from vectorstock.com
*/

/* * * * * * RAIN SECTION START * * * * * * * * */
// get the canvas and a 2d rendering context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

//an arbitrary amount of rain particles. Too much more than this and it starts getting slow on my laptop
const maxParts = 1000;
let particles = [];
for (let i = 0; i < maxParts; i++) {
  //each rain particle has a position(x,y), a length, and a velocity(x,y of course)
  particles.push({ 
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    l: Math.random(),//length of the rain drop
    xs: -4 + Math.random() * 4 + 2, //speed in the x-direction
    ys: Math.random() * 10 + 10 //speed goin down. Rain's going to be going down a lot faster than sideways
  })
}


let drawRain = function() {
  //set the style options
  ctx.strokeStyle = 'rgba(174,194,224,0.5)'; //kind of a light blue color, half opacity
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  //for each particle 
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    ctx.beginPath();//start drawing a line!
    ctx.moveTo(p.x, p.y);//move the pen to the particle's location
    ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys); //plot a line
    ctx.stroke();//aaand execute
  }
  move();//move all the raindrops after drawing
}

let move = function() {
  for (let i = 0; i < particles.length; i++) {//for each particle
    let p = particles[i];
    p.x += p.xs;//change position according to the particle's speed
    p.y += p.ys;
    if (p.x > canvas.width || p.y > canvas.height) {//if the particle leaves the canvas, move it back to the top somewhere
      p.x = Math.random() * canvas.width;
      p.y = -20;//well okay, technically above the top. give the particle some time to travel
    }
  }
}
/* * * * * * * RAIN SECTION END * * * * * * * */


/* * * * * * * BUTTON SECTION START * * * * * * */
//I've decided to add a button that you can click to restart the game without refreshing.
//can't really have a high score if the only way to restart is reloading the whole page, y'know?
//it's actually pretty simple, if still a lot more involved than doing it with html

let restartButton = {//using an object just so I have fewer values to mess with if I want to change things
  x: 131,
  y: 190,
  width: 250,
  height: 100,
};

let drawButton = function() {

  ctx.fillStyle="rgb(7, 206, 213)";
  ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "32px Helvetica white";
  //figure out how wide the button's text is, so it can be centered properly
  let textSize = ctx.measureText("Restart");
  //and then place the text
  let textX = restartButton.x + (restartButton.width/2) - (textSize.width / 2);
  let textY = restartButton.y + (restartButton.height/2) - 12;//to set the y position to the middle of the button, we gotta subtract half the font size (24px)
  ctx.fillText("Restart", textX, textY);
  //lets give the button a nice outline, too
  ctx.strokeStyle = "rgb(250, 250, 250)";
  ctx.strokeRect(restartButton.x,restartButton.y,restartButton.width, restartButton.height);
}

/* * * * * * BUTTON SECTION END * * * * * */


// load images, use the onload event so we can later wait for images to be there
// Load the background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () { 
  // show the background image
  bgReady = true;
};
bgImage.src = "images/grass2.png";
// Load the hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
  // show the here image
  heroReady = true;
};
heroImage.src = "images/hero2.png";

// Load the monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
  // show the monster image
  monsterReady = true;
};
monsterImage.src = "images/treasure2.png";


// Create the game objects
var hero = {
  speed: 256, // movement speed of hero in pixels per second
  x:0,
  y:0
};
var monster = {
  x:0,
  y:0
};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};  // empty object, we'll add stuff later
// Check for keys pressed where key represents the keycode captured
addEventListener("keydown", function (key) {
  keysDown[key.keyCode] = true;  // add an element to array storing value for which key they pushed
}, false);
addEventListener("keyup", function (key) {
  delete keysDown[key.keyCode];
}, false);
// what does the false do?   It determines whether or not the default browser behaviour should take place as well. 
// This is most noticeable in form submit handlers, where you can cancel a form submission if the user has made a
// mistake entering the information.

// Define a function to reset the player and monster positions when player catches a monster
var reset = function () {
  // Reset player's position to centre of canvas
  hero.x = canvas.width / 2;
  hero.y = canvas.height / 2;
  // Place the monster somewhere on the canvas randomly
  monster.x = 32 + (Math.random() * (canvas.width - 64));
  monster.y = 32 + (Math.random() * (canvas.height - 64));
};


// function that updates game objects - change player position based on which keys pressed
// checks values in the keysDown array that get set by a key down event
/*
(This probably trip up developers who come from a web development background.) 
In a nomral the web stack, it may be appropriate to begin animating or requesting data right
when the user initiates input. But in this flow, we want our game's logic to live solely in 
once place to retain tight control over when and if things happen. For that reason we just 
want to store the user input for later instead of acting on it immediately.

Also ... What may seem odd is the modifier argument passed into update. You'll see how this is 
referenced in the main function, The modifier is a time-based number based on 1. 
If exactly one second has passed, the value will be 1 and the hero's speed will be multiplied by 1, 
meaning he will have moved 256 pixels in that second. If one half of a second has passed, 
the value will be 0.5 and the hero will have moved half of his speed in that amount of time. 
And so forth. This function gets called so rapidly that the modifier value will typically be very low, 
but using this pattern will ensure that the hero will move the same speed no matter 
how fast (or slowly) the script is running.
*/

var update = function (modifier) {     // modifier parameter modifys the speed  value for character motion
  if (38 in keysDown || 87 in keysDown) { // Player is holding up key or 'w'
    hero.y -= hero.speed * modifier;
  }
  if (40 in keysDown || 83 in keysDown) { // Player is holding down key or 's'
    hero.y += hero.speed * modifier;
  }
  if (37 in keysDown || 65 in keysDown) { // Player is holding left key or 'a'
    hero.x -= hero.speed * modifier;
  }
  if (39 in keysDown || 68 in keysDown) { // Player is holding right key or 'd'
    hero.x += hero.speed * modifier;
  }
  // Check if player and monster collider
  if (
    hero.x <= (monster.x + 32)  // 32 is length and width of the characters
    && monster.x <= (hero.x + 32)
    && hero.y <= (monster.y + 32)
    && monster.y <= (hero.y + 32)
  ) {
    ++monstersCaught;  // count up in our score
    reset();  // call that function to move the player and monster
  }
  //wall collision detection
  if (hero.x < 0) {hero.x = 0}
  if (hero.x+32 > canvas.width) {hero.x = canvas.width-32}
  if (hero.y < 0) {hero.y = 0}
  if (hero.y+32 > canvas.height) {hero.y = canvas.height-32}
};

let highScore = 0;

// Function to Draw everything on the canvas
var render = function () {
  ctx.clearRect(0,0,512,480);
  if (bgReady) {                  // not really sure the use of this if, if its not ready, it fails anyhow??
    ctx.drawImage(bgImage, 0, 0);   // place image using the upper left corner, so 0,0
  }
  if (heroReady) {
    ctx.drawImage(heroImage, hero.x, hero.y);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, monster.x, monster.y);
  }
  
  // Display score and time 
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.globalAlpha = 0.3;
  ctx.fillRect(10,10,250,100);
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "rgb(250, 250, 250)";  // white text
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("High Score: " + highScore ,20,20);
  ctx.fillText("Treasure found: " + monstersCaught, 20, 50);
  ctx.fillText("Time: " + count, 20, 80);
  // Display game over message when timer finished
  if(finished==true){
    ctx.fillText("Game over!", 200, 160);
    //draw the restart button
    drawButton();
  }
};

var count = 30; // how many seconds the game lasts for - default 30
var finished = false;
var counter =function(){
  count=count-1; // countown by 1 every second
  // when count reaches 0 clear the timer, hide monster and
  // hero and finish the game
    if (count <= 0)
    {
      // stop the timer
       //clearInterval(counter);
       // set game to finished
       finished = true;
       count=0;
       // hider monster and hero
       monsterReady=false;
       heroReady=false;
       //set the high score
       if (monstersCaught > highScore) {
         highScore = monstersCaught;
       }

       canvas.addEventListener("mousedown", clickHandler, false);
    }
}

//this function resets the timer and everything needed to start the game again.
var restart = function() {
  count = 30;
  finished = false;
  monsterReady=true;
  heroReady=true;
  monstersCaught=0;
  canvas.removeEventListener("mousedown", clickHandler);
  //setInterval(counter,1000);
}
//this handles click events when the button is visible
var clickHandler = function(event) {
  if ((event.x > 131 && event.x < 381) && (event.y > 190 && event.y < 290)) {
    restart();
  }
}

// timer interval is every second (1000ms)
setInterval(counter, 1000);  // see explanation below, only being used to count down the game seconds
// The main game loop
var main = function () {
  
  update(0.02); // check state of keys and for collisions, pass in a modifier  which "scales" the speed based on how
                // fast the requestAnimationFrame is cycling (fast or slow browser)
  render();   // redraw everything
  drawRain(); //put the rain on top
  
  
  requestAnimationFrame(main);   // Request to do this again ASAP
};
// Cross-browser support for requestAnimationFrame
requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
/*
// To continuously call the main game loop function, this tutorial used to execute the setInterval method. 
// These days there's a better way, via the requestAnimationFrame method. However, as with most new web technologies, 
// some code is needed to ensure cross-browser support.
// */



// Let's play this game!
reset();  // place 2 char's for the first time
main();   // start the loop that tics of game cycles

/*
The setInterval() method calls a function or evaluates an expression at specified intervals (in milliseconds).
The setInterval() method will continue calling the function until clearInterval() is called, or the window is closed.
The ID value returned by setInterval() is used as the parameter for the clearInterval() method.
Tip: 1000 ms = 1 second.
Tip: To execute a function only once, after a specified number of milliseconds, use the setTimeout() method.
*/