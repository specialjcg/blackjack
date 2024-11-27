import { describe, expect, it } from 'vitest';
import { bet, BetRange, BlackJack, Card, deal, gameEnd, isGameFinished, join, Shuffler } from './black-jack';
import {
  OnlyDoubleWhenNoSplit,
  OnlySplitEqualCardsError,
  OnlySplitFirstTurnError,
  playerDoubleDecision,
  hitDecision,
  splitDecision,
  standDecision,
  surrenderDecision
} from './decisions';

let seed = 1;

const LOW_SHUFFLER: Shuffler = () => [
  ...(['2', '3', '4', '5', '6', '5', '5', '6', '4', '1', '7', '1', '7'] as Card[]),
  ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const HIGH_SHUFFLER: Shuffler = () => [
  ...(['j', 'k', 'q', '4', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
  ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const SPLIT_SHUFFLER: Shuffler = () => [
  ...(['3', '3', '5', '4', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
  ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const randomShuffler: Shuffler = (cards: Card[]) => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]] as [Card, Card];
  }
  return cards;
};

const readyGameWithTwoPlayers = (shuffler?: Shuffler) => {
  const game = BlackJack(shuffler ? shuffler : randomShuffler)({
    playingPositionCount: 5,
    decksCount: 1,
    bet: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
  const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

  const gameWith1Bet = bet(gameWithTwoPlayers)({ position: 0, amount: 50 });
  const gameWith2Bets = bet(gameWith1Bet)({ position: 1, amount: 100 });

  return deal(gameWith2Bets);
};

const readyGameWithFourPlayers = () => {
  const game = BlackJack(randomShuffler)({
    playingPositionCount: 5,
    decksCount: 1,
    bet: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
  const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);
  const gameWithThreePlayers = join(gameWithTwoPlayers)({ availableMoney: 600 }, 2);
  const gameWithFourPlayers = join(gameWithThreePlayers)({ availableMoney: 600 }, 3);

  const gameWith1Bet = bet(gameWithFourPlayers)({ position: 0, amount: 50 });
  const gameWith2Bets = bet(gameWith1Bet)({ position: 1, amount: 100 });
  const gameWith3Bets = bet(gameWith2Bets)({ position: 2, amount: 100 });
  const gameWith4Bets = bet(gameWith3Bets)({ position: 3, amount: 50 });

  return deal(gameWith4Bets);
};

describe('blackJack game', () => {
  it('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 2,
      bet: BetRange({ min: 5, max: 100 })
    });
    expect(game.playingPositions.length).toBe(0);
    expect(game.cards.length).toBe(104);
    expect(game.betRange.min).toBe(5);
    expect(game.betRange.max).toBe(100);
  });

  it('should create a game with 1 shuffeled deck', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });
    const expectedDesk: Card[] = [
      ...(['j', 'k', 'q', '5', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    expect(game.cards).toStrictEqual(expectedDesk);
  });

  it('should join two players', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(gameWithTwoPlayers.playingPositions).toStrictEqual([
      { availableMoney: 500, id: 0, hands: [{ bettingBox: 0, cards: [], isDone: false }] },
      { availableMoney: 600, id: 1, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should have 1 betting player', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    const gameWith1Bet = bet(gameWithTwoPlayers)({ position: 0, amount: 50 });

    expect(gameWith1Bet.playingPositions).toStrictEqual([
      { availableMoney: 450, id: 0, hands: [{ bettingBox: 50, cards: [], isDone: false }] },
      { availableMoney: 600, id: 1, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should deal cards for every playing position and for the dealer', () => {
    const readyGame = readyGameWithTwoPlayers();

    expect(readyGame).toStrictEqual({
      dealerHand: { cards: ['10'], isDone: false },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: [
        ...['9', 'q', '9', 'j', '2', '4', 'q', '6', '4', 'k', 'k', '7', '3'],
        ...['9', '4', '8', 'k', '10', '5', '3', '3', '2', 'ace', '2', '7', '7'],
        ...['2', '8', 'q', '6', 'ace', 'k', '5', 'ace', '9', 'ace', '3', 'j', '5'],
        ...['8', 'q', '4', '10', '7', '8', '6', '10']
      ],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['j', 'j'], isDone: false }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['6', '5'], isDone: false }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    });
  });

  it('should not bet amount less than minimal game bet amount', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(() => {
      bet(gameWithTwoPlayers)({ position: 0, amount: 1 });
    }).toThrowError('Player should bet more than 5, 1 received');
  });

  it('should not bet amount more than maximal game bet amount', () => {
    const game = BlackJack(randomShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(() => {
      bet(gameWithTwoPlayers)({ position: 0, amount: 101 });
    }).toThrowError('Player should bet less than 100, 101 received');
  });

  it('should stand for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = standDecision(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
  });

  it('should surrender for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = surrenderDecision(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(0);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(475);
  });

  it('should double for first player', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const fisrtPlayerPlayed = playerDoubleDecision(readyGame)();

    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].bettingBox).toBe(100);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.availableMoney).toBe(400);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(fisrtPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['5', '6', '4']);

    const secondPlayerPlayed = playerDoubleDecision(fisrtPlayerPlayed)();
    expect(secondPlayerPlayed.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['4', '5', '5']);
    expect(secondPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['6', '4', '1']);
  });

  it('should hit for first player', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const played = hitDecision(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(450);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(played.currentPlayingHand).toStrictEqual({ playingPositionId: 1, handIndex: 0 });
  });

  it('should not hit a second time while every player has not played', () => {
    const readyGame = readyGameWithTwoPlayers();

    const playerOnePlayed = hitDecision(readyGame)();
    const playerTwoPlayed = hitDecision(playerOnePlayed)();

    expect(playerTwoPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 0, handIndex: 0 });
  });

  it('should ignore player surrander player with two players', () => {
    const readyGame = readyGameWithTwoPlayers();
    const playerOneSurrender = surrenderDecision(readyGame)();
    const playerTwoPlayed = hitDecision(playerOneSurrender)();

    expect(playerTwoPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 1, handIndex: 0 });
  });

  it('should ignore player surrander player with three players', () => {
    const readyGame = readyGameWithFourPlayers();
    const playerOneSurrender = surrenderDecision(readyGame)();
    const playerTwoSurrender = surrenderDecision(playerOneSurrender)();
    const playerThreeSurrender = surrenderDecision(playerTwoSurrender)();
    const playerFourPlayed = hitDecision(playerThreeSurrender)();

    expect(playerFourPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 3, handIndex: 0 });
  });

  it('should lose after some hits for first player', () => {
    const readyGame = readyGameWithTwoPlayers(HIGH_SHUFFLER);
    const playerOneHit = hitDecision(readyGame)();

    expect(playerOneHit.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(playerOneHit.playingPositions.at(0)?.hands[0].bettingBox).toStrictEqual(0);
  });

  it('should should split for first player', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const played = splitDecision(readyGame)(10);

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[1]?.isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.hands[1]?.bettingBox).toBe(10);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', '5']);
    expect(played.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5']);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(440);
  });

  it('should only allow split when cards are equals', () => {
    const readyGame = readyGameWithTwoPlayers(HIGH_SHUFFLER);

    expect(() => {
      splitDecision(readyGame)(10);
    }).toThrowError(new OnlySplitEqualCardsError('j', 'k'));
  });

  it('should only allow split on first player turn', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const playerOnePlayed = hitDecision(readyGame)();
    const playerTwoPlayed = surrenderDecision(playerOnePlayed)();

    expect(() => {
      splitDecision(playerTwoPlayed)(10);
    }).toThrowError(new OnlySplitFirstTurnError());
  });

  it('should manage player with two hands for split decision', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = splitDecision(readyGame)(10);
    const playerTwoPlayed = hitDecision(playerOneSplit)();
    const playerOneHitForHand1 = hitDecision(playerTwoPlayed)();
    const playerOneHitForHand2 = hitDecision(playerOneHitForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', '5', '10']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', '7']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should forbid double after a split', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = splitDecision(readyGame)(10);
    const playerTwoPlayed = hitDecision(playerOneSplit)();

    expect(() => {
      playerDoubleDecision(playerTwoPlayed)();
    }).toThrowError(new OnlyDoubleWhenNoSplit());
  });

  it('should manage player with two hands for stand decision', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = splitDecision(readyGame)(10);
    const playerTwoPlayed = hitDecision(playerOneSplit)();
    const playerOneStandForHand1 = standDecision(playerTwoPlayed)();
    const playerOneHitForHand2 = hitDecision(playerOneStandForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', '5']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', '10']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should manage player with two hands for surrender decision', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = splitDecision(readyGame)(10);
    const playerTwoPlayed = hitDecision(playerOneSplit)();
    const playerOneSurrenderForHand1 = surrenderDecision(playerTwoPlayed)();
    const playerOneHitForHand2 = hitDecision(playerOneSurrenderForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.availableMoney).toStrictEqual(465);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', '5']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].isDone).toStrictEqual(true);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].bettingBox).toStrictEqual(0);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', '10']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should manage dealer next cards', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnelayerOne = hitDecision(readyGame)();
    const turnOnelayerTwo = hitDecision(turnOnelayerOne)();

    expect(turnOnelayerTwo.dealerHand.cards).toStrictEqual(['6', '6']);
    expect(turnOnelayerTwo.cards.at(0)).toBe('4');
  });

  it('should update player cards on lose', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hitDecision(readyGame)();
    const turnOnePlayerTwo = hitDecision(turnOnePlayerOne)();
    const turnTwoPlayerOne = hitDecision(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hitDecision(turnTwoPlayerOne)();

    expect(turnTwoPlayerTwo.playingPositions.at(1)?.hands.at(0)?.cards).toStrictEqual(['4', '5', '5', '1']);
  });

  it('should manage dealer next cards until reach dealer hand limit', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hitDecision(readyGame)();
    const turnOnePlayerTwo = hitDecision(turnOnePlayerOne)();
    const turnTwoPlayerOne = hitDecision(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hitDecision(turnTwoPlayerOne)();
    const turnThreePlayerOne = hitDecision(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hitDecision(turnThreePlayerOne)();

    expect(turnThreePlayerTwo.dealerHand.isDone).toBe(true);
  });

  it('should not detect a finished game', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const isFinished = isGameFinished(readyGame);

    expect(isFinished).toBe(false);
  });

  it('should not detect a finished game when all player are not done', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hitDecision(readyGame)();
    const turnOnePlayerTwo = hitDecision(turnOnePlayerOne)();
    const turnTwoPlayerOne = hitDecision(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hitDecision(turnTwoPlayerOne)();
    const turnThreePlayerOne = hitDecision(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hitDecision(turnThreePlayerOne)();

    const isFinished = isGameFinished(turnThreePlayerTwo);

    expect(isFinished).toBe(false);
  });

  it('should detect a finished game with dealer done', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hitDecision(readyGame)();
    const turnOnePlayerTwo = hitDecision(turnOnePlayerOne)();
    const turnTwoPlayerOne = hitDecision(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hitDecision(turnTwoPlayerOne)();
    const turnThreePlayerOne = hitDecision(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hitDecision(turnThreePlayerOne)();
    const turnFourPlayerOne = hitDecision(turnThreePlayerTwo)();
    const turnFivePlayerOne = hitDecision(turnFourPlayerOne)();

    const isFinished = isGameFinished(turnFivePlayerOne);

    expect(isFinished).toBe(true);
  });

  it('should create a new game with same players when all losers', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hitDecision(readyGame)();
    const turnOnePlayerTwo = hitDecision(turnOnePlayerOne)();
    const turnTwoPlayerOne = hitDecision(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hitDecision(turnTwoPlayerOne)();
    const turnThreePlayerOne = hitDecision(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hitDecision(turnThreePlayerOne)();
    const turnFourPlayerOne = hitDecision(turnThreePlayerTwo)();
    const turnFivePlayerOne = hitDecision(turnFourPlayerOne)();

    const nextGame = gameEnd(turnFivePlayerOne);

    expect(nextGame).toStrictEqual({
      dealerHand: { cards: [], isDone: false },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: expect.arrayContaining(['7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace']),
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 0, cards: [], isDone: false }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    });
  });

  it('should return player bet when player score is equal to dealer score', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['k', 'k'], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'j'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(500);
    expect(nextGame.playingPositions.at(1)?.availableMoney).toBe(500);
  });

  it('should return player bet with gain when player score is better than dealer score', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8'], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['ace', 'k'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(550);
    expect(nextGame.playingPositions.at(1)?.availableMoney).toBe(500);
  });

  it('should lose player bet when player score is higher than 21', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8'], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'k', 'j'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(450);
  });

  it('should win with low score and dealer bust', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8', '4'], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'k'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(550);
  });

  // todo:
  //  - Player without money
  //  - Leave playing position
  //  - are all [0] OK ?
});
