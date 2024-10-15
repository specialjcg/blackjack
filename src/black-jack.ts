// https://en.wikipedia.org/wiki/Blackjack

type PlayingPositionCount = 5 | 6 | 7 | 8 | 9;

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlayingPositionId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlayingHand = {
  playingPositionId: PlayingPositionId;
  handIndex: 0 | 1;
};

const VALUES = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

export type Card = (typeof VALUES)[number];

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES];

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES];

export type Hand = {
  bettingBox: number;
  cards: Card[];
  isDone: boolean;
};

export type Hands = [Hand] | [Hand, Hand];

export type PlayingPosition = {
  id: PlayingPositionId;
  availableMoney: number;
  hands: Hands;
};

type Player = {
  availableMoney: number;
};

type Model<TName extends string, TValues> = TValues & { [modelKey in `is${Capitalize<TName>}`]: true };

export type BetRange = Model<'BetRange', { min: number; max: number }>;

const throwBetRangeError = (betRange: Omit<BetRange, 'isBetRange'>): BetRange => {
  throw new Error(`Bet range with value min: ${betRange.min} and max: ${betRange.max} is invalid`);
};

const isValidBetRange = (betRange: Omit<BetRange, 'isBetRange'>): betRange is BetRange =>
  betRange.min >= 0 && betRange.max > betRange.min;

export const BetRange = (betRange: Omit<BetRange, 'isBetRange'>): BetRange =>
  isValidBetRange(betRange) ? betRange : throwBetRangeError(betRange);

type BlackJackConfiguration = {
  playingPositionCount: PlayingPositionCount;
  decksCount: DecksCount;
  bet: BetRange;
};

export type BlackJack = {
  currentPlayingHand: PlayingHand;
  playingPositions: PlayingPosition[];
  cards: Card[];
  betRange: BetRange;
  dealerHand: Card[];
};

export type Shuffler = (cards: Card[]) => Card[];

const matchingId =
  <T>(idToCheck: T) =>
  ({ id }: { id: T }): boolean =>
    id === idToCheck;

export const join =
  (game: BlackJack) =>
  (player: Player, playingPositionId: PlayingPositionId): BlackJack => {
    if (game.playingPositions.find(matchingId(playingPositionId)) != null)
      throw new Error('This playing position is already taken');

    return {
      ...game,
      playingPositions: [
        ...game.playingPositions,
        {
          ...player,
          id: playingPositionId,
          hands: [{ bettingBox: 0, cards: [], isDone: false }]
        }
      ]
    };
  };

const applyBet = (playingPosition: PlayingPosition, amount: number): PlayingPosition => ({
  id: playingPosition.id,
  availableMoney: playingPosition.availableMoney - amount,
  hands: [{ ...playingPosition.hands[0], bettingBox: amount }]
});

const toBettingPosition =
  (position: number, amount: number) =>
  (playingPosition: PlayingPosition, index: number): PlayingPosition => ({
    ...playingPosition,
    ...(index === position ? applyBet(playingPosition, amount) : playingPosition)
  });

export const bet =
  (game: BlackJack) =>
  ({ amount, position }: { amount: number; position: number }): BlackJack => {
    if (amount < game.betRange.min) throw Error(`Player should bet more than ${game.betRange.min}, ${amount} received`);
    if (amount > game.betRange.max) throw Error(`Player should bet less than ${game.betRange.max}, ${amount} received`);
    return {
      ...game,
      playingPositions: game.playingPositions.map(toBettingPosition(position, amount))
    };
  };

type DealingInProgress = { cards: Card[]; playingPositions: PlayingPosition[] };

const startDealing = ({ cards }: BlackJack) => ({
  cards,
  playingPositions: []
});

const untilDealingIsDone = (
  { playingPositions, cards: [card1, card2, ...cards] }: DealingInProgress,
  playingPosition: PlayingPosition
): { cards: Card[]; playingPositions: PlayingPosition[] } => ({
  cards,
  playingPositions: [
    ...playingPositions,
    {
      ...playingPosition,
      hands: [
        {
          ...playingPosition.hands[0],
          cards: [card1, card2] as Card[]
        }
      ]
    }
  ]
});

export const deal = (game: BlackJack): BlackJack => {
  const { cards: initialCards, playingPositions } = game.playingPositions.reduce(untilDealingIsDone, startDealing(game));
  const [dealerHand, ...cards] = initialCards;

  return {
    ...game,
    ...{ playingPositions, dealerHand: dealerHand == null ? [] : [dealerHand], cards }
  };
};

export const BlackJack =
  (shuffler: Shuffler) =>
  (blackJackConfiguration: BlackJackConfiguration): BlackJack => ({
    dealerHand: [],
    playingPositions: [],
    cards: shuffler(new Array(blackJackConfiguration.decksCount).fill(DECK).flat()),
    betRange: blackJackConfiguration.bet,
    currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
  });
