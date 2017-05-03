import Phaser from 'phaser'

var width = navigator.isCocoonJS ? window.innerWidth : 320,
    height = navigator.isCocoonJS ? window.innerHeight : 480,
    game = new Phaser.Game(1244, 1920, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload () {
    console.log("preload SERVER_URL: ", SERVER_URL);
game.load.image('sky_bg', SERVER_URL + '/assets/images/sky.png');
game.load.image('player', SERVER_URL + '/assets/images/boy.png');
game.load.image('star', SERVER_URL + '/assets/images/star.png');
game.load.image('cloud',SERVER_URL + '/assets/images/cloud.png');
game.load.spritesheet('progress_bar', SERVER_URL + '/assets/images/progress_bar_sprite.png', 409, 110, 10);
console.log('preloaded');
}

var sky_bg,
    player,
    cursors,
    touch,
    key = {},
    objects,
    objectsPos = -350,
    cloudyRow = false,
    tileSpeed = 10,
    progressBar,
    timer,
    life = 5;

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
    var ratio = getRatio('all', 320, 480);

    if (navigator.isCocoonJS) {
        game.world.scale.x = ratio.x;
        game.world.scale.y = ratio.y;
        game.world.updateTransform();
    } else {
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.minWidth = 320;
        game.scale.minHeight = 480;
        game.scale.pageAlignHorizontally = true;
        // game.scale.setScreenSize(true);
    }

    game.physics.startSystem(Phaser.Physics.ARCADE);
    sky_bg = game.add.tileSprite(0, 0, 1244, 1920, 'sky_bg');

    // Objects on the sky ;)
    objects = game.add.group();
    objects.enableBody = true;
    objects.physicsBodyType = Phaser.Physics.ARCADE;
    objFactory();

    // Player
    player = game.add.sprite(800, 1400, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //Progress bar
    progressBar = game.add.sprite(game.world.width/2-205, game.world.height/4, 'progress_bar');
    //progressBar.animations.add('change');
    //progressBar.animations.play('change', 1, true);
    timer = game.time.create(false);
    timer.loop(1000, timerUpdate, this);
    timer.start();

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
    var obj = [];

    if (Math.floor(Math.random()*6) % 5 === 0 && !cloudyRow) {
        cloudyRow = true;
        if (Math.floor(Math.random()*3) % 2 === 0) {
            obj[0] = 'star';
            obj[1] = 'cloud';
        } else {
            obj[0] = 'cloud';
            obj[1] = 'star';
        }
    } else {
        obj[0] = 'star';
        obj[1] = 'star';
        cloudyRow = false;
    }

    objects.create(300, objectsPos, obj[0]);
    objects.create(800, objectsPos, obj[1]);
}

/*
* onKeyPress - any input was fires (key/tap/mouse)
* @param {Object} event - input event
*/
function onKeyPress (event) {
    if (player.alive) {
        // objects update

        // Mode 1
        // sky_bg.tilePosition.y += 10;
        // objects.position.y += 300;
        // objectsPos -= 300;

        // Mode 2
        sky_bg.tilePosition.y += tileSpeed;
        objects.forEach(function (obj) { 
            console.log(obj.body.velocity.y);
                obj.body.velocity.y += 300;
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

/*
* onLeftPress - left input (key/tap/mouse) was fires
*/
function onLeftPress () {
    if (player.alive) {
        // player update
        player.position.x = game.world.width - 800;
        player.scale.x = 1;
    }
}

/*
* onRightPress - right input (key/tap/mouse) was fires
*/
function onRightPress () {
    if (player.alive) {
        // player update
        player.position.x = game.world.width - 300;
        player.anchor.setTo(.5, 0);
        player.scale.x = -1;
    }
}

/*
* update - Phaser updater container. 
* Contains everything what should be updated every thick.
*/
function update () {
    console.log("update SERVER_URL: ", SERVER_URL);
    sky_bg.tilePosition.y += 0.4;
    if (Math.floor(Math.random()*6) % 5 === 0)
        sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5;

    // Check collision
    if (player.alive) {
        game.physics.arcade.overlap(objects, player, collisionHandler, null, this)
    }
}

/*
* collisionHandler - handle player's collision with objects
* @param {Object.Phaser.Sprite} player - player object
* @param {Object.Phaser.Sprite} obj - object involved in a collision
*/
function collisionHandler (player, obj) {
    if (obj.key === 'cloud') {
        player.kill();
    } else {
        obj.kill();
        if (progressBar.frame > 0) {
            progressBar.frame--;
            console.log("frames: " + progressBar.frame);
        }
    }
}
