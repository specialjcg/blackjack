import { BlackJack, Card, PlayingPosition } from '../black-jack';
import { exceeding21, losePlayingPosition, nextPlayerId } from './decision-commons';

const hitPlayingPosition = (playingPosition: PlayingPosition, cards: Card[]): PlayingPosition => ({
  ...playingPosition,
  hands: [{ ...playingPosition.hands[0], cards }]
});

export const playerHitDecision = (game: BlackJack) => (): BlackJack => {
  let cardsAfterPlayerDecision: Card[] = game.cards;

  const gameUpdate: BlackJack = {
    ...game,
    playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
      if (game.currentPlayerId === playingPosition.id) {
        const [nextCard, ...cards] = cardsAfterPlayerDecision;
        cardsAfterPlayerDecision = cards;

        const handCards = [...playingPosition.hands[0].cards, nextCard as Card];
        return exceeding21(handCards) ? losePlayingPosition(playingPosition) : hitPlayingPosition(playingPosition, handCards);
      }

      return playingPosition;
    })
  };

  return {
    ...gameUpdate,
    currentPlayerId: nextPlayerId(game),
    cards: cardsAfterPlayerDecision
  };
};
