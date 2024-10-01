import { BlackJack, PlayingPosition, PlayingPositionId } from '../black-jack';
import { nextPlayerId } from './decision-commons';

const surrenderPlayingPosition = (playingPosition: PlayingPosition): PlayingPosition => ({
  ...playingPosition,
  availableMoney: playingPosition.availableMoney + playingPosition.hands[0].bettingBox / 2,
  hands: [{ ...playingPosition.hands[0], isDone: true, bettingBox: 0 }]
});

const toSurrenderForPlayer =
  (playingPositionId: PlayingPositionId) =>
  (playingPosition: PlayingPosition): PlayingPosition =>
    playingPositionId === playingPosition.id ? surrenderPlayingPosition(playingPosition) : playingPosition;

const updatePlayingPosition = (game: BlackJack): BlackJack => ({
  ...game,
  playingPositions: game.playingPositions.map(toSurrenderForPlayer(game.currentPlayerId))
});

export const playerSurrenderDecision = (game: BlackJack) => (): BlackJack => ({
  ...updatePlayingPosition(game),
  currentPlayerId: nextPlayerId(game),
  cards: game.cards
});
