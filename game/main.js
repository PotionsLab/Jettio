var game = new Phaser.Game(1244, 1920, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload () {
   game.load.image('sky_bg', '../assets/images/sky.png');
   game.load.image('player', '../assets/images/boy.png');
   game.load.image('star', '../assets/images/star.png');
   game.load.image('cloud', '../assets/images/cloud.png');
   console.log('preloaded');
}

var sky_bg,
    player,
    cursors,
    key = {},
    objects,
    objectsPos = 250,
    cloudyRow = false,
    animatedObj;

/*
 * Create - predefine actions
 */
function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    sky_bg = game.add.tileSprite(0, 0, 1244, 1920, 'sky_bg');

    // Player
    player = game.add.sprite(300, 1400, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // Keys
    cursors = game.input.keyboard.createCursorKeys();
    key.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    key.left.onDown.add(leftArrowKey, this);
    key.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    key.right.onDown.add(rightArrowKey, this);

    // Objects on the sky ;)
    objects = game.add.group();
    objects.enableBody = true;
    objects.physicsBodyType = Phaser.Physics.ARCADE;
    objRow(null);

    // Animation to objects
    animatedObj = game.add.group();
    animatedObj.enableBody = true;
    animatedObj.physicsBodyType = Phaser.Physics.ARCADE;
    animatedObj.create(350, 1450, 'star');
    animatedObj.create(850, 1450, 'star');
    animatedObj.visible = true;
    animatedObj.children[0].visible = false;
}

/*
 * objRow - create new row with objects
 */
function objRow () {
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
 * leftArrowKey - left arrow key was fires
 */
function leftArrowKey () {
    if (player.alive) {
        sky_bg.tilePosition.y += 10;
        objects.position.y += 300;
        objectsPos -= 300;
        objRow(objectsPos);
    }
}

/*
 * rightArrowKey - right arrow key was fires
 */
function rightArrowKey () {
    if (player.alive) {
        sky_bg.tilePosition.y += 10;
        objects.position.y += 300;
        objRow(objectsPos);
    }
}

/*
 * update - Phaser updater container. Contains everything what should be updated every thick.
 */
function update () {
    sky_bg.tilePosition.y += 0.4;
    if (Math.floor(Math.random()*6) % 5 === 0)
        sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5

    if (player.alive) {
        console.log(objects.length);
        if (cursors.left.isDown) {
            player.body.position.x = 300;
            player.scale.x = 1;
        } else if (cursors.right.isDown) {
            player.body.position.x = 800;
            player.anchor.setTo(.5, 0);
            player.scale.x = -1;
        }
        // Check collision
        game.physics.arcade.overlap(objects, player, collisionHandler, null, this)
    }
}

/*
 * collisionHandler - handle player's collision with objects
 */
function collisionHandler (player, obj) {
    console.log('Collision happend!');

    if (obj.key === 'cloud') {
        player.kill();
        console.log('Death! :(');
    } else {
        obj.kill();
    }
}
