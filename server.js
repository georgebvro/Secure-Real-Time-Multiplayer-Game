require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const noCache = require('nocache')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//secure the app with Helmet.js
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
//app.use(helmet.noCache());
app.use(noCache()); //used separate nocache module instead of helmet because of deprecation warning in helmet
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

//Socket.IO
const { dimensions } = require('./public/dimensions');
const { default: Collectible } = require('./public/Collectible.mjs');
const { default: Player } = require('./public/Player.mjs');

let collectible = generateCollectible();
let players = [];

const io = socket(server);
io.on('connection', socket => {
  const player = new Player({ x: randomCoordinates().x, y: randomCoordinates().y, score: 0, id: socket.id });
  players.push(player);
  socket.emit('game state', { players: players, collectible: collectible, player: player });
  socket.broadcast.emit('game state', { players: players, collectible: collectible, player: null });

  socket.on('update player', updatedPlayer => {
    players.forEach(player => {
      if (player.id === updatedPlayer.id) {
        player.x = updatedPlayer.x;
        player.y = updatedPlayer.y;
        const uP = new Player(updatedPlayer);
        if (uP.collision(collectible)) {
          player.score += collectible.value;
          collectible = generateCollectible();
        }
      }
    });
    io.emit('game state', { players: players, collectible: collectible, player: null });
  });

  socket.on('disconnect', () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit('player disconnected', players);
  });
});

function generateCollectible() {
  const randomNumber = Math.random();
  if (randomNumber < 0.1) return new Collectible({ x: randomCoordinates().x, y: randomCoordinates().y, value: 60, id: 'gold' });
  if (randomNumber < 0.3) return new Collectible({ x: randomCoordinates().x, y: randomCoordinates().y, value: 30, id: 'silver' });
  return new Collectible({ x: randomCoordinates().x, y: randomCoordinates().y, value: 10, id: 'bronze' });
}

function randomCoordinates() {
  return {
    x: Math.floor((Math.random() * ((dimensions.arenaMaxX - 50) - (dimensions.arenaMinX + 50)) + dimensions.arenaMinX + 50) / 10) * 10,
    y: Math.floor((Math.random() * ((dimensions.arenaMaxY - 50) - (dimensions.arenaMinY + 50)) + dimensions.arenaMinY + 50) / 10) * 10
  };
}

module.exports = app; // For testing
