var io = null,

    broadcast = function (event, data) {
        io.to('subscribers').emit(event, data);
    },

    reason = function (chess) {

        if (chess.in_checkmate()) {
            return 'in_checkmate';
        }

        if (chess.insufficient_material()) {
            return 'insufficient_material';
        }

        if (chess.in_stalemate()) {
            return 'in_stalemate';
        }

        if (chess.in_threefold_repetition()) {
            return 'in_threefold_repetition';
        }
        if (chess.in_draw()) {
            // Over 100 moves each, se chess.js
            return 'to_many_moves';
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

exports.move = function (move) {
    broadcast('move', move);
}

exports.gameStarted = function (gameId) {
    console.log(gameId + ' started!');
    broadcast('started', gameId);
}

exports.gameEnded = function (gameid, chess) {
    console.log(gameid + ' ended in ' + reason(chess) + ' with result ' + result(chess));
    broadcast('ended', {
        id: gameid,
        result: result(chess),
        reason: reason(chess)
    });
}
