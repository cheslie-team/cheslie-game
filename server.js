var io = require('socket.io')(3000);
var board = require('socket.io-client')('http://localhost:8080');
var Chess = require('chess.js').Chess;
var games = {};

var displayBoard = function (chess) {
  console.log(chess.ascii());
  if (board) {
    board.emit('move', chess.fen());
  }
};

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

board.on('connect', function () {
  console.log('Connected to board');
});

io.on('connect', function (player) {

  player.on('disconnect', function () {
    var gamesToRemove = []
    for (gameId in games) {
      if (games[gameId] = player.id) {
        gamesToRemove.push(gameId);
      }
    }
    gamesToRemove.forEach(function (gameId) { delete games[gameId] })
    console.log('Player is disconected');
  })

  player.on('join', function (gameId) {
    if (games[gameId] == undefined) {
      console.log('Player one joined game ' + gameId + '!');
      games[gameId] = player.id;
    } else {
      var chess = new Chess();
      console.log(gameId + ' started!');
      displayBoard(chess);
      player.emit('move', {
        board: chess.fen(),
        white: games[gameId],
        black: player.id
      });
      delete games[gameId];
    }
  })

  player.on('move', function (game) {
    var chess = new Chess();
    chess.load(game.board);
    console.log('Move from ' + (chess.turn() ? 'white' : 'black') + ' player: ' + game.move);
    chess.move(game.move);
    displayBoard(chess);

    if (chess.game_over()) {
      print_result(chess);
    } else {
      game.board = chess.fen();
      var nextPlayer = (chess.turn() === 'b') ? game.white : game.black;
      player.broadcast.to(nextPlayer).emit('move', game);
    }
  });
});
