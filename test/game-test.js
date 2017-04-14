
var should = require('chai').should(),
  Chess = require('chess.js').Chess,
  Game = require('./../modules/game.js').Game;
var theGame;

describe('When a game is created,', function () {
  var game;
  beforeEach('The game is created', () => game = new Game('1337', 'Doctor who', 'Clara Oswald'));

  it('should create a new initial chessboard', function () {
    game.board().should.equal(new Chess().fen());
  })

  it('should be white players turn', () => {
    game.playerToMove().should.equal(game.white);
  });

  describe('and after white has moved', () => {
    beforeEach('White moves to e4', () => game.move('e4'));

    it('should be blacks turn', () => {
      game.playerToMove().should.equal(game.black);
    });
  });

  describe('and the game is transformed to PublicGame,', function () {
    var publicGame;

    beforeEach('A public game is created to send to the player', () => {
      publicGame = game.asPublicGame();
    });

    it('should not be equal to original game', function () {
      game.should.not.equal(publicGame);
    })

    it('should contain a readable fen version of the board', () => {
      publicGame.board.should.equal(game.board());
    });

    it('should contain the id', () => {
      publicGame.id.should.equal(game.id);
    });

    describe('and back to Game again', () => {
      var returnedGame;

      beforeEach('Conerting public game back to internal game', () => {
        returnedGame = Game.fromPublic(game.asPublicGame());
      });

      it('should equal original game', () => {
        returnedGame.id.should.equal(game.id);
        returnedGame.white.should.equal(game.white);
        returnedGame.black.should.equal(game.black);
        returnedGame.board().should.equal(game.board());
      });
    });
  });
});