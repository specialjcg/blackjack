import { BlackJack, Card, PlayingPosition, PlayingPositionId } from '../black-jack';

const PICTURES = ['10', 'j', 'q', 'k'];

const PICTURE_VALUE = 10;

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = 0): PlayingPositionId =>
    ((game.currentPlayerId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const nextPlayerIds = ({ playingPositions: { length } }: BlackJack): PlayingPositionId[] => Array.from({ length });

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, currentPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.hands[0].isDone ? currentPlayerId : nextPlayerId;

const cardValue = (card: Card) => (PICTURES.includes(card) ? PICTURE_VALUE : +card);

const toHandValue = (handValue: number, card: Card) => handValue + cardValue(card);

export const nextPlayerId = (game: BlackJack) =>
  nextPlayerIds(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(0));

export const exceeding21 = (hand: Card[]) => hand.reduce(toHandValue, 0) > 21;

export const losePlayingPosition = (playingPosition: PlayingPosition): PlayingPosition => ({
  ...playingPosition,
  hands: [
    {
      ...playingPosition.hands[0],
      isDone: true,
      bettingBox: 0
    }
  ]
});
