import Phaser from 'phaser'

var width = navigator.isCocoonJS ? window.innerWidth : 320,
    height = navigator.isCocoonJS ? window.innerHeight : 480,
    game = new Phaser.Game(120, 190, Phaser.AUTO, '', {preload: preload, create: create, update: update}, false, false);

function preload () {
    game.load.image('sky_bg', SERVER_URL + '/assets/images/sky-bg.jpg');
    game.load.spritesheet('player', SERVER_URL + '/assets/images/jettio.png', 25, 32, 5);
    game.load.spritesheet('coin', SERVER_URL + '/assets/images/coin.png', 18, 18, 5);
    game.load.spritesheet('angry-cloud',SERVER_URL + '/assets/images/angry-cloud.png', 38, 31, 3);
    game.load.spritesheet('progress_bar', SERVER_URL + '/assets/images/progress_bar_sprite.png', 409, 110, 10);
    game.load.image('ground', SERVER_URL + '/assets/images/ground.png');
    game.load.image('bush', SERVER_URL + '/assets/images/bush.png');
}

var sky_bg,
    player = {
        group: null,
        character: null,
        jetpack: null,
        nitrFire: null
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
    bush;

var STAGE = {
    NOT_STARTED: "NOT_STARTED",
    INITATION: "INITATION",
    FLIGHT: "FLIGHT"
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
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
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

    // player = game.add.sprite(80, 140, 'player');
    game.physics.enable(player.character, Phaser.Physics.ARCADE);

    // //Progress bar
    // progressBar = game.add.sprite(game.world.width/2-205, game.world.height/4, 'progress_bar');
    // //progressBar.animations.add('change');
    // //progressBar.animations.play('change', 1, true);
    // timer = game.time.create(false);
    // timer.loop(1000, timerUpdate, this);
    // timer.start();

    // Keys
    cursors = game.input.keyboard.createCursorKeys();
    key.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    key.left.onDown.add(onKeyPress, this);
    key.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    key.right.onDown.add(onKeyPress, this);

    key.mouse = game.input.onDown.add(onKeyPress, this);

    key.pointer1 = game.input.mousePointer;
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
        player.character.position.x = game.world.width - 80;
        player.character.scale.x = 1;
    }
}

/*
* onRightPress - right input (key/tap/mouse) was fires
*/
function onRightPress () {
    if (player.character.alive) {
        // player update
        player.character.position.x = game.world.width - 30;
        player.character.anchor.setTo(.5, 0);
        player.character.scale.x = -1;
    }
}

/*
* update - Phaser updater container. 
* Contains everything what should be updated every thick.
*/
function update () {
    if (globalState === STAGE["INITATION"]) {
        ground.position.y += 0.3;
        bush.position.y += 0.4;

        if (ground.position.y > 190 && bush.position.y > 190) {
            globalState = STAGE["FLIGHT"];
            // here clear ground and bush (garbage collector needed)
        }
    } else if (globalState === STAGE["FLIGHT"]) {
        sky_bg.tilePosition.y += 0.4;
        if (Math.floor(Math.random()*6) % 5 === 0)
            sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5;

        // Check collision
        if (player.character.alive) {
            game.physics.arcade.overlap(coins, player.character, collisionHandler, null, this)
            game.physics.arcade.overlap(clouds, player.character, collisionHandler, null, this)
        }
    }    
}

/*
* collisionHandler - handle player's collision with objects
* @param {Object.Phaser.Sprite} player - player object
* @param {Object.Phaser.Sprite} obj - object involved in a collision
*/
function collisionHandler (player, obj) {
    if (obj.key === 'angry-cloud') {
        player.kill();
    } else {
        obj.kill();
        // if (progressBar.frame > 0) {
        //     progressBar.frame--;
        //     console.log("frames: " + progressBar.frame);
        // }
    }
}
