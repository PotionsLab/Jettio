/* globals __DEV__ */
import Phaser from 'phaser'
// import Mushroom from '../sprites/Mushroom'

import {preloader} from "../preloader";

import {zeroFill} from "../utils";

import {LEVEL} from "../consts/levels";
import {STAGE} from "../consts/stage";

import {state} from "../state";
import {timers} from "../timers";

export default class extends Phaser.State {
  init () {}
  preload () {
    // preloader(game);
  }

  create () {
    this.sky_bg = this.add.tileSprite(0, 0, 120, 190, 'sky_bg');
    this.ground = this.add.sprite(0, 156, 'ground');
    this.bush = this.add.sprite(0, 140, 'bush');
    // this.stage.smoothed = false; // disable anti aliasing

    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.scale.minWidth = 120;
    // this.scale.minHeight = 190;
    // this.scale.pageAlignHorizontally = true;

    this.physics.startSystem(Phaser.Physics.ARCADE);

    // Objects on the sky ;)
    this.objects = this.add.group();
    this.objects.enableBody = true;
    this.objects.physicsBodyType = Phaser.Physics.ARCADE;

    // conins
    this.coins = this.add.group();
    this.coins.enableBody = true;
    this.coins.physicsBodyType = Phaser.Physics.ARCADE;

    // clouds
    this.clouds = this.add.group();
    this.clouds.enableBody = true;
    this.clouds.physicsBodyType = Phaser.Physics.ARCADE;

    // nitros
    this.nitros = this.add.group();
    this.nitros.enableBody = true;
    this.nitros.physicsBodyType = Phaser.Physics.ARCADE;

    this.objFactory();

    // Player
    this.player = {
        group: null,
        character: null,
        jetpack: null,
        nitroFire: null
    };
    this.player.group = this.add.group();
    this.player.character = this.player.group.create(80, 140, "player");
    this.player.jetpack = this.player.group.create(82, 155, "jetpack");
    this.player.jetpack.visible = false;
    this.player.nitroFire = this.player.group.create(89, 167, "nitro-fire");
    this.player.nitroFire.visible = false;

    this.physics.enable(this.player.character, Phaser.Physics.ARCADE);

    this.time.events.loop(Phaser.Timer.SECOND, this.updateFire, this);

    //Progress bar
    this.progressBar = this.add.sprite(this.world.width/2-31, Math.floor(this.world.height/4), 'progress_bar');
    this.progressBar.visible = false;
    timers.fuel = this.time.create(false);
    timers.fuel.loop(2000, this.timerUpdate, this);

    // Points
    this.texts = {
        points: null,
        resultsPoints: null,
        distance: null,
        bonusPoints: null,
        gameOver: null,
        level: null
    };
    this.texts.points = this.add.text(28, 10, zeroFill(state.counter.coins, 6), {font: "14px Upheavtt", fill: "#fff"});
    this.texts.points.anchor.setTo(0.5);

    // texts.points.font = 'Upheavtt';
    // texts.points.fontSize = 14;
    this.texts.points.stroke = "#000";
    this.texts.points.strokeThickness = 2;
    // texts.points.setShadow(2, 2, "#333333", 2, false, false);

    //Jettio logotype
    this.jettioLogotype = this.add.sprite(16, 16, "jettio-logotype");

    // Game over
    this.ui = {
        gameOverPanel: null,
        playButton: null
    };
    this.ui.gameOverPanel = this.add.sprite(5, 50, "game-over-panel");
    this.ui.gameOverPanel.visible = false;
    this.texts.gameOver = this.add.text(this.world.centerX, 65, "Game Over", {font: "14px Upheavtt", fill: "#fff"});
    this.texts.gameOver.anchor.setTo(0.5);
    this.texts.gameOver.stroke = "#000";
    this.texts.gameOver.strokeThickness = 2;
    this.texts.gameOver.visible = false;

    this.texts.resultsPoints = this.add.text(60, 84, "Points: " + zeroFill(state.counter.coins, 6), {font: "12px Upheavtt", fill: "#fff"});
    this.texts.resultsPoints.anchor.setTo(0.5);
    this.texts.resultsPoints.stroke = "#000";
    this.texts.resultsPoints.strokeThickness = 2;
    this.texts.resultsPoints.visible = false;

    this.ui.playButton = this.add.button(this.world.centerX - 28, 135, 'play-button', this.restartGame, this);
    this.ui.playButton.visible = false;

    // Keys
    this.key = {
        left: null,
        right: null,
        mouse: null
    };
    this.key.left = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.key.left.onDown.add(this.onKeyPress, this);
    this.key.right = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.key.right.onDown.add(this.onKeyPress, this);

    this.key.mouse = this.input.onDown.add(this.onKeyPress, this);

    this.objectsPos = -35;
    this.cloudyRow = false;
  }

  update () {
    if (state.gameState === STAGE.NOT_STARTED) {
        this.player.group.forEach((element) => {
            element.position.x = 80;
        });
    } else if (state.gameState === STAGE.INITATION) {
        this.jettioLogotype.y -= 0.4;
        this.ground.position.y += 0.3;
        this.bush.position.y += 0.4;

        this.player.jetpack.visible = true;
        this.player.nitroFire.visible= true;

        if (this.ground.position.y > 190 && this.bush.position.y > 190) {
            state.gameState = STAGE.FLIGHT;
            timers.fuel = this.time.create(false);
            timers.fuel.loop(1000, this.timerUpdate, this);
            timers.fuel.start();
            // here clear ground and bush (garbage collector needed)
        }
    } else if (state.gameState === STAGE.FLIGHT) {
        this.texts.points.text = zeroFill(state.counter.coins, 6);
        this.sky_bg.tilePosition.y += 0.4;
        state.counter.distance += 1;
        this.renderLevelInfo(state.counter.distance);

        if (Math.floor(Math.random()*6) % 5 === 0)
            this.sky_bg.tilePosition.x += Math.random() * 1.5 + -0.5;

        // Check collision
        if (this.player.character.alive) {
            this.physics.arcade.overlap(this.coins, this.player.character, this.collisionHandler, null, this)
            this.physics.arcade.overlap(this.clouds, this.player.character, this.collisionHandler, null, this)
            this.physics.arcade.overlap(this.nitros, this.player.character, this.collisionHandler, null, this)
        }

        // Check available nitro
        if (this.progressBar.frame === 11) {
            this.player.character.kill();
            this.player.jetpack.visible = false;
            this.player.nitroFire.visible = false;

            state.gameState = STAGE.GAME_OVER;
            this.progressBar.visible = false;
            this.progressBar.frame = 0;
            timers.fuel.stop();
            state.counter.distance = 0;
        }
    } else if (state.gameState === STAGE.GAME_OVER) {
        this.ui.gameOverPanel.visible = true;
        this.texts.gameOver.visible = true;
        this.texts.resultsPoints.visible = true;
        this.texts.resultsPoints.text = "Points: " + zeroFill(state.counter.coins, 6);
        this.ui.playButton.visible = true;
    }
}

  restartGame () {
    // counters
    state.counter.coins = 0;
    timers.fire = 0;

    // visibility
    this.ui.gameOverPanel.visible = false;
    this.ui.playButton.visible = false;
    this.player.character.visible = true;
    this.texts.gameOver.visible = false;
    this.texts.resultsPoints.visible = false;

    // positions
    this.ground.position.y = 156;
    this.bush.position.y = 140;
    this.jettioLogotype.position.y = 16;

    this.coins.forEach((coin) => {
        coin.kill();
    })

    this.clouds.forEach((cloud) => {
        cloud.kill();
    });

    this.nitros.forEach((nitro) => {
        nitro.kill();
    });

    this.player.character.revive();
    state.gameState = STAGE.NOT_STARTED;
  }

  updateFire () {
    if (this.player.nitroFire.frame > 0 && (Date.now() - timers.fire) > Phaser.Timer.SECOND) {
        this.player.nitroFire.frame--;
    }
  }

  timerUpdate () {
    this.progressBar.frame++;
  }

  objFactory () {

    if (Math.floor(Math.random()*6) % 5 === 0 && !this.cloudyRow) {
        this.cloudyRow = true;
        if (Math.floor(Math.random()*3) % 2 === 0) {
            var coin = this.coins.create(30, this.objectsPos, "coin");
            this.clouds.create(80, this.objectsPos, "angry-cloud");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        } else {
            this.clouds.create(30, this.objectsPos, "angry-cloud");
            var coin = this.coins.create(80, this.objectsPos, "coin");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        }
    } else if (Math.floor(Math.random()*6) % 5 === 0 && !this.cloudyRow) {
        if (Math.floor(Math.random()) > 0.5) {
            const nitro = this.nitros.create(30, this.objectsPos, "nitro-bottle");
            const coin = this.coins.create(80, this.objectsPos, "coin");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        } else {
            const coin = this.coins.create(30, this.objectsPos, "coin");
            const nitro = this.nitros.create(80, this.objectsPos, "nitro-bottle");

            coin.animations.add('spin');
            coin.animations.play('spin', 5, true);
        }   
    } else {
        var coin1 = this.coins.create(30, this.objectsPos, "coin");
        var coin2 = this.coins.create(80, this.objectsPos, "coin");

        coin1.animations.add('spin');
        coin1.animations.play('spin', 5, true);

        coin2.animations.add('spin');
        coin2.animations.play('spin', 5, true);

        this.cloudyRow = false;
    }
  }

  onKeyPress (event) {
    if (state.gameState === STAGE.NOT_STARTED) {
        state.gameState = STAGE.INITATION;
        this.player.character.frame = 1;
        this.progressBar.visible = true;
    }else if (state.gameState === STAGE.FLIGHT) {
        if (this.player.character.alive) {
            // objects update
            this.sky_bg.tilePosition.y += state.tileSpeed;
            
            timers.fire = Date.now();
            if (this.player.nitroFire.frame < 2) {
                this.player.nitroFire.frame++;
            }

            this.coins.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this);
            this.clouds.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this);
            this.nitros.forEach(function (obj) { 
                    obj.body.velocity.y += 30;
                    state.tileSpeed = obj.body.velocity.y;
                }, this); 

            this.objFactory();

            if (event.x <= this.game.width/2 || this.key.left.isDown) {
                const delayTimer = this.time.create(true);
                delayTimer.add(0, () => {
                    this.onLeftPress();
                }, this);
                delayTimer.start();
            } else if (event.x > this.game.width/2 || this.key.right.isDown) {
                const delayTimer = this.time.create(true);
                delayTimer.add(0, () => {
                    this.onRightPress();
                }, this);
                delayTimer.start();
            }
        }
    }
  }

  onLeftPress () {
    if (this.player.character.alive) {
        // player update
        this.player.group.forEach((element) => {
            element.position.x = this.world.width - 80;
            element.scale.x = 1;
        });
    }
  }

  onRightPress () {
    if (this.player.character.alive) {
        // player update
        this.player.group.forEach((element) => {
            element.position.x = this.world.width - 30;
            element.anchor.setTo(.5, 0);
        });
    }
  }

  collisionHandler (char, obj) {
    if (obj.key === "angry-cloud") {
        char.kill();
        this.player.jetpack.visible = false;
        this.player.nitroFire.visible = false;

        state.gameState = STAGE.GAME_OVER;
        this.progressBar.visible = false;
        this.progressBar.frame = 0;
        timers.fuel.stop();
    } else if (obj.key === "coin") {
        obj.kill();
        state.counter.coins++;
        // if (progressBar.frame > 0) {
        //     progressBar.frame--;
        // }
    } else if (obj.key === "nitro-bottle") {
        obj.kill();
        if (this.progressBar.frame > 0) {
            timers.fuel.stop();
            timers.fuel.loop(1000, this.timerUpdate, this);
            timers.fuel.start();
            this.progressBar.frame--;
        }
    }
  }

  renderLevelInfo(distance) {
    if (distance > LEVEL[state.level].dist) {
        console.log("New Level");
        this.texts.level = this.add.text(60, 84, LEVEL[state.level].name, {font: "12px Upheavtt", fill: "#fff"});
        this.texts.level.anchor.setTo(0.5);
        this.texts.level.stroke = "#000";
        this.texts.level.strokeThickness = 2;
        this.texts.level.visible = true;

        this.time.events.add(Phaser.Timer.SECOND * 3, () =>{this.texts.level.visible = false;}, this);

        state.level++;
    }
  }
}
