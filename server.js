var config = require('./cheslie-config/config');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
 
var  Chess = require('chess.js').Chess;
var feed = require('./modules/feed.js');

feed.init(io);
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
      socket.broadcast.to(game.id).emit('move', game);
    }
  });
});


server.listen(config.port, function () {
    console.log('Running our app on port: ' + config.port)
});