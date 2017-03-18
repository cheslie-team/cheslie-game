var io = require('socket.io')(3000);
var Chess = require('chess.js').Chess;
var player = null;

io.on('connect', function(socket) {

  socket.on('move', function(game) {
    console.log('The move: ' + game.move);

    var chess = new Chess();
    chess.load(game.board);
    chess.move(game.move);
    console.log(chess.ascii());

    if (chess.game_over()) {
        console.log('Game over! The winning socket is. ' + socket.id )
        console.log(chess.pgn());
        
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

        if (chess.in_draw()){
            console.log('Its a draw');
        }
    }
    else{  
        game.board = chess.fen();
        var currentPlayer = (chess.turn() === 'w') ? game.white: game.black;
        socket.broadcast.to(currentPlayer).emit('move', game);
    }
  });

  if (player != null) {
    var chess = new Chess();
    var game = {
      board : chess.fen(),
      white : player,
      black : socket.id
    };
    player = null;
    io.emit('move', game);    
  } else {
    console.log('We got ourselves a player!');
    player=socket.id}
});
