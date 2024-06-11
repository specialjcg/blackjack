import { describe, expect, it } from 'vitest';
import { bet, BetRange, BlackJack, Card, deal, join, playerDecision, Shuffler } from './black-jack';

let seed = 1;

const random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const testShuffler: Shuffler = (cards: Card[]) => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]] as [Card, Card];
  }
  return cards;
};

const readyGameWithTwoPlayers = () => {
  const game = BlackJack(testShuffler)({
    playingPositionCount: 5,
    decksCount: 1,
    bet: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join({ availableMoney: 500 }, 0)(game);
  const gameWithTwoPlayers = join({ availableMoney: 600 }, 1)(gameWithOnePlayer);

  const gameWith1Bet = bet({ position: 0, amount: 50 })(gameWithTwoPlayers);
  const gameWith2Bets = bet({ position: 1, amount: 100 })(gameWith1Bet);

  return deal(gameWith2Bets);
};

describe('blackJack game', () => {
  it('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
    const game = BlackJack(testShuffler)({
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
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });
    const expectedDesk: Card[] = [
      ...(['j', 'k', 'q', '5', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'as', '10', '9', '3', '8', 'k', 'as'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'as'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'as', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    expect(game.cards).toStrictEqual(expectedDesk);
  });

  it('should join two players', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 }, 0)(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 }, 1)(gameWithOnePlayer);

    expect(gameWithTwoPlayers.playingPositions).toStrictEqual([
      { availableMoney: 500, bettingBox: 0, hand: [], id: 0, isReady: false },
      { availableMoney: 600, bettingBox: 0, hand: [], id: 1, isReady: false }
    ]);
  });

  it('should have 1 betting player', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 }, 0)(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 }, 1)(gameWithOnePlayer);

    const gameWith1Bet = bet({ position: 0, amount: 50 })(gameWithTwoPlayers);

    expect(gameWith1Bet.playingPositions).toStrictEqual([
      { availableMoney: 450, bettingBox: 50, hand: [], id: 0, isReady: false },
      { availableMoney: 600, bettingBox: 0, hand: [], id: 1, isReady: false }
    ]);
  });

  it('should deal cards for every playing position and for the dealer', () => {
    const readyGame = readyGameWithTwoPlayers();

    expect(readyGame).toStrictEqual({
      dealerHand: ['10'],
      betRange: BetRange({ min: 5, max: 100 }),
      cards: [
        ...['9', 'q', '9', 'j', '2', '4', 'q', '6', '4', 'k', 'k', '7', '3'],
        ...['9', '4', '8', 'k', '10', '5', '3', '3', '2', 'as', '2', '7', '7'],
        ...['2', '8', 'q', '6', 'as', 'k', '5', 'as', '9', 'as', '3', 'j', '5'],
        ...['8', 'q', '4', '10', '7', '8', '6', '10']
      ],
      playingPositions: [
        { availableMoney: 450, bettingBox: 50, hand: ['j', 'j'], id: 0, isReady: false },
        { availableMoney: 500, bettingBox: 100, hand: ['6', '5'], id: 1, isReady: false }
      ]
    });
  });

  it('should not bet amount less than minimal game bet amount', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 }, 0)(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 }, 1)(gameWithOnePlayer);

    expect(() => {
      bet({ position: 0, amount: 1 })(gameWithTwoPlayers);
    }).toThrowError('Player should bet more than 5, 1 received');
  });

  it('should not bet amount more than maximal game bet amount', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 }, 0)(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 }, 1)(gameWithOnePlayer);

    expect(() => {
      bet({ position: 0, amount: 101 })(gameWithTwoPlayers);
    }).toThrowError('Player should bet less than 100, 101 received');
  });

  it('should stand for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = playerDecision(readyGame)({ positionId: 0, action: 'stand' });

    expect(played.playingPositions.at(0)?.isReady).toBe(true);
  });

  // todo: Players turn
  //  - surrender
  //  - double
  //  - hit
  //  - split (a player have two hands for his playing position)

  // todo: Dealer second card
});
