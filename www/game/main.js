import Phaser from 'phaser';

import {preloader} from "./preloader";

import {LEVEL} from "./consts/levels";
import {STAGE} from "./consts/stage";

import {state} from "./state";
import {timers} from "./timers";

const width = 320;
const height = 480;
const game = new Phaser.Game(
    120, 
    190, 
    Phaser.AUTO, 
    "game", 
    {
        preload: preload, 
        create: create, 
        update: update
    }, 
    false,
    false
);
 
function preload () {
    preloader(game);
}

var sky_bg,
    jettioLogotype,
    player = {
        group: null,
        character: null,
        jetpack: null,
        nitroFire: null
    },
    cursors,
    touch,
    key = {},
    objects,
    coins,
    clouds,
    nitros,
    objectsPos = -35,
    cloudyRow = false,
    progressBar,
    ground,
    bush,
    texts = {
        points: null,
        resultsPoints: null,
        distance: null,
        bonusPoints: null,
        gameOver: null,
        level: null
    },
    ui = {
        gameOverPanel: null,
        playButton: null
    };

function getRatio(type, w, h) {
    var scaleX = width / w,
        scaleY = height / h,
        result = {
            x: 1,
            y: 1
        };

    switch (type) {
    case 'all':
        result.x = scaleX > scaleY ? scaleY : scaleX;
        result.y = scaleX > scaleY ? scaleY : scaleX;
        break;
    case 'fit':
        result.x = scaleX > scaleY ? scaleX : scaleY;
        result.y = scaleX > scaleY ? scaleX : scaleY;
        break;
    case 'fill':
        result.x = scaleX;
        result.y = scaleY;
        break;
    }

    return result;
}

/*
* Create - predefine actions
*/
function create () {
    sky_bg = game.add.tileSprite(0, 0, 120, 190, 'sky_bg');
    ground = game.add.sprite(0, 156, 'ground');
    bush = game.add.sprite(0, 140, 'bush');
    game.stage.smoothed = false; // disable anti aliasing

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.minWidth = 120;
    game.scale.minHeight = 190;
    game.scale.pageAlignHorizontally = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Objects on the sky ;)
    objects = game.add.group();
    objects.enableBody = true;
    objects.physicsBodyType = Phaser.Physics.ARCADE;

    // conins
    coins = game.add.group();
    coins.enableBody = true;
    coins.physicsBodyType = Phaser.Physics.ARCADE;

    // clouds
    clouds = game.add.group();
    clouds.enableBody = true;
    clouds.physicsBodyType = Phaser.Physics.ARCADE;

    // nitros
    nitros = game.add.group();
    nitros.enableBody = true;
    nitros.physicsBodyType = Phaser.Physics.ARCADE;

    objFactory();

    // Player
    player.group = game.add.group();
    player.character = player.group.create(80, 140, "player");
    player.jetpack = player.group.create(82, 155, "jetpack");
    player.jetpack.visible = false;
    player.nitroFire = player.group.create(89, 167, "nitro-fire");
    player.nitroFire.visible = false;

    game.physics.enable(player.character, Phaser.Physics.ARCADE);

    game.time.events.loop(Phaser.Timer.SECOND, updateFire, this);

    //Progress bar
    progressBar = game.add.sprite(game.world.width/2-31, Math.floor(game.world.height/4), 'progress_bar');
    progressBar.visible = false;
    timers.fuel = game.time.create(false);
    timers.fuel.loop(2000, timerUpdate, this);

    // Points
    texts.points = game.add.text(28, 10, zeroFill(state.counter.coins, 6), {font: "14px Upheavtt", fill: "#fff"});
    texts.points.anchor.setTo(0.5);

    // texts.points.font = 'Upheavtt';
    // texts.points.fontSize = 14;
    texts.points.stroke = "#000";
    texts.points.strokeThickness = 2;
    // texts.points.setShadow(2, 2, "#333333", 2, false, false);

    //Jettio logotype
    jettioLogotype = game.add.sprite(16, 16, "jettio-logotype");

    // Game over
    ui.gameOverPanel = game.add.sprite(5, 50, "game-over-panel");
    ui.gameOverPanel.visible = false;
    texts.gameOver = game.add.text(game.world.centerX, 65, "Game Over", {font: "14px Upheavtt", fill: "#fff"});
    texts.gameOver.anchor.setTo(0.5);
    texts.gameOver.stroke = "#000";
    texts.gameOver.strokeThickness = 2;
    texts.gameOver.visible = false;

    texts.resultsPoints = game.add.text(60, 84, "Points: " + zeroFill(state.counter.coins, 6), {font: "12px Upheavtt", fill: "#fff"});
    texts.resultsPoints.anchor.setTo(0.5);
    texts.resultsPoints.stroke = "#000";
    texts.resultsPoints.strokeThickness = 2;
    texts.resultsPoints.visible = false;

    ui.playButton = game.add.button(game.world.centerX - 28, 135, 'play-button', restartGame, this);
    ui.playButton.visible = false;

    // Keys
    cursors = game.input.keyboard.createCursorKeys();
    key.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    key.left.onDown.add(onKeyPress, this);
    key.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    key.right.onDown.add(onKeyPress, this);

    key.mouse = game.input.onDown.add(onKeyPress, this);

    key.pointer1 = game.input.mousePointer;
}

function restartGame () {
    // counters
    state.counter.coins = 0;
    timers.fire = 0;

    // visibility
    ui.gameOverPanel.visible = false;
    ui.playButton.visible = false;
    player.character.visible = true;
    texts.gameOver.visible = false;
    texts.resultsPoints.visible = false;

    // positions
    ground.position.y = 156;
    bush.position.y = 140;
    jettioLogotype.position.y = 16;

    coins.forEach((coin) => {
        coin.kill();
    })

    clouds.forEach((cloud) => {
        cloud.kill();
    });

    nitros.forEach((nitro) => {
        nitro.kill();
    });

    player.character.revive();
    state.gameState = STAGE.NOT_STARTED;
}

function updateFire () {
    if (player.nitroFire.frame > 0 && (Date.now() - timers.fire) > Phaser.Timer.SECOND) {
        player.nitroFire.frame--;
    }
}

function timerUpdate () {
    progressBar.frame++;
}

/*
* objFactory - create new row with objects
*/
function objFactory () {

    if (Math.floor(Math.random()*6) % 5 === 0 && !cloudyRow) {
        cloudyRow = true;
        if (Math.floor(Math.random()*3) % 2 === 0) {
            var coin = coins.create(30, objectsPos, "coin");
            clouds.create(80, objectsPos, "angry-cloud");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        } else {
            clouds.create(30, objectsPos, "angry-cloud");
            var coin = coins.create(80, objectsPos, "coin");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        }
    } else if (Math.floor(Math.random()*6) % 5 === 0 && !cloudyRow) {
        if (Math.floor(Math.random()) > 0.5) {
            const nitro = nitros.create(30, objectsPos, "nitro-bottle");
            const coin = coins.create(80, objectsPos, "coin");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        } else {
            const coin = coins.create(30, objectsPos, "coin");
            const nitro = nitros.create(80, objectsPos, "nitro-bottle");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        }   
    } else {
        var coin1 = coins.create(30, objectsPos, "coin");
        var coin2 = coins.create(80, objectsPos, "coin");

        coin1.animations.add('spin');
        coin1.animations.play('spin', 5, true);

        coin2.animations.add('spin');
        coin2.animations.play('spin', 5, true);

        cloudyRow = false;
    }
}

/*
* onKeyPress - any input was fires (key/tap/mouse)
* @param {Object} event - input event
*/
function onKeyPress (event) {
    if (state.gameState === STAGE.NOT_STARTED) {
        state.gameState = STAGE.INITATION;
        player.character.frame = 1;
        progressBar.visible = true;
    }else if (state.gameState === STAGE.FLIGHT) {
        if (player.character.alive) {
            // objects update
            sky_bg.tilePosition.y += state.tileSpeed;
            
            timers.fire = Date.now();
            if (player.nitroFire.frame < 2) {
                player.nitroFire.frame++;
            }

            coins.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this);
            clouds.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this);
            nitros.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this); 

            objFactory();

            if (event.x <= this.game.width/2 || key.left.isDown) {
                const delayTimer = game.time.create(true);
                delayTimer.add(0, () => {
                    onLeftPress();
                }, this);
                delayTimer.start();
            } else if (event.x > this.game.width/2 || key.right.isDown) {
                const delayTimer = game.time.create(true);
                delayTimer.add(0, () => {
                    onRightPress();
                }, this);
                delayTimer.start();
            }
        }
    }
}

/*
* onLeftPress - left input (key/tap/mouse) was fires
*/
function onLeftPress () {
    if (player.character.alive) {
        // player update
        player.group.forEach((element) => {
            element.position.x = game.world.width - 80;
            element.scale.x = 1;
        });
    }
}

/*
* onRightPress - right input (key/tap/mouse) was fires
*/
function onRightPress () {
    if (player.character.alive) {
        // player update
        player.group.forEach((element) => {
            element.position.x = game.world.width - 30;
            element.anchor.setTo(.5, 0);
            element.scale.x = -1;
        });
    }
}

/*
* update - Phaser updater container. 
* Contains everything what should be updated every thick.
*/
function update () {
    if (state.gameState === STAGE.NOT_STARTED) {
        player.group.forEach((element) => {
            element.position.x = 80;
        });
    } else if (state.gameState === STAGE.INITATION) {
        jettioLogotype.y -= 0.4;
        ground.position.y += 0.3;
        bush.position.y += 0.4;

        player.jetpack.visible = true;
        player.nitroFire.visible= true;

        if (ground.position.y > 190 && bush.position.y > 190) {
            state.gameState = STAGE.FLIGHT;
            timers.fuel = game.time.create(false);
            timers.fuel.loop(1000, timerUpdate, this);
            timers.fuel.start();
            // here clear ground and bush (garbage collector needed)
        }
    } else if (state.gameState === STAGE.FLIGHT) {
        texts.points.text = zeroFill(state.counter.coins, 6);
        sky_bg.tilePosition.y += 0.4;
        state.counter.distance += 1;
        renderLevelInfo(state.counter.distance);

        if (Math.floor(Math.random()*6) % 5 === 0)
            sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5;

        // Check collision
        if (player.character.alive) {
            game.physics.arcade.overlap(coins, player.character, collisionHandler, null, this)
            game.physics.arcade.overlap(clouds, player.character, collisionHandler, null, this)
            game.physics.arcade.overlap(nitros, player.character, collisionHandler, null, this)
        }

        // Check available nitro
        if (progressBar.frame === 11) {
            player.character.kill();
            player.jetpack.visible = false;
            player.nitroFire.visible = false;

            state.gameState = STAGE.GAME_OVER;
            progressBar.visible = false;
            progressBar.frame = 0;
            timers.fuel.stop();
            state.counter.distance = 0;
        }
    } else if (state.gameState === STAGE.GAME_OVER) {
        ui.gameOverPanel.visible = true;
        texts.gameOver.visible = true;
        texts.resultsPoints.visible = true;
        texts.resultsPoints.text = "Points: " + zeroFill(state.counter.coins, 6);
        ui.playButton.visible = true;
    }
}

/*
* collisionHandler - handle player's collision with objects
* @param {Object.Phaser.Sprite} player - player object
* @param {Object.Phaser.Sprite} obj - object involved in a collision
*/
function collisionHandler (char, obj) {
    if (obj.key === "angry-cloud") {
        char.kill();
        player.jetpack.visible = false;
        player.nitroFire.visible = false;

        state.gameState = STAGE.GAME_OVER;
        progressBar.visible = false;
        progressBar.frame = 0;
        timers.fuel.stop();
    } else if (obj.key === "coin") {
        obj.kill();
        state.counter.coins++;
        // if (progressBar.frame > 0) {
        //     progressBar.frame--;
        // }
    } else if (obj.key === "nitro-bottle") {
        obj.kill();
        if (progressBar.frame > 0) {
            timers.fuel.stop();
            timers.fuel.loop(1000, timerUpdate, this);
            timers.fuel.start();
            progressBar.frame--;
        }
    }
}

function renderLevelInfo(distance) {
    if (distance > LEVEL[state.level].dist) {
        console.log("New Level");
        texts.level = game.add.text(60, 84, LEVEL[state.level].name, {font: "12px Upheavtt", fill: "#fff"});
        texts.level.anchor.setTo(0.5);
        texts.level.stroke = "#000";
        texts.level.strokeThickness = 2;
        texts.level.visible = true;

        game.time.events.add(Phaser.Timer.SECOND * 3, () =>{texts.level.visible = false;}, this);

        state.level++;
    }
}

// Utils
function zeroFill ( number, width ) {
  width -= number.toString().length;

  if (width > 0) {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }

  return number + "";
}
