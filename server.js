var io = require('socket.io')(3000),
  Chess = require('chess.js').Chess,
  feed = require('./modules/feed.js'),
  games = {}; //games[gameId] = players-one-socket-id

feed.init(io);

io.on('connect', function (socket) {
  socket.on('disconnect', function () {
    var gamesToRemove = []
    for (gameId in games) {
      if (games[gameId] = socket.id) {
        gamesToRemove.push(gameId);
      }
    }
    gamesToRemove.forEach(function (gameId) { delete games[gameId] })
  })

  socket.on('join', function (gameId) {
    if (games[gameId] == undefined) {
      games[gameId] = socket.id;
    } else {
      var chess = new Chess();
      feed.gameStarted(gameId);
      socket.emit('move', {
        id: gameId,
        board: chess.fen(),
        white: games[gameId],
        black: socket.id
      });
      delete games[gameId];
    }
  })

  socket.on('move', function (game) {
    var chess = new Chess();
    chess.load(game.board);
    chess.move(game.move);
    feed.move({
      gameId: game.id,
      board: chess.fen()
    });
    
    if (chess.game_over()) {
      feed.gameEnded(game.id, chess)
    } else {
      game.board = chess.fen();
      var nextPlayer = (chess.turn() === 'b') ? game.white : game.black;
      socket.broadcast.to(nextPlayer).emit('move', game);
    }
  });
});
