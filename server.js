var io = require('socket.io')(3000);
var Chess = require('chess.js').Chess;
var games = {};

io.on('connect', function (player) {

  player.on('join', function (gameId) {
    if (games[gameId] == undefined) {
      console.log('Player one joined game ' + gameId + '!');
      games[gameId] = player.id;
    } else {
      var chess = new Chess();
      console.log(gameId + ' started!');
      console.log(chess.ascii());
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
    console.log(chess.ascii());

    if (chess.game_over()) {
      print_result(chess);
    } else {
      game.board = chess.fen();
      var nextPlayer = (chess.turn() === 'b') ? game.white : game.black;
      player.broadcast.to(nextPlayer).emit('move', game);
    }
  });
});

function print_result(chess) {

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
    console.log((chess.turn() ? 'White': 'Black') + ' won the game');
  }
}
