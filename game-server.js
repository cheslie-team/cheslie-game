const TIMEOUT = 20000;
var config = require('cheslie-config'),
  server = require('http').createServer(),
  hash = require('hash.js'),
  io = require('socket.io').listen(server, { pingInterval: 5000, pingTimeout: 10000 }),
  _ = require('underscore'),
  Game = require('./modules/game.js').Game,
  feed = require('./modules/feed.js').init(io),
  schedule = require('node-schedule'),
  playerNames = {},
  isPlayerWhite = function (whiteName, gameId) {
    var key = whiteName;
    var hashedKey = hash.sha256().update(key).digest('hex');
    return gameId.startsWith(hashedKey);
  },
  endGame = (gameId) => {
    var sockets = io.sockets.adapter.rooms[gameId].sockets;
    if (!sockets) return;
    Object.keys(sockets).forEach(function (id) {
      io.sockets.connected[id].leave(gameId);
    });
  },
  endGameByTimeOut = (gameId, result) => {
    feed.gameEndedWithReason(gameId, result, "Time out");
    endGame(gameId);
  },
  checkForTimeOuts = () => {
    var timeOutLimit = Date.now() - TIMEOUT,
      rooms = io.sockets.adapter.rooms;
    rooms = Object.keys(rooms).map(roomKey => {
      var room = rooms[roomKey];
      room.key = roomKey;
      room.players = Object.keys(room.sockets).map(socketId => { return io.sockets.connected[socketId] })
      return room;
    });
    rooms
      .filter(room => { return room.length === 2; })
      .filter(room => { return room.players.every(socket => { return socket.lastMove !== undefined; }); })
      .filter(room => { return room.players.every(socket => { return socket.lastMove < timeOutLimit; }); })
      .forEach(room => {
        var looser = _.min(room.players, player => { return player.lastMove }),
          result = (room.whiteId === looser.id) ? '0-1' : '1-0';
        endGameByTimeOut(room.key, result);
      });
    rooms
      .filter(room => { return room.length === 1; })
      .filter(room => { return room.firstPlayerJoined !== undefined })
      .filter(room => { return room.firstPlayerJoined < timeOutLimit })
      .forEach(room => {
        var isWhiteWinner = isPlayerWhite(playerNames[room.players[0].id], room.key),
          result = (isWhiteWinner) ? '1-0' : '0-1';
        endGameByTimeOut(room.key, result);
      })
  },
  job = schedule.scheduleJob('*/5 * * * * *', () => {
    checkForTimeOuts();
  });


io.on('connect', function (socket) {
  socket.__proto__.onclose = function (reason) {
    this.emit('disconnecting', reason);
    this.leaveAll();
    this.emit('disconnect', reason);
  };

  socket.on('join', function (gameId, playerName) {
    playerNames[socket.id] = playerName;
    socket.join(gameId);
    var gameRoom = io.sockets.adapter.rooms[gameId];
    var allPlayers = Object.keys(gameRoom.sockets);
    if (allPlayers.length === 2) {
      var game;
      if (isPlayerWhite(playerNames[allPlayers[1]], gameId)) {
        game = new Game(gameId, allPlayers[1], allPlayers[0], playerNames);
      } else {
        game = new Game(gameId, allPlayers[0], allPlayers[1], playerNames);
      }
      gameRoom.whiteId = game.white.id;
      gameRoom.blackId = game.black.id;
      io.sockets.connected[game.black.id].lastMove = Date.now() + TIMEOUT;
      io.sockets.connected[game.white.id].lastMove = Date.now();
      game.start();
      feed.gameStarted(game);
      io.to(game.white.id).emit('move', game.asPublicGame());
    }
    if (allPlayers.length === 1) {
      gameRoom.firstPlayerJoined = Date.now();
    }
  })

  socket.on('move', function (publicGame) {
    var game = Game.fromPublic(publicGame);
    if (!game.isLegal || game.playerToMove().id !== socket.id) return;
    if (!game.isLegalMove(publicGame.move)) return;
    socket.lastMove = Date.now();
    game.move(publicGame.move);
    feed.move(game);
    if (game.game_over()) {
      feed.gameEnded(game);
      endGame(game.id);
    } else {
      socket.broadcast.to(game.id).emit('move', game.asPublicGame());
    }
  });

  socket.on('disconnecting', function () {
    let rooms = Object.keys(socket.rooms).filter(room => { return room !== socket.id });
    rooms.map(gameId => {
      var isWhite = isPlayerWhite(playerNames[socket.id], gameId),
      result = (isWhite) ? '0-1' : '1-0';
      endGameByTimeOut(gameId, result);
    })
  });

  socket.on('disconnect', function () {
    delete playerNames[socket.id];
  });
});

server.listen(config.game.port, function () {
  console.log('Running server on port: ' + config.game.port)
});



