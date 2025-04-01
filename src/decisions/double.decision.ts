import { BlackJack, Card, exceeding21, Hands, isPlaying, PlayingPosition } from '../core';
import { losePlayingPosition } from './lose-playing-position';
import { addNextCard, initNextTurn, NextTurn, noChangeFor, prepareNextTurn } from './turn';

export class OnlyDoubleWhenNoSplitError extends Error {
  public constructor() {
    super(`You can only double when you have not split`);
  }
}

const HAND_TO_DOUBLE_INDEX = 0 as const;

const updateDoubleHandsCards =
  (playingPosition: PlayingPosition) =>
  (cards: Card[]): Hands => [
    {
      ...playingPosition.hands[HAND_TO_DOUBLE_INDEX],
      isDone: true,
      bettingBox: playingPosition.hands[HAND_TO_DOUBLE_INDEX].bettingBox * 2,
      cards
    }
  ];

const removeSameBetFromAvailableMoney = (playingPosition: PlayingPosition): number =>
  playingPosition.availableMoney - playingPosition.hands[HAND_TO_DOUBLE_INDEX].bettingBox;

const doublePlayingPosition =
  (playingPosition: PlayingPosition) =>
  (cards: Card[]): PlayingPosition => ({
    ...playingPosition,
    availableMoney: removeSameBetFromAvailableMoney(playingPosition),
    hands: updateDoubleHandsCards(playingPosition)(cards)
  });

const updatePlayingPositions =
  (game: BlackJack) =>
  (nextCard: Card, { playingPosition, nextTurn }: { playingPosition: PlayingPosition; nextTurn: NextTurn }) => {
    const handCards: Card[] = addNextCard(game)(playingPosition, nextCard);

    return [
      ...nextTurn.playingPositions,
      exceeding21(handCards)
        ? losePlayingPosition(playingPosition)(handCards, game.currentPlayingHand.handIndex)
        : doublePlayingPosition(playingPosition)(handCards)
    ];
  };

const nextTurnFor =
  (game: BlackJack) => (playingPositionToUpdate: { playingPosition: PlayingPosition; nextTurn: NextTurn }) => {
    const [nextCard, ...cards] = playingPositionToUpdate.nextTurn.cards as [Card, ...Card[]];

    return {
      playingPositions: updatePlayingPositions(game)(nextCard, playingPositionToUpdate),
      cards
    };
  };

const toNextTurn =
  (game: BlackJack) =>
  (nextTurn: NextTurn, playingPosition: PlayingPosition): NextTurn =>
    isPlaying(game)(playingPosition)
      ? nextTurnFor(game)({ playingPosition, nextTurn })
      : noChangeFor(playingPosition)(nextTurn);

export const double = (game: BlackJack) => (): BlackJack => {
  if (game.playingPositions.some((playingPosition: PlayingPosition) => playingPosition.hands.length > 1))
    throw new OnlyDoubleWhenNoSplitError();

  const nextTurn: NextTurn = game.playingPositions.reduce(toNextTurn(game), initNextTurn(game));

  return prepareNextTurn(game)({ ...game, playingPositions: nextTurn.playingPositions }, nextTurn.cards, false);
};
