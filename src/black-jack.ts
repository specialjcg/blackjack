// https://en.wikipedia.org/wiki/Blackjack

type PlayingPositionCount = 5 | 6 | 7 | 8 | 9;

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type PlayingPositionId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const VALUES = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

export type Card = (typeof VALUES)[number];

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES];

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES];

type PlayingPosition = {
  id: PlayingPositionId;
  availableMoney: number;
  bettingBox: number;
  hand: Card[];
  isDone: boolean;
};

type Player = {
  availableMoney: number;
};

type PlayerAction = 'stand' | 'surrender' | 'double' | 'hit';

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

type BlackJack = {
  currentPlayerId: PlayingPositionId;
  playingPositions: PlayingPosition[];
  cards: Card[];
  betRange: BetRange;
  dealerHand: Card[];
};

export type Shuffler = (cards: Card[]) => Card[];

const matchingId =
  <T>(idToCheck: T) =>
  ({ id }: { id: T }) =>
    id === idToCheck;

export const join =
  (game: BlackJack) =>
  (player: Player, playingPositionId: PlayingPositionId): BlackJack => {
    if (game.playingPositions.find(matchingId(playingPositionId)) != null)
      throw new Error('This playing position is already taken');

    return {
      ...game,
      playingPositions: [...game.playingPositions, { ...player, bettingBox: 0, hand: [], id: playingPositionId, isDone: false }]
    };
  };

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
) => ({
  cards,
  playingPositions: [
    ...playingPositions,
    {
      ...playingPosition,
      hand: [card1, card2] as Card[]
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

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = 0): PlayingPositionId =>
    ((game.currentPlayerId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const nextPlayerIds = ({ playingPositions: { length } }: BlackJack): PlayingPositionId[] => Array.from({ length });

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, currentPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.isDone ? currentPlayerId : nextPlayerId;

const nextPlayerId = (game: BlackJack) =>
  nextPlayerIds(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(0));

export const playerDecision =
  (game: BlackJack) =>
  (action: PlayerAction): BlackJack => {
    // const { cards: initialCards, playingPositions } = game.playingPositions.reduce(() => {}, startDealing(game));
    let cardsAfterPlayerDecision: Card[] = game.cards;

    const gameUpdate: BlackJack = {
      ...game,
      playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
        if (game.currentPlayerId === playingPosition.id && action === 'stand') {
          return {
            ...playingPosition,
            isDone: true
          };
        }

        if (game.currentPlayerId === playingPosition.id && action === 'surrender') {
          return {
            ...playingPosition,
            isDone: true,
            availableMoney: playingPosition.availableMoney + playingPosition.bettingBox / 2,
            bettingBox: 0
          };
        }

        if (game.currentPlayerId === playingPosition.id && action === 'double') {
          const [nextCard, ...cards] = cardsAfterPlayerDecision;
          cardsAfterPlayerDecision = cards;

          return {
            ...playingPosition,
            isDone: true,
            availableMoney: playingPosition.availableMoney - playingPosition.bettingBox,
            bettingBox: playingPosition.bettingBox * 2,
            hand: [...playingPosition.hand, nextCard as Card]
          };
        }

        if (game.currentPlayerId === playingPosition.id && action === 'hit') {
          const [nextCard, ...cards] = cardsAfterPlayerDecision;
          cardsAfterPlayerDecision = cards;

          return {
            ...playingPosition,
            hand: [...playingPosition.hand, nextCard as Card]
          };
        }

        return playingPosition;
      })
    };

    return {
      ...gameUpdate,
      currentPlayerId: nextPlayerId(game),
      cards: cardsAfterPlayerDecision
    };
  };

export const BlackJack =
  (shuffler: Shuffler) =>
  (blackJackConfiguration: BlackJackConfiguration): BlackJack => ({
    dealerHand: [],
    playingPositions: [],
    cards: shuffler(new Array(blackJackConfiguration.decksCount).fill(DECK).flat()),
    betRange: blackJackConfiguration.bet,
    currentPlayerId: 0
  });
