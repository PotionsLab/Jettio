export const preloader = (game) => {
    game.load.image('jettio-logotype', SERVER_URL + '/assets/images/jettio-logotype.png');
    game.load.image('sky_bg', SERVER_URL + '/assets/images/sky-bg.jpg');
    game.load.spritesheet('player', SERVER_URL + '/assets/images/jettio.png', 25, 32, 5);
    game.load.spritesheet('coin', SERVER_URL + '/assets/images/coin.png', 18, 18, 5);
    game.load.spritesheet('angry-cloud',SERVER_URL + '/assets/images/angry-cloud.png', 38, 31, 3);
    game.load.spritesheet('progress_bar', SERVER_URL + '/assets/images/progressbar.png', 60, 11, 12);
    game.load.image('ground', SERVER_URL + '/assets/images/ground.png');
    game.load.image('bush', SERVER_URL + '/assets/images/bush.png');
    game.load.image('jetpack', SERVER_URL + '/assets/images/jetpack.png');
    game.load.spritesheet('nitro-fire', SERVER_URL + '/assets/images/nitro-fire.png', 11, 7, 3);
    game.load.image('game-over-panel', SERVER_URL + '/assets/images/game-over-panel.png');
    game.load.image('play-button', SERVER_URL + '/assets/images/play-button.png');
    game.load.spritesheet('nitro-bottle', SERVER_URL + '/assets/images/nitro-bottle.png', 20, 20, 1);
}