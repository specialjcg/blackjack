import { BlackJack, Card, Hand, Hands, PlayingPosition } from '../black-jack';
import {
  availablePlayerNextHand,
  curentPlayingPositionFor,
  exceeding21,
  losePlayingPosition,
  nextHand,
  nextPLayer
} from './decision-commons';

const toUpdateHitHandsCards =
  (handIndex: number, cards: Card[]) =>
  (hand: Hand, index: number): Hand =>
    index === handIndex ? { ...hand, cards } : hand;

const hitPlayingPosition = (playingPosition: PlayingPosition, cards: Card[], handIndex: number): PlayingPosition => ({
  ...playingPosition,
  hands: playingPosition.hands.map(toUpdateHitHandsCards(handIndex, cards)) as Hands
});

export const playerHitDecision = (game: BlackJack) => (): BlackJack => {
  let cardsAfterPlayerDecision: Card[] = game.cards;

  // todo: refactor
  const gameUpdate: BlackJack = {
    ...game,
    playingPositions: game.playingPositions.map((playingPosition: PlayingPosition) => {
      if (game.currentPlayingHand.playingPositionId === playingPosition.id) {
        const [nextCard, ...cards] = cardsAfterPlayerDecision;
        cardsAfterPlayerDecision = cards;

        const handCards = [
          ...(playingPosition.hands[game.currentPlayingHand.handIndex]?.cards ?? playingPosition.hands[0].cards),
          nextCard as Card
        ];

        return exceeding21(handCards)
          ? losePlayingPosition(playingPosition)
          : hitPlayingPosition(playingPosition, handCards, game.currentPlayingHand.handIndex);
      }

      return playingPosition;
    })
  };

  return {
    ...gameUpdate,
    currentPlayingHand: availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPLayer(game),
    cards: cardsAfterPlayerDecision
  };
};
