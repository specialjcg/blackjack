// https://en.wikipedia.org/wiki/Blackjack

import { it, expect, describe } from 'vitest';

type PlayingPositionCount = 5 | 6 | 7 | 8 | 9;

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const VALUES = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

type Card = (typeof VALUES)[number];

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES];

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES];

type PlayingPosition = {
  availableMoney: number;
  bettingBox: number;
  hand: Card[];
};

type Player = {
  availableMoney: number;
};

type Model<TName extends string, TValues> = TValues & { [modelKey in `is${Capitalize<TName>}`]: true };

type Bet = Model<'Bet', { min: number; max: number }>;

const throwBetError = (bet: Omit<Bet, 'isBet'>): Bet => {
  throw new Error(`Bet with value min: ${bet.min} and max: ${bet.max} is invalid`);
};

const isValiBet = (bet: Omit<Bet, 'isBet'>): bet is Bet => bet.min >= 0 && bet.max > bet.min;

const Bet = (bet: Omit<Bet, 'isBet'>): Bet => (isValiBet(bet) ? bet : throwBetError(bet));

type BlackJackConfiguration = {
  playingPositionCount: PlayingPositionCount;
  decksCount: DecksCount;
  bet: Bet;
};

type BlackJack = {
  playingPositions: PlayingPosition[];
  cards: Card[];
  bet: Bet;
  dealerHand: Card[];
};

type Shuffler = (cards: Card[]) => Card[];

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

const join =
  (player: Player) =>
  (game: BlackJack): BlackJack => {
    const availableIndex: number | null = game.playingPositions.findIndex(
      (playingPosition: PlayingPosition) => !Object.prototype.hasOwnProperty.call(playingPosition, 'availableMoney')
    );

    if (availableIndex == null) throw new Error('There is no more available playing position');

    const playingPositions = [...game.playingPositions];
    playingPositions[availableIndex] = { ...player, bettingBox: 0, hand: [] };

    return {
      ...game,
      playingPositions
    };
  };

// todo: add Bet function that takes amount and playing position id => returns BlackJack with ready player
// todo: distribute cards for every bets...

const applyBet = (playingPosition: PlayingPosition, amount: number) => ({
  availableMoney: playingPosition.availableMoney - amount,
  bettingBox: amount
});

const toBettingPosition =
  (position: number, amount: number) =>
  (playingPosition: PlayingPosition, index: number): PlayingPosition => ({
    ...playingPosition,
    ...(index === position ? applyBet(playingPosition, amount) : playingPosition)
  });

const bet =
  ({ amount, position }: { amount: number; position: number }) =>
  (game: BlackJack): BlackJack => ({
    ...game,
    playingPositions: game.playingPositions.map(toBettingPosition(position, amount))
  });

// todo: remove mutation
const deal = (game: BlackJack): BlackJack => {
  let cards = game.cards;

  for (const playingPosition of game.playingPositions) {
    if (playingPosition.hand == null) continue;

    const [card1, card2, ...remainingCards] = cards as Card[];
    cards = remainingCards;

    playingPosition.hand = [card1 as Card, card2 as Card];
  }

  const [dealerHand, ...remainingCards] = cards;

  return {
    ...game,
    cards: remainingCards,
    dealerHand: [dealerHand] as Card[],
    playingPositions: game.playingPositions
  };
};

describe('blackJack game', () => {
  it('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 2,
      bet: Bet({ min: 5, max: 100 })
    });
    expect(game.playingPositions.length).toBe(5);
    expect(game.cards.length).toBe(104);
    expect(game.bet.min).toBe(5);
    expect(game.bet.max).toBe(100);
  });

  it('should create a game with 1 shuffeled deck', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: Bet({ min: 5, max: 100 })
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
      bet: Bet({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 })(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 })(gameWithOnePlayer);

    expect(gameWithTwoPlayers.playingPositions).toStrictEqual([
      { availableMoney: 500, bettingBox: 0, hand: [] },
      { availableMoney: 600, bettingBox: 0, hand: [] },
      {},
      {},
      {}
    ]);
  });

  it('should have 1 betting player', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: Bet({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 })(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 })(gameWithOnePlayer);

    const gameWith1Bet = bet({ position: 0, amount: 50 })(gameWithTwoPlayers);

    expect(gameWith1Bet.playingPositions).toStrictEqual([
      { availableMoney: 450, bettingBox: 50, hand: [] },
      { availableMoney: 600, bettingBox: 0, hand: [] },
      {},
      {},
      {}
    ]);
  });

  it('should deal cards for every playing position and for the dealer', () => {
    const game = BlackJack(testShuffler)({
      playingPositionCount: 5,
      decksCount: 1,
      bet: Bet({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join({ availableMoney: 500 })(game);
    const gameWithTwoPlayers = join({ availableMoney: 600 })(gameWithOnePlayer);

    const gameWith1Bet = bet({ position: 0, amount: 50 })(gameWithTwoPlayers);
    const gameWith2Bets = bet({ position: 1, amount: 100 })(gameWith1Bet);

    const readyGame = deal(gameWith2Bets);

    // todo: add expect for updated card (marge expects)
    expect(readyGame.cards).toStrictEqual([
      '9',
      'q',
      '9',
      'j',
      '2',
      '4',
      'q',
      '6',
      '4',
      'k',
      'k',
      '7',
      '3',
      '9',
      '4',
      '8',
      'k',
      '10',
      '5',
      '3',
      '3',
      '2',
      'as',
      '2',
      '7',
      '7',
      '2',
      '8',
      'q',
      '6',
      'as',
      'k',
      '5',
      'as',
      '9',
      'as',
      '3',
      'j',
      '5',
      '8',
      'q',
      '4',
      '10',
      '7',
      '8',
      '6',
      '10'
    ]);
    expect(readyGame.dealerHand).toStrictEqual(['10']);
    expect(readyGame.playingPositions).toStrictEqual([
      { availableMoney: 450, bettingBox: 50, hand: ['j', 'j'] },
      { availableMoney: 500, bettingBox: 100, hand: ['6', '5'] },
      {},
      {},
      {}
    ]);
  });

  // todo: error with < min and > max bets
});

const BlackJack =
  (shuffler: Shuffler) =>
  (blackJackConfiguration: BlackJackConfiguration): BlackJack => {
    return {
      dealerHand: [],
      playingPositions: new Array(blackJackConfiguration.playingPositionCount).fill({}),
      cards: shuffler(new Array(blackJackConfiguration.decksCount).fill(DECK).flat()),
      bet: blackJackConfiguration.bet
    };
  };
