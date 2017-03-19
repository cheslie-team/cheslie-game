var io = require('socket.io')(3000),
  Chess = require('chess.js').Chess,
  games = {}; //games[gameId] = players-one-socket-id

var print_result = function (chess) {

  if (chess.in_checkmate()) {
    console.log('in_checkmate')
  }

  if (chess.insufficient_material()) {
    console.log('insufficient_material')
  }

  if (chess.in_stalemate()) {
    console.log('in_stalemate')
  }

  if (chess.in_threefold_repetition()) {
    console.log('in_threefold_repetition')
  }

  if (chess.in_draw()) {
    console.log('Its a draw');
  } else {
    console.log((chess.turn() ? 'White' : 'Black') + ' won the game');
  }
};

io.on('connect', function (socket) {

  socket.on('subscribe', function () {
    socket.join('subscribers');
  })

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
      console.log('Player one joined game ' + gameId + '!');
      games[gameId] = socket.id;
    } else {
      var chess = new Chess();
      console.log(gameId + ' started!');
      socket.to('subscribers').emit('move', {
        gameId: gameId,
        board: chess.fen()
      });
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
    console.log('Move from ' + (chess.turn() ? 'white' : 'black') + ' player: ' + game.move);
    chess.move(game.move);
    socket.to('subscribers').emit('move', {
      gameId: game.id,
      board: chess.fen()
    });
    if (chess.game_over()) {
      print_result(chess);
    } else {
      game.board = chess.fen();
      var nextPlayer = (chess.turn() === 'b') ? game.white : game.black;
      socket.broadcast.to(nextPlayer).emit('move', game);
    }
  });
});
