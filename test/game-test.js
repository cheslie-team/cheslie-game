
var should = require('chai').should(),
  Chess = require('chess.js').Chess,
  Game = require('./../modules/game.js').Game;
var theGame;

describe('When a game is created,', function () {
  var game;
  var playerNames = { 1: 'Doctor Who', 2: 'Clara Oswald' };

  beforeEach('The game is created', () => {
    game = new Game('1337', 1, 2, playerNames)});

  it('should create a new initial chessboard', function () {
    game.board().should.equal(new Chess().fen());
  })

  it('should be white players turn', () => {
    game.playerToMove().id.should.equal(game.white.id);
  });

  describe('and after white has moved', () => {
    beforeEach('White moves to e4', () => game.move('e4'));

    it('should be blacks turn', () => {
      game.playerToMove().id.should.equal(game.black.id);
    });
  });

  describe('and the game is transformed to json,', function () {
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

      beforeEach('Conerting public game back to Game', () => {
        returnedGame = Game.fromPublic(game.asPublicGame());
      });

      it('should equal original game', () => {
        returnedGame.id.should.equal(game.id);
        returnedGame.board().should.equal(game.board());
      });

      it('should equal original players', () => {
        returnedGame.white.id.should.equal(game.white.id);
        returnedGame.white.name.should.equal(game.white.name);
        returnedGame.white.color.should.equal(game.white.color);
        returnedGame.black.id.should.equal(game.black.id);
        returnedGame.black.name.should.equal(game.black.name);
        returnedGame.black.color.should.equal(game.black.color);
      });
    });
  });
});