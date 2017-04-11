var config = require('cheslie-config'),
  server = require('http').createServer(),
  io = require('socket.io').listen(server),
  Chess = require('chess.js').Chess,
  Game = require('./modules/game.js').Game,
  feed = require('./modules/feed.js').init(io);

io.on('connect', function (socket) {
  socket.on('join', function (gameId) {
    socket.join(gameId);
    var allPlayers = io.sockets.adapter.rooms[gameId];
    if (allPlayers.length === 2) {
      var chess = new Chess();
      feed.gameStarted(gameId);
      socket.emit('move', {
        id: gameId,
        board: chess.fen(),
        tardisKey: encrypt(socket.id)
      });
    }
  })

  socket.on('move', function (game) {
    var chess = new Chess(game.board);
    chess.move(game.move);
    feed.move({
      gameId: game.id,
      board: chess.fen()
    });
    if (chess.game_over()) {
      feed.gameEnded(game.id, chess)
    } else {
      game.board = chess.fen();
      game.tardisKey = encrypt(socket.id)
      socket.broadcast.to(game.id).emit('move', game);
    }
  });
});

server.listen(config.game.port, function () {
  console.log('Running server on port: ' + config.game.port)
});