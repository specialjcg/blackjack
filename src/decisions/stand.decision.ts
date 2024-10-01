import { BlackJack, PlayingPosition, PlayingPositionId } from '../black-jack';
import { nextPlayerId } from './decision-commons';

const standPlayingPosition = (playingPosition: PlayingPosition): PlayingPosition => ({
  ...playingPosition,
  hands: [{ ...playingPosition.hands[0], isDone: true }]
});

const toStandForPlayer =
  (playingPositionId: PlayingPositionId) =>
  (playingPosition: PlayingPosition): PlayingPosition =>
    playingPositionId === playingPosition.id ? standPlayingPosition(playingPosition) : playingPosition;

const updatePlayingPosition = (game: BlackJack): BlackJack => ({
  ...game,
  playingPositions: game.playingPositions.map(toStandForPlayer(game.currentPlayerId))
});

export const playerStandDecision = (game: BlackJack) => (): BlackJack => ({
  ...updatePlayingPosition(game),
  currentPlayerId: nextPlayerId(game),
  cards: game.cards
});
