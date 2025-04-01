import { BlackJack, Model, PlayingPosition, STARTING_HAND_INDEX } from '../core';

export type BetRange = Model<'BetRange', { min: number; max: number }>;

const throwBetRangeError = (betRange: Omit<BetRange, 'isBetRange'>): BetRange => {
  throw new Error(`Bet range with value min: ${betRange.min} and max: ${betRange.max} is invalid`);
};

const isValidBetRange = (betRange: Omit<BetRange, 'isBetRange'>): betRange is BetRange =>
  betRange.min >= 0 && betRange.max > betRange.min;

export const BetRange = (betRange: Omit<BetRange, 'isBetRange'>): BetRange =>
  isValidBetRange(betRange) ? betRange : throwBetRangeError(betRange);

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
