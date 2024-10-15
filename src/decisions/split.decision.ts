import { BlackJack, Card, PlayingPosition } from '../black-jack';
import { nextPlayerId } from './decision-commons';

export class OnlySplitEqualCardsError extends Error {
  public constructor(card1: Card, card2: Card) {
    super(`Card ${card1} and card ${card2} should be equal for a split`);
  }
}

export class OnlySplitFirstTurnError extends Error {
  public constructor() {
    super(`You can only split cards on your first turn`);
  }
}

type InitSplit = {
  hand1Card: Card;
  hand2Card: Card;
  bet: number;
};

const doublePlayingPosition = (playingPosition: PlayingPosition, split: InitSplit): PlayingPosition => {
  const [hand1Card, hand2Card] = playingPosition.hands[0].cards as [Card, Card];

  if (playingPosition.hands[0].cards.length > 2) {
    throw new OnlySplitFirstTurnError();
  }

  if (hand1Card != hand2Card) {
    throw new OnlySplitEqualCardsError(hand1Card, hand2Card);
  }

  return {
    ...playingPosition,
    availableMoney: playingPosition.availableMoney - split.bet,
    hands: [
      {
        isDone: false,
        bettingBox: playingPosition.hands[0].bettingBox,
        cards: [hand1Card, split.hand1Card]
      },
      {
        isDone: false,
        bettingBox: split.bet,
        cards: [hand2Card, split.hand2Card]
      }
    ]
  };
};

export const playerSplitDecision =
  (game: BlackJack) =>
  (bet: number): BlackJack => {
    let cardsAfterPlayerDecision: Card[] = game.cards;

    const gameUpdate: BlackJack = {
      ...game,
      playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
        if (game.currentPlayingHand.playingPositionId !== playingPosition.id) return playingPosition;

        const [hand1Card, hand2Card, ...cards] = cardsAfterPlayerDecision as [Card, Card];
        cardsAfterPlayerDecision = cards;

        return doublePlayingPosition(playingPosition, { hand1Card, hand2Card, bet });
      })
    };

    return {
      ...gameUpdate,
      currentPlayingHand: {
        playingPositionId: nextPlayerId(game),
        handIndex: 0
      },
      cards: cardsAfterPlayerDecision
    };
  };
