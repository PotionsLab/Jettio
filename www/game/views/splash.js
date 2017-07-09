import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
  
    this.load.image('jettio-logotype', SERVER_URL + '/assets/images/jettio-logotype.png');
    this.load.image('sky_bg', SERVER_URL + '/assets/images/sky-bg.jpg');
    this.load.spritesheet('player', SERVER_URL + '/assets/images/jettio.png', 25, 32, 5);
    this.load.spritesheet('coin', SERVER_URL + '/assets/images/coin.png', 18, 18, 5);
    this.load.spritesheet('angry-cloud',SERVER_URL + '/assets/images/angry-cloud.png', 38, 31, 3);
    this.load.spritesheet('progress_bar', SERVER_URL + '/assets/images/progressbar.png', 60, 11, 12);
    this.load.image('ground', SERVER_URL + '/assets/images/ground.png');
    this.load.image('bush', SERVER_URL + '/assets/images/bush.png');
    this.load.image('jetpack', SERVER_URL + '/assets/images/jetpack.png');
    this.load.spritesheet('nitro-fire', SERVER_URL + '/assets/images/nitro-fire.png', 11, 7, 3);
    this.load.image('game-over-panel', SERVER_URL + '/assets/images/game-over-panel.png');
    this.load.image('play-button', SERVER_URL + '/assets/images/play-button.png');
    this.load.spritesheet('nitro-bottle', SERVER_URL + '/assets/images/nitro-bottle.png', 20, 20, 1);

    // this.load.image('mushroom', 'assets/images/mushroom2.png')
  }

  create () {
    setTimeout(() => {
      this.state.start("Game");
    }, 5000);
  }
}
