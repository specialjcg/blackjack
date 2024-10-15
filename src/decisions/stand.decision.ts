import { BlackJack, Hand, Hands, PlayingPosition } from '../black-jack';
import { availablePlayerNextHand, curentPlayingPositionFor, nextHand, nextPLayer } from './decision-commons';

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

export const playerStandDecision = (game: BlackJack) => (): BlackJack => ({
  ...updatePlayingPosition(game),
  currentPlayingHand: availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPLayer(game),
  cards: game.cards
});
