import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#EDEEC9'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)

    this.stage.smoothed = false; // disable anti aliasing

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.minWidth = 120;
    this.scale.minHeight = 190;
    this.scale.pageAlignHorizontally = true;
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Bangers']
      },
      active: this.fontsLoaded
    })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)

    this.load.image('loaderBg', SERVER_URL + '/assets/images/loader-bg.png');
    this.load.image('loaderBar', SERVER_URL + '/assets/images/loader-bar.png');
  }

  render () {
    if (this.fontsReady) {
      this.state.start('Splash')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
