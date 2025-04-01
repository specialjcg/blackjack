import { BlackJack, EMPTY_PLAYER_HAND, Player, PlayingPosition, PlayingPositionId } from '../core';

const matchingId =
  <T>(idToCheck: T) =>
  ({ id }: { id: T }): boolean =>
    id === idToCheck;

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
