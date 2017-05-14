import Phaser from 'phaser'

var width = navigator.isCocoonJS ? window.innerWidth : 320,
    height = navigator.isCocoonJS ? window.innerHeight : 480,
    game = new Phaser.Game(120, 190, Phaser.AUTO, '', {preload: preload, create: create, update: update}, false, false);

function preload () {
    game.load.image('jettio-logotype', SERVER_URL + '/assets/images/jettio-logotype.png');
    game.load.image('sky_bg', SERVER_URL + '/assets/images/sky-bg.jpg');
    game.load.spritesheet('player', SERVER_URL + '/assets/images/jettio.png', 25, 32, 5);
    game.load.spritesheet('coin', SERVER_URL + '/assets/images/coin.png', 18, 18, 5);
    game.load.spritesheet('angry-cloud',SERVER_URL + '/assets/images/angry-cloud.png', 38, 31, 3);
    game.load.spritesheet('progress_bar', SERVER_URL + '/assets/images/progress_bar_sprite.png', 409, 110, 10);
    game.load.image('ground', SERVER_URL + '/assets/images/ground.png');
    game.load.image('bush', SERVER_URL + '/assets/images/bush.png');
    game.load.image('jetpack', SERVER_URL + '/assets/images/jetpack.png');
    game.load.spritesheet('nitro-fire', SERVER_URL + '/assets/images/nitro-fire.png', 11, 7, 3);
    game.load.image('game-over-panel', SERVER_URL + '/assets/images/game-over-panel.png');
    game.load.image('play-button', SERVER_URL + '/assets/images/play-button.png');
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
    objectsPos = -35,
    cloudyRow = false,
    tileSpeed = 10,
    progressBar,
    timer,
    life = 5,
    ground,
    bush,
    timers = {
        fire: 0
    },
    counters = {
        coins: 0
    },
    texts = {
        points: null,
        resultsPoints: null,
        distance: null,
        bonusPoints: null,
        gameOver: null
    },
    ui = {
        gameOverPanel: null,
        playButton: null
    };

var STAGE = {
    NOT_STARTED: "NOT_STARTED",
    INITATION: "INITATION",
    FLIGHT: "FLIGHT",
    GAME_OVER: "GAME_OVER"
};
var globalState = STAGE["NOT_STARTED"];

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
    // var ratio = getRatio('all', 120, 190);
    sky_bg = game.add.tileSprite(0, 0, 120, 190, 'sky_bg');
    ground = game.add.sprite(0, 156, 'ground');
    bush = game.add.sprite(0, 140, 'bush');
    game.stage.smoothed = false; // disable anty aliasing

    if (navigator.isCocoonJS) {
        game.world.scale.x = ratio.x;
        game.world.scale.y = ratio.y;
        game.world.updateTransform();
    } else {
        // game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.minWidth = 120;
        game.scale.minHeight = 190;
        game.scale.pageAlignHorizontally = true;
        // game.scale.setScreenSize(true);
    }

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

    objFactory();

    // Player
    player.group = game.add.group();
    player.character = player.group.create(80, 140, "player");
    player.jetpack = player.group.create(82, 155, "jetpack");
    player.jetpack.visible = false;
    player.nitroFire = player.group.create(89, 167, "nitro-fire");
    player.nitroFire.visible = false;

    // player = game.add.sprite(80, 140, 'player');
    game.physics.enable(player.character, Phaser.Physics.ARCADE);

    game.time.events.loop(Phaser.Timer.SECOND, updateFire, this);

    // //Progress bar
    // progressBar = game.add.sprite(game.world.width/2-205, game.world.height/4, 'progress_bar');
    // //progressBar.animations.add('change');
    // //progressBar.animations.play('change', 1, true);
    // timer = game.time.create(false);
    // timer.loop(1000, timerUpdate, this);
    // timer.start();

    // Points
    texts.points = game.add.text(28, 10, zeroFill(counters.coins, 6), {font: "14px Upheavtt", fill: "#fff"});
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

    texts.resultsPoints = game.add.text(60, 84, "Points: " + zeroFill(counters.coins, 6), {font: "12px Upheavtt", fill: "#fff"});
    texts.resultsPoints.anchor.setTo(0.5);
    texts.resultsPoints.stroke = "#000";
    texts.resultsPoints.strokeThickness = 2;
    texts.resultsPoints.visible = false;

    // ui.playButton = game.add.sprite(35, 135, "play-button");
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
    counters.coins = 0;
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

    player.character.revive();
    // player.character.alive = true;
    // game.physics.enable(player.character, Phaser.Physics.ARCADE);
    globalState = STAGE.NOT_STARTED;
}

function updateFire () {
    if (player.nitroFire.frame > 0 && (Date.now() - timers.fire) > Phaser.Timer.SECOND) {
        player.nitroFire.frame--;
    }
}

function timerUpdate () {
    life--;
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
    } else {
        var coin1 = coins.create(30, objectsPos, "coin");
        var coin2 = coins.create(80, objectsPos, "coin");

        coin1.animations.add('spin');
        coin1.animations.play('spin', 5, true);

        coin2.animations.add('spin');
        coin2.animations.play('spin', 5, true);

        cloudyRow = false;
    }

    // coins.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 2], 10, true);
    // coins.callAll('animations.play', 'animations', 'spin');

    // var obj = [];

    // if (Math.floor(Math.random()*6) % 5 === 0 && !cloudyRow) {
    //     cloudyRow = true;
    //     if (Math.floor(Math.random()*3) % 2 === 0) {
    //         obj[0] = 'coin';
    //         obj[1] = 'angry-cloud';
    //     } else {
    //         obj[0] = 'angry-cloud';
    //         obj[1] = 'coin';
    //     }
    // } else {
    //     obj[0] = 'coin';
    //     obj[1] = 'coin';
    //     cloudyRow = false;
    // }

    // objects.create(30, objectsPos, obj[0]);
    // objects.create(80, objectsPos, obj[1]);
}

/*
* onKeyPress - any input was fires (key/tap/mouse)
* @param {Object} event - input event
*/
function onKeyPress (event) {
    console.log("key pressed");
    if (globalState === STAGE["NOT_STARTED"]) {
        globalState = STAGE["INITATION"];
        player.character.frame = 1;
    }else if (globalState === STAGE["FLIGHT"]) {
        if (player.character.alive) {
            // objects update

            // Mode 1
            // sky_bg.tilePosition.y += 10;
            // objects.position.y += 300;
            // objectsPos -= 300;

            // Mode 2
            sky_bg.tilePosition.y += tileSpeed;
            
            timers.fire = Date.now();
            if (player.nitroFire.frame < 2) {
                player.nitroFire.frame++;
            }

            coins.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    tileSpeed = obj.body.velocity.y;
                }, this);
            clouds.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    tileSpeed = obj.body.velocity.y;
                }, this);

            objFactory();

            if (event.x <= this.game.width/2 || key.left.isDown) {
                onLeftPress();
            } else if (event.x > this.game.width/2 || key.right.isDown) {
                onRightPress();
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

        // player.character.position.x = game.world.width - 80;
        // player.character.scale.x = 1;
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

        // player.character.position.x = game.world.width - 30;
        // player.character.anchor.setTo(.5, 0);
        // player.character.scale.x = -1;
    }
}

/*
* update - Phaser updater container. 
* Contains everything what should be updated every thick.
*/
function update () {
    console.log("globalState: ", globalState);

    if (globalState === STAGE["INITATION"]) {
        jettioLogotype.y -= 0.4;
        ground.position.y += 0.3;
        bush.position.y += 0.4;

        player.jetpack.visible = true;
        player.nitroFire.visible= true;

        if (ground.position.y > 190 && bush.position.y > 190) {
            globalState = STAGE["FLIGHT"];
            // here clear ground and bush (garbage collector needed)
        }
    } else if (globalState === STAGE["FLIGHT"]) {
        texts.points.text = zeroFill(counters.coins, 6);
        sky_bg.tilePosition.y += 0.4;
        if (Math.floor(Math.random()*6) % 5 === 0)
            sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5;

        // Check collision
        if (player.character.alive) {
            game.physics.arcade.overlap(coins, player.character, collisionHandler, null, this)
            game.physics.arcade.overlap(clouds, player.character, collisionHandler, null, this)
        }
    } else if (globalState === STAGE["GAME_OVER"]) {
        ui.gameOverPanel.visible = true;
        texts.gameOver.visible = true;
        texts.resultsPoints.visible = true;
        texts.resultsPoints.text = "Points: " + zeroFill(counters.coins, 6);
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

        globalState = STAGE["GAME_OVER"];
    } else if (obj.key === "coin") {
        obj.kill();
        counters.coins++;
        // if (progressBar.frame > 0) {
        //     progressBar.frame--;
        //     console.log("frames: " + progressBar.frame);
        // }
    }
}

function zeroFill ( number, width ) {
  width -= number.toString().length;

  if (width > 0) {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }

  return number + "";
}
