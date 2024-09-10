import { BlackJack, PlayingPosition } from '../black-jack';
import { nextPlayerId } from './decision-commons';

const standPlayingPosition = (playingPosition: PlayingPosition): PlayingPosition => ({
  ...playingPosition,
  hands: [{ ...playingPosition.hands[0], isDone: true }]
});

export const playerStandDecision = (game: BlackJack) => (): BlackJack => {
  const gameUpdate: BlackJack = {
    ...game,
    playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
      if (game.currentPlayerId === playingPosition.id) {
        return standPlayingPosition(playingPosition);
      }

      return playingPosition;
    })
  };

  return {
    ...gameUpdate,
    currentPlayerId: nextPlayerId(game),
    cards: game.cards
  };
};
