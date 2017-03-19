var io = null;

exports.init = function (socketio) {
    io = socketio;
    io.on('connect', function (socket) {
        socket.on('subscribe', function () {
            socket.join('subscribers');
        })
    });
};

exports.broadcast = function (event, data) {
    io.to('subscribers').emit(event, data);
};
