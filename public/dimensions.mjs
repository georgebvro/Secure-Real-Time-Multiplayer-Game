let canvas;
if (typeof document !== 'undefined') {
  canvas = document.getElementById('game-window');
} else {
  // Provide a default or handle the case where document is not available, such as during unit tests
  canvas = { width: 640, height: 480 };
}

const border = 5;
const header = 50;

const dimensions = {
  border: border,
  header: header,
  arenaWidth: canvas.width - 2 * border,
  arenaHeight: canvas.height - header - border,
  arenaMinX: border,
  arenaMinY: header + border,
  arenaMaxX: canvas.width - border,
  arenaMaxY: canvas.height - border,
  avatarSize: 30,
  itemSize: 15
}

try {
  module.exports = { dimensions };
} catch(e) {}

export { dimensions };
