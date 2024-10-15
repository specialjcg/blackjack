import { BlackJack, Card, PlayingPosition } from '../black-jack';
import { exceeding21, losePlayingPosition, nextPlayerId } from './decision-commons';

export class OnlyDoubleWhenNoSplit extends Error {
  public constructor() {
    super(`You can only double when you have not split`);
  }
}

const doublePlayingPosition = (playingPosition: PlayingPosition, cards: Card[]): PlayingPosition => ({
  ...playingPosition,
  availableMoney: playingPosition.availableMoney - playingPosition.hands[0].bettingBox,
  hands: [
    {
      ...playingPosition.hands[0],
      isDone: true,
      bettingBox: playingPosition.hands[0].bettingBox * 2,
      cards
    }
  ]
});

// todo: cannot double after split
export const playerDoubleDecision = (game: BlackJack) => (): BlackJack => {
  let cardsAfterPlayerDecision: Card[] = game.cards;

  const gameUpdate: BlackJack = {
    ...game,
    playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
      if (game.currentPlayingHand.playingPositionId !== playingPosition.id) return playingPosition;

      if (playingPosition.hands.length > 1) throw new OnlyDoubleWhenNoSplit();

      const [nextCard, ...cards] = cardsAfterPlayerDecision;
      cardsAfterPlayerDecision = cards;

      const handCards = [...playingPosition.hands[0].cards, nextCard as Card];
      return exceeding21(handCards) ? losePlayingPosition(playingPosition) : doublePlayingPosition(playingPosition, handCards);
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
