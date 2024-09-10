import { describe, expect, it } from 'vitest';
import { bet, BetRange, BlackJack, Card, deal, join, playerDecision, Shuffler } from './black-jack';

let seed = 1;

const LOW_SHUFFLER: Shuffler = () => [
  ...(['2', '3', '4', '5', '6', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
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
  ...(['3', '3', 'q', '4', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
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
      dealerHand: ['10'],
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
      currentPlayerId: 0
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

    const played = playerDecision(readyGame)('stand');

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
  });

  it('should surrender for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = playerDecision(readyGame)('surrender');

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(0);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(475);
  });

  it('should double for first player', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const fisrtPlayerPlayed = playerDecision(readyGame)('double');

    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].bettingBox).toBe(100);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.availableMoney).toBe(400);
    expect(fisrtPlayerPlayed.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(fisrtPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['5', '6', '4']);

    const secondPlayerPlayed = playerDecision(fisrtPlayerPlayed)('double');
    expect(secondPlayerPlayed.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['4', '5', '5']);
    expect(secondPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['6', '4', '10']);
  });

  it('should hit for first player', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const played = playerDecision(readyGame)('hit');

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(450);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(played.currentPlayerId).toStrictEqual(1);
  });

  it('should not hit a second time while every player has not played', () => {
    const readyGame = readyGameWithTwoPlayers();

    const playerOnePlayed = playerDecision(readyGame)('hit');
    const playerTwoPlayed = playerDecision(playerOnePlayed)('hit');

    expect(playerTwoPlayed.currentPlayerId).toStrictEqual(0);
  });

  it('should ignore player surrander player with two players', () => {
    const readyGame = readyGameWithTwoPlayers();
    const playerOneSurrender = playerDecision(readyGame)('surrender');
    const playerTwoPlayed = playerDecision(playerOneSurrender)('hit');

    expect(playerTwoPlayed.currentPlayerId).toStrictEqual(1);
  });

  it('should ignore player surrander player with three players', () => {
    const readyGame = readyGameWithFourPlayers();
    const playerOneSurrender = playerDecision(readyGame)('surrender');
    const playerTwoSurrender = playerDecision(playerOneSurrender)('surrender');
    const playerThreeSurrender = playerDecision(playerTwoSurrender)('surrender');
    const playerFourPlayed = playerDecision(playerThreeSurrender)('hit');

    expect(playerFourPlayed.currentPlayerId).toStrictEqual(3);
  });

  it('should lose after some hits for first player', () => {
    const readyGame = readyGameWithTwoPlayers(HIGH_SHUFFLER);
    const playerOneHit = playerDecision(readyGame)('hit');

    expect(playerOneHit.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(playerOneHit.playingPositions.at(0)?.hands[0].bettingBox).toStrictEqual(0);
  });

  it('should should split for first player', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const played = playerDecision(readyGame)('split');

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[1]?.isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.hands[1]?.bettingBox).toBe(10);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', '5']);
    expect(played.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5']);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(450);
  });

  // todo: Players turn
  //  - split (a player have two hands for his playing position)
  //  - rules with as 1 or 11

  // todo: Dealer second card
});
