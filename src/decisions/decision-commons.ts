import { BlackJack, Card, PlayingHand, PlayingPosition, PlayingPositionId } from '../black-jack';

const PICTURES = ['10', 'j', 'q', 'k'];

const PICTURE_VALUE = 10;

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = 0): PlayingPositionId =>
    ((game.currentPlayingHand.playingPositionId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const nextPlayerIds = ({ playingPositions: { length } }: BlackJack): PlayingPositionId[] => Array.from({ length });

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, currentPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.hands[0].isDone ? currentPlayerId : nextPlayerId;

// todo: refactor this
const cardValue = (card: Card, handValue: number) => {
  if (card === 'ace') {
    if (handValue + 11 > 21) return 1;
    else return 11;
  }

  return PICTURES.includes(card) ? PICTURE_VALUE : +card;
};

const toHandValue = (handValue: number, card: Card) => handValue + cardValue(card, handValue);

export const nextPlayerId = (game: BlackJack) =>
  nextPlayerIds(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(0));

export const computeScore = (hand: Card[]) => hand.reduce(toHandValue, 0);

export const exceeding21 = (hand: Card[]) => computeScore(hand) > 21;

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

export const availablePlayerNextHand = (gameUpdate: BlackJack) => (curentPlayingPosition?: PlayingPosition) =>
  (curentPlayingPosition?.hands.length ?? 0) > 1 && gameUpdate.currentPlayingHand.handIndex === 0;

export const nextHand = (game: BlackJack): PlayingHand => ({
  playingPositionId: game.currentPlayingHand.playingPositionId,
  handIndex: 1
});

export const nextPLayer = (game: BlackJack): PlayingHand => ({
  playingPositionId: nextPlayerId(game),
  handIndex: 0
});

export const curentPlayingPosition = (game: BlackJack) => (playingPosition: PlayingPosition) =>
  playingPosition.id === game.currentPlayingHand.playingPositionId;

export const curentPlayingPositionFor = (game: BlackJack) => game.playingPositions.find(curentPlayingPosition(game));
