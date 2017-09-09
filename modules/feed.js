var io = null,

    broadcast = function (event, data) {
        io.to('subscribers').emit(event, data);
    },

    reason = function (chess) {

        if (chess.in_checkmate()) {
            return 'Checkmate';
        }

        if (chess.insufficient_material()) {
            return 'Insufficient material';
        }

        if (chess.in_stalemate()) {
            return 'Stalemate';
        }

        if (chess.in_threefold_repetition()) {
            return 'Threefold repetition';
        }
        if (chess.in_draw()) {
            // Over 100 moves each, se chess.js
            return 'To many moves';
        }

        return '';
    },

    result = function (chess) {
        if (chess.in_draw()) {
            return '1/2-1/2';
        } else {
            return chess.turn() === 'w' ? '0-1' : '1-0';
        }
    };

exports.init = function (socketio) {
    io = socketio;
    io.on('connect', function (socket) {
        socket.on('subscribe', function () {
            socket.join('subscribers');
        })
    });
    return exports;
};

exports.move = function (game) {
    broadcast('move', {
        gameId: game.id,
        white: game.white.name,
        black: game.black.name,
        valueBlackPieces: game.valueBlackPieces(),
        valueWhitePieces: game.valueWhitePieces(),
        board: game.board()
    });
}

exports.gameStarted = function (game) {
    console.log(game.id + ' started!');
    broadcast('started', {
        id: game.id,
        valueBlackPieces: game.valueBlackPieces(),
        valueWhitePieces: game.valueWhitePieces(),
        white: game.white.name,
        black: game.black.name
    });
}

exports.gameEnded = function (game) {
    var chess = game.chess;
    console.log(game.id + ' ended in ' + reason(chess) + ' with result ' + result(chess));
    broadcast('ended', {
        id: game.id,
        result: result(chess),
        reason: reason(chess),
        valueBlackPieces: game.valueBlackPieces(),
        valueWhitePieces: game.valueWhitePieces()
    });
}
