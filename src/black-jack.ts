// https://en.wikipedia.org/wiki/Blackjack

import { computeHandValue, exceeding21, isHigherValue } from './decisions/decision-commons';
import { STARTING_HAND_INDEX } from './hand';
import { Hand, Hands, handsAreDone } from './player-hands';

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

export type DealerHand = {
  cards: Card[];
  isDone: boolean;
};

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
  dealerHand: DealerHand;
};

export type Shuffler = (cards: Card[]) => Card[];

const matchingId =
  <T>(idToCheck: T) =>
  ({ id }: { id: T }): boolean =>
    id === idToCheck;

const EMPTY_PLAYER_HAND = { bettingBox: 0, cards: [], isDone: false };

const isAlreadyTaken = (game: BlackJack) => (playingPositionId: PlayingPositionId) =>
  game.playingPositions.find(matchingId(playingPositionId)) != null;

class PositionNotAvailableError extends Error {
  public constructor() {
    super('This playing position is already taken');
  }
}

const newPlayingPositionFor =
  (player: Player) =>
  (playingPositionId: PlayingPositionId): PlayingPosition => ({
    ...player,
    id: playingPositionId,
    hands: [EMPTY_PLAYER_HAND]
  });

export const join =
  (game: BlackJack) =>
  (player: Player, playingPositionId: PlayingPositionId): BlackJack => {
    if (isAlreadyTaken(game)(playingPositionId)) throw new PositionNotAvailableError();
    return {
      ...game,
      playingPositions: [...game.playingPositions, newPlayingPositionFor(player)(playingPositionId)]
    };
  };

const applyBet = (playingPosition: PlayingPosition, amount: number): PlayingPosition => ({
  id: playingPosition.id,
  availableMoney: playingPosition.availableMoney - amount,
  hands: [{ ...playingPosition.hands[STARTING_HAND_INDEX], bettingBox: amount }]
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

const emptyDealerHand = (): DealerHand => ({ cards: [], isDone: false });

const resetPlayingPosition = (): PlayingHand => ({ playingPositionId: 0, handIndex: 0 });

export const BlackJack =
  (shuffler: Shuffler) =>
  (blackJackConfiguration: BlackJackConfiguration): BlackJack => ({
    dealerHand: emptyDealerHand(),
    playingPositions: [],
    cards: shuffler(new Array(blackJackConfiguration.decksCount).fill(DECK).flat()),
    betRange: blackJackConfiguration.bet,
    currentPlayingHand: resetPlayingPosition()
  });

export const isGameFinished = (game: BlackJack): boolean => game.dealerHand.isDone && game.playingPositions.every(handsAreDone);

const isWinner =
  ({ dealerHand: { cards: dealerCards } }: BlackJack) =>
  ({ cards }: Hand): boolean =>
    !exceeding21(cards) && (isHigherValue(cards)(dealerCards) || exceeding21(dealerCards));

const isDraw =
  ({ dealerHand: { cards: dealerCards } }: BlackJack) =>
  ({ cards }: Hand): boolean =>
    computeHandValue(dealerCards) === computeHandValue(cards);

type GainMatching = {
  decision: (game: BlackJack) => (hand: Hand) => boolean;
  apply: (hand: Hand) => number;
};

const gainMatching: GainMatching[] = [
  { decision: isWinner, apply: (hand: Hand) => hand.bettingBox * 2 },
  { decision: isDraw, apply: (hand: Hand) => hand.bettingBox }
];

const toMatchingGain =
  (game: BlackJack) =>
  (hand: Hand) =>
  (gain: number, { decision, apply }: GainMatching) =>
    decision(game)(hand) ? apply(hand) : gain;

const toPlayerGain =
  (game: BlackJack) =>
  (gain: number, hand: Hand): number =>
    gainMatching.reduce(toMatchingGain(game)(hand), gain);

const onlyPlayersWithMoney = ({ availableMoney }: PlayingPosition): boolean => availableMoney > 0;

const toResetPlayingPositions =
  (game: BlackJack) =>
  (playingPosition: PlayingPosition): PlayingPosition => ({
    ...playingPosition,
    availableMoney: playingPosition.availableMoney + playingPosition.hands.reduce(toPlayerGain(game), 0),
    hands: [EMPTY_PLAYER_HAND]
  });

export const gameEnd = (game: BlackJack): BlackJack => {
  if (!isGameFinished(game)) throw new Error('Game is not finished yet');

  return {
    ...game,
    dealerHand: emptyDealerHand(),
    playingPositions: game.playingPositions.map(toResetPlayingPositions(game)).filter(onlyPlayersWithMoney),
    currentPlayingHand: resetPlayingPosition()
  };
};

const isPlaying = (game: BlackJack) => (playingPositionId: PlayingPositionId) =>
  game.playingPositions.at(playingPositionId)?.hands.some(({ bettingBox }) => bettingBox > 0);

export const leave =
  (game: BlackJack) =>
  (playingPositionId: PlayingPositionId): BlackJack => {
    if (isPlaying(game)(playingPositionId)) throw new Error('Cannot leave a started game');

    return {
      ...game,
      playingPositions: game.playingPositions.filter(({ id }) => id !== playingPositionId)
    };
  };
