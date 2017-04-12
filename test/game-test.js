
var should = require('chai').should(),
  Chess = require('chess.js').Chess,
  Game = require('./../modules/game.js').Game;
var theGame;

describe('When a game is created,', function () {
  var game;
  beforeEach(() => game = new Game('1337', 'Doctor who', 'Clara Oswald'));

  it('should create a new initial chessboard', function () {
    game.board().should.equal(new Chess().fen());
  })

  describe('and the game is transformed to PublicGame,', function () {
    var game,
      encryptetGame;

    beforeEach(() => {
      game = new Game('1337', 'Doctor who', 'Clara Oswald');
      encryptedGame = game.asPublicGame();
    });

    it('should not be equal to original game', function () {
      game.should.not.equal(encryptedGame);
    })

    it('should contain a readable fen version of the board', () => {
      encryptedGame.board.should.equal(game.board());
    });

    it('should contain the id', () => {
      encryptedGame.id.should.equal(game.id);
    });

    describe('and back to Game again', () => {
      var originalGame,
        game;

      beforeEach(() => {
        originalGame = new Game('1337', 'Doctor who', 'Clara Oswald');
        game = Game.fromPublic(originalGame.asPublicGame());
      });
      
      it('should equal original game', () => {
        game.id.should.equal(originalGame.id);
        game.white.should.equal(originalGame.white);
        game.black.should.equal(originalGame.black);
        game.board().should.equal(originalGame.board());
      });
    });
  });
});