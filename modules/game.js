'use strict'
var crypto = require('crypto'),
    Chess = require('chess.js').Chess,
    algorithm = 'aes-256-ctr',
    password = process.env.SPADE_SHAPED_SILVER_KEY || 'spade_shaped_silver_key',

    encryptText = function (text) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decryptText = function (text) {
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    };

var Player = class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = 'w';
    }
}
Player.fromJson = function (json) {
    return new Player(json.id, json.name, json.color);
}

var Game = class Game {
    constructor(gameId, whitePlayerId, blackPlayerId, playerNames) {
        if (playerNames === undefined) return this;
        this.id = gameId;
        this.white = new Player(whitePlayerId, playerNames[whitePlayerId], 'w')
        this.black = new Player(blackPlayerId, playerNames[blackPlayerId], 'b');
        this.chess = new Chess();
    }

    board() {
        return this.chess.fen();
    }

    move(move) {
        this.chess.move(move);
    }

    game_over() {
        return this.chess.game_over()
    }

    encrypt() {
        var privateState = {
            white: this.white,
            black: this.black,
            board: this.board()
        };
        return encryptText(JSON.stringify(privateState))
    }

    asPublicGame() {
        return {
            id: this.id,
            board: this.board(),
            tardis: this.encrypt()
        }
    }

    playerToMove() {
        return (this.chess.turn() === 'w') ? this.white : this.black;
    }
}

Game.fromPublic = function (publicGame) {
    var privateState = JSON.parse(decryptText(publicGame.tardis));
    var game = new Game();
    game.black = Player.fromJson(privateState.black);
    game.white = Player.fromJson(privateState.white);
    game.chess = new Chess(privateState.board);
    game.id = publicGame.id;
    return game;
}

module.exports.Game = Game;
module.exports.Player = Player;