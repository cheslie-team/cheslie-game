var config = require('cheslie-config'),
  server = require('http').createServer(),
  io = require('socket.io').listen(server),
  Game = require('./modules/game.js').Game,
  feed = require('./modules/feed.js').init(io);

io.on('connect', function (socket) {
  socket.on('join', function (gameId) {
    socket.join(gameId);
    var allPlayers = Object.keys(io.sockets.adapter.rooms[gameId].sockets);
    if (allPlayers.length === 2) {
      var game = new Game(gameId, allPlayers[1], allPlayers[0]);
      feed.gameStarted(gameId);
      socket.emit('move', game.asPublicGame());
    }
  })

  socket.on('move', function (publicGame) {
    var game = Game.fromPublic(publicGame);
    if (game.playerToMove() != socket.id) return;  
    game.move(publicGame.move);
    feed.move(game);
    if (game.game_over()) {
      feed.gameEnded(game);
    } else {
      socket.broadcast.to(game.id).emit('move', game.asPublicGame());
    }
  });
});

server.listen(config.game.port, function () {
  console.log('Running server on port: ' + config.game.port)
});