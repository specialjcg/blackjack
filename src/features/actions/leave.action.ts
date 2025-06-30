import { BlackJack, PlayingPositionId } from '../core';

const isPlaying = (game: BlackJack) => (playingPositionId: PlayingPositionId) =>
  game.playingPositions.at(playingPositionId)?.hands.some(({ bettingBox }: { bettingBox: number }) => bettingBox > 0);

export const leave =
  (game: BlackJack) =>
  (playingPositionId: PlayingPositionId): BlackJack => {
    if (isPlaying(game)(playingPositionId)) throw new Error('Cannot leave a started game');

    return {
      ...game,
      playingPositions: game.playingPositions.filter(({ id }) => id !== playingPositionId)
    };
  };
