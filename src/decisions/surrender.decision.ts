import { BlackJack, Hand, Hands, PlayingPosition } from '../core';
import { prepareNextTurn } from './turn';

const toUpdateSurrenderHandsCards =
  (handIndex: number) =>
  (hand: Hand, index: number): Hand =>
    index === handIndex ? { ...hand, isDone: true, bettingBox: 0 } : hand;

const surrenderPlayingPosition = (playingPosition: PlayingPosition, handIndex: number): PlayingPosition => ({
  ...playingPosition,
  availableMoney: playingPosition.availableMoney + (playingPosition.hands[handIndex] as Hand).bettingBox / 2,
  hands: playingPosition.hands.map(toUpdateSurrenderHandsCards(handIndex)) as Hands
});

const toSurrenderForPlayer =
  ({ currentPlayingHand: { playingPositionId, handIndex } }: BlackJack) =>
  (playingPosition: PlayingPosition): PlayingPosition =>
    playingPositionId === playingPosition.id ? surrenderPlayingPosition(playingPosition, handIndex) : playingPosition;

const updatePlayingPosition = (game: BlackJack): BlackJack => ({
  ...game,
  playingPositions: game.playingPositions.map(toSurrenderForPlayer(game))
});

export const surrender = (game: BlackJack) => (): BlackJack =>
  prepareNextTurn(game)(updatePlayingPosition(game), game.cards, true);
