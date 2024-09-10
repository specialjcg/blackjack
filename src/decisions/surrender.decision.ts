import { BlackJack, PlayingPosition } from '../black-jack';
import { nextPlayerId } from './decision-commons';

const surrenderPlayingPosition = (playingPosition: PlayingPosition): PlayingPosition => ({
  ...playingPosition,
  availableMoney: playingPosition.availableMoney + playingPosition.hands[0].bettingBox / 2,
  hands: [
    {
      ...playingPosition.hands[0],
      isDone: true,
      bettingBox: 0
    }
  ]
});

export const playerSurrenderDecision = (game: BlackJack) => (): BlackJack => {
  const gameUpdate: BlackJack = {
    ...game,
    playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
      if (game.currentPlayerId === playingPosition.id) {
        return surrenderPlayingPosition(playingPosition);
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
