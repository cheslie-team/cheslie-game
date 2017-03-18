var io = require('socket.io')(3000);


io.on('connect', function (socket) {
    console.log('We got ourselves a player!');
});




