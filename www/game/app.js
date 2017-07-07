import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootView from './views/Boot'
import SplashView from './views/Splash'
import GameView from './views/Game'

import config from './config'

class App extends Phaser.Game {
  constructor () {
    const width = 120;
    const height = 190;

    super(width, height, Phaser.CANVAS, 'game', null)

    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Boot')
  }
}

window.game = new App()
