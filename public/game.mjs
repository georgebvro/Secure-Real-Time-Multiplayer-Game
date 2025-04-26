import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimensions } from './dimensions.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const speed = 1;
let playersArray = [];
let collectibleItem, mainPlayer;
const keysPressed = {};

const mainAvatar = new Image();
const otherAvatar = new Image();
const bronzeCoin = new Image();
const silverCoin = new Image();
const goldCoin = new Image();
let itemImage;

mainAvatar.src = 'public/images/main-player.png';
otherAvatar.src = 'public/images/other-player.png';
bronzeCoin.src = 'public/images/bronze-coin.png';
silverCoin.src = 'public/images/silver-coin.png';
goldCoin.src = 'public/images/gold-coin.png';

document.addEventListener('keydown', e => {
  switch(e.code) {
    case 'KeyW':
    case 'ArrowUp': keysPressed['up'] = true; break;
    case 'KeyS':
    case 'ArrowDown': keysPressed['down'] = true; break;
    case 'KeyA':
    case 'ArrowLeft': keysPressed['left'] = true; break;
    case 'KeyD':
    case 'ArrowRight': keysPressed['right'] = true;
  }
});
document.addEventListener('keyup', e => {
  switch(e.code) {
    case 'KeyW':
    case 'ArrowUp': delete keysPressed['up']; break;
    case 'KeyS':
    case 'ArrowDown': delete keysPressed['down']; break;
    case 'KeyA':
    case 'ArrowLeft': delete keysPressed['left']; break;
    case 'KeyD':
    case 'ArrowRight': delete keysPressed['right'];
  }
});

socket.on('game state', ({ players, collectible, player }) => {
  playersArray = players;
  
  collectibleItem = new Collectible(collectible);
  if (collectible.id === 'bronze') itemImage = bronzeCoin;
  if (collectible.id === 'silver') itemImage = silverCoin;
  if (collectible.id === 'gold') itemImage = goldCoin;
  
  if (player) mainPlayer = new Player(player);
  mainPlayer.score = players.find(p => p.id === mainPlayer.id).score;
});

socket.on('player disconnected', players => {
  playersArray = players;
});

window.requestAnimationFrame(gameLoop);

function gameLoop() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'white';
  context.strokeRect(dimensions.border, dimensions.header, dimensions.arenaWidth, dimensions.arenaHeight);
  context.font = `13px 'Press Start 2P'`;
  context.fillStyle = 'lime';
  context.fillText('COIN RACE', 250, 30);
  //for the first frames the collectibleItem is not created yet by the connection mechanism
  if (collectibleItem) collectibleItem.draw(context, itemImage);
  playersArray.forEach(player => {
    if (player.id === mainPlayer.id) {
      mainPlayer.draw(context, mainAvatar);
      context.fillText('Score:' + mainPlayer.score, 10, 30);
      context.fillText(mainPlayer.calculateRank(playersArray), 500, 30);
    } else {
      const otherPlayer = new Player(player);
      otherPlayer.draw(context, otherAvatar);
    }
  });  

  if (Object.keys(keysPressed).length) {
    for (const key in keysPressed) mainPlayer.movePlayer(key, speed);
    socket.emit('update player', mainPlayer);
  };

  requestAnimationFrame(gameLoop);
}
