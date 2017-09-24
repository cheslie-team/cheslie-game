const PAWN = 'p',
    KNIGHT = 'n',
    BISHOP = 'b',
    ROOK = 'r',
    QUEEN = 'q',
    KING = 'k',
    BLACK = 'b',
    WHITE = 'w',
    PIECEVALUES = {
        [PAWN]: 1,
        [KNIGHT]: 3,
        [BISHOP]: 3,
        [ROOK]: 5,
        [QUEEN]: 9,
        [KING]: 0
    };

var crypto = require('crypto'),
    Chess = require('chess.js').Chess,
    algorithm = 'aes-256-ctr',
    password = process.env.SPADE_SHAPED_SILVER_KEY || 'spade_shaped_silver_key',

    encryptJson = function (json) {
        var text = JSON.stringify(json);
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },

    decryptJson = function (text) {
        var decipher = crypto.createDecipher(algorithm, password)
        try {
            var dec = decipher.update(text, 'hex', 'utf8')
            dec += decipher.final('utf8');
            return JSON.parse(dec);
        } catch (ex) {
            return undefined;
        }
    };

var Player = class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = 'w';
    }
};
Player.fromJson = function (json) {
    return new Player(json.id, json.name, json.color);
};

var Game = class Game {
    constructor(gameId, whitePlayerId, blackPlayerId, playerNames) {
        if (playerNames === undefined) return this;
        this.id = gameId;
        this.isLegal = true;
        this.white = new Player(whitePlayerId, playerNames[whitePlayerId], 'w');
        this.black = new Player(blackPlayerId, playerNames[blackPlayerId], 'b');
        this.chess = new Chess();
    }
    toManyMoves() {
        return this.chess.history().length >= 100;
    }

    board() {
        return this.chess.fen();
    }

    isLegalMove(move){
        return this.chess.moves().some(legalMove => legalMove === move);
    }

    move(move) {
        this.chess.move(move);
    }

    game_over() {
        return this.chess.game_over() || this.toManyMoves()
    }

    encrypt() {
        var privateState = {
            white: this.white,
            black: this.black,
            pgn: this.chess.pgn(),
            board: this.board()
        };
        return encryptJson(privateState)
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

    pieces(color) {
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
            squares = [],
            chess = this.chess;

        for (var i = 1; i <= 8; i++) {
            letters.forEach(function (letter) {
                squares.push(letter + i);
            });
        };

        return squares.map(function (square) {
            return chess.get(square);
        }).filter(function (val) {
            if (color && val) {
                return val.color === color;
            }
            return val;
        });
    }
    valueBlackPieces() {
        return this.pieces(BLACK)
            .map(p => { return PIECEVALUES[p.type] })
            .reduce((v1, v2) => { return v1 + v2 }, 0);
    }
    valueWhitePieces() {
        return this.pieces(WHITE)
            .map(p => { return PIECEVALUES[p.type] })
            .reduce((v1, v2) => { return v1 + v2 }, 0);
    }
};

Game.fromPublic = function (publicGame) {
    var game = new Game();
    game.chess = new Chess();
    game.id = publicGame.id;
    var privateState = decryptJson(publicGame.tardis);
    game.isLegal = (!privateState) ? false : true;
    if (!game.isLegal) return game;
    game.black = Player.fromJson(privateState.black);
    game.white = Player.fromJson(privateState.white);
    game.chess.load_pgn(privateState.pgn);
    return game;
}

module.exports.Game = Game;
module.exports.Player = Player;