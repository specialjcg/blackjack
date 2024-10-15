import { BlackJack, Hand, Hands, PlayingPosition } from '../black-jack';
import { availablePlayerNextHand, curentPlayingPositionFor, nextHand, nextPLayer } from './decision-commons';

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

export const playerSurrenderDecision = (game: BlackJack) => (): BlackJack => ({
  ...updatePlayingPosition(game),
  currentPlayingHand: availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPLayer(game),
  cards: game.cards
});
