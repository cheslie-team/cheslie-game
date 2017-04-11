'use strict'
var crypto = require('crypto'),
    Chess = require('chess.js').Chess,
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq',

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
    },
    decrypt = function (encryptedGame) {
        return JSON.parse(decryptText(encryptedGame.tardisKey))
    };


var Game = class Game {
    constructor(gameId, whitePlayer, blackPlayer) {
        this.id = gameId;
        this.white = whitePlayer;
        this.black = blackPlayer;
        this.chess = new Chess();
    }

    board() {
        return this.chess.fen();
    }

    encrypt() {
        var json = {
            id: this.id,
            board: this.board(),
            tardisKey: encryptText(JSON.stringify({ id: this.id, black: this.black, white: this.white, board: this.chess.fen() }))
        };
        return json;
    }

}

Game.decrypt = function (encryptedGame) {
    var decryptetJson = JSON.parse(decryptText(encryptedGame.tardisKey));
    var game = new Game(decryptetJson.id, decryptetJson.white, decryptetJson.black)
    game.chess = new Chess(decryptetJson.board);
    return game
}

module.exports.Game = Game;