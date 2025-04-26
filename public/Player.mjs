import { dimensions } from './dimensions.mjs';
export class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up': this.y = Math.max(dimensions.arenaMinY, this.y - speed); break;
      case 'down': this.y = Math.min(dimensions.arenaMaxY - dimensions.avatarSize, this.y + speed); break;
      case 'left': this.x = Math.max(dimensions.arenaMinX, this.x - speed) ; break;
      case 'right': this.x = Math.min(dimensions.arenaMaxX - dimensions.avatarSize, this.x + speed);
    }
  }

  collision(item) {
    const playerTopLeftX = this.x,
          playerTopLeftY = this.y,
          playerBottomRightX = this.x + dimensions.avatarSize,
          playerBottomRightY = this.y + dimensions.avatarSize,
          itemMiddleX = item.x + dimensions.itemSize / 2,
          itemMiddleY = item.y + dimensions.itemSize / 2;
    if (itemMiddleX > playerTopLeftX && 
        itemMiddleX < playerBottomRightX && 
        itemMiddleY > playerTopLeftY && 
        itemMiddleY < playerBottomRightY) {
      return true;
    }
  }

  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score);
    const index = arr.findIndex(player => player.id === this.id);
    return `Rank: ${index + 1}/${arr.length}`;
  }

  draw (context, avatar) {
    context.drawImage(avatar, this.x, this.y);
  }
}

/*try {
  module.exports = Player;
} catch(e) {
  console.log('Error while trying to export Player class:\n', e);
}*/

export default Player;