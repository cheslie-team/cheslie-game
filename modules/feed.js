var io = null,

    broadcast = function (event, data) {
        io.to('subscribers').emit(event, data);
    },

    reason = function (game) {
        var chess = game.chess
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
        if (chess.in_draw() || game.toManyMoves()) {
            // Over 100 moves each, se chess.js
            return 'To many moves';
        }

        return 'We dont know :(';
    },

    result = function (game) {
        if (game.toManyMoves())
            return '1/2-1/2';
        if (game.chess.in_draw()) {
            return '1/2-1/2';
        } else {
            return game.chess.turn() === 'w' ? '0-1' : '1-0';
        }
    },

    mapGameToClientGame = (game) => {
        return {
            id: game.id,
            gameId: game.id,
            valueBlackPieces: game.valueBlackPieces(),
            valueWhitePieces: game.valueWhitePieces(),
            white: game.white.name,
            black: game.black.name,
            board: game.board(),
            turn: 'w',
            started: game.started
        };
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
    // console.log(game.white.name + ' - ' + game.black.name+ ' moved! in game ' + game.id);    
    broadcast('move', mapGameToClientGame(game));
}

exports.gameStarted = function (game) {
    console.log(game.id + ' started!');
    broadcast('started', mapGameToClientGame(game));
}

exports.gameEnded = function (game) {
    console.log(game.id + ' ended in ' + reason(game) + ' with result ' + result(game));
    var clientGame = mapGameToClientGame(game);
    clientGame.result = result(game);
    clientGame.reason = reason(game);
    broadcast('ended', clientGame);
}

exports.gameEndedWithReason = function (gameId, result, reason) {
    console.log(gameId + ' with result ' + result);
    broadcast('ended', {
        id: gameId,
        result: result,
        reason: reason,
        valueBlackPieces: 0,
        valueWhitePieces: 0,
    });
}
