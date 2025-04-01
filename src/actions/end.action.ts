import {
  BlackJack,
  Card,
  computeHandValue,
  EMPTY_PLAYER_HAND,
  exceeding21,
  Hand,
  handsAreDone,
  PlayingPosition
} from '../core';

type GainMatching = {
  decision: (game: BlackJack) => (hand: Hand) => boolean;
  apply: (hand: Hand) => number;
};

const isHigherValue =
  (cards: Card[]) =>
  (dealerCards: Card[]): boolean =>
    computeHandValue(cards) > computeHandValue(dealerCards);

const isWinner =
  ({ dealerHand: { cards: dealerCards } }: BlackJack) =>
  ({ cards }: Hand): boolean =>
    !exceeding21(cards) && (isHigherValue(cards)(dealerCards) || exceeding21(dealerCards));

const isDraw =
  ({ dealerHand: { cards: dealerCards } }: BlackJack) =>
  ({ cards }: Hand): boolean =>
    computeHandValue(dealerCards) === computeHandValue(cards);

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

export const areAllPlayingPositionDone = (game: BlackJack) => game.playingPositions.every(handsAreDone);

export const isGameFinished = (game: BlackJack): boolean => game.dealerHand.isDone && areAllPlayingPositionDone(game);

export const gameEnd = (game: BlackJack): BlackJack => {
  if (!isGameFinished(game)) throw new Error('Game is not finished yet');

  return {
    ...game,
    dealerHand: { cards: [], hiddenCard: [], isDone: false },
    playingPositions: game.playingPositions.map(toResetPlayingPositions(game)).filter(onlyPlayersWithMoney),
    currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
  };
};
