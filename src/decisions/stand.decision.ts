import { BlackJack, PlayingPosition } from '../black-jack';
import { prepareNextTurn } from './decision-commons';
import { Hand, Hands } from '../player-hands';

const toUpdateStandHandsCards =
  (handIndex: number) =>
  (hand: Hand, index: number): Hand =>
    index === handIndex ? { ...hand, isDone: true } : hand;

const standPlayingPosition = (playingPosition: PlayingPosition, handIndex: number): PlayingPosition => ({
  ...playingPosition,
  hands: playingPosition.hands.map(toUpdateStandHandsCards(handIndex)) as Hands
});

const toStandForPlayer =
  ({ currentPlayingHand: { playingPositionId, handIndex } }: BlackJack) =>
  (playingPosition: PlayingPosition): PlayingPosition =>
    playingPositionId === playingPosition.id ? standPlayingPosition(playingPosition, handIndex) : playingPosition;

const updatePlayingPosition = (game: BlackJack): BlackJack => ({
  ...game,
  playingPositions: game.playingPositions.map(toStandForPlayer(game))
});

export const standDecision = (game: BlackJack) => (): BlackJack =>
  prepareNextTurn(game)(updatePlayingPosition(game), game.cards, true);
