import { BlackJack, Card, PlayingHand, PlayingPosition, STARTING_HAND_INDEX } from '../../core';
import { isDealerTurn, nextDealerTurn } from './dealer-turn';
import { nextPlayingHand } from './next-playing-hand';

export type NextTurn = {
  playingPositions: PlayingPosition[];
  cards: Card[];
};

const nextPlayerTurn =
  (game: BlackJack, currentPlayingHand: PlayingHand) =>
  (cards: Card[]): BlackJack => ({
    ...game,
    currentPlayingHand,
    cards
  });

export const prepareNextTurn =
  (game: BlackJack) =>
  (nextGame: BlackJack, cards: Card[], hasMultipleHands: boolean): BlackJack =>
    isDealerTurn(nextGame)
      ? nextDealerTurn(nextGame, nextPlayingHand(game)(hasMultipleHands))(cards)
      : nextPlayerTurn(nextGame, nextPlayingHand(game)(hasMultipleHands))(cards);

export const noChangeFor = (playingPosition: PlayingPosition) => (nextTurn: NextTurn) => ({
  playingPositions: [...nextTurn.playingPositions, playingPosition],
  cards: nextTurn.cards
});

export const initNextTurn = (game: BlackJack) => ({
  playingPositions: [],
  cards: game.cards
});

export const addNextCard = (game: BlackJack) => (playingPosition: PlayingPosition, nextCard: Card) => [
  ...(playingPosition.hands[game.currentPlayingHand.handIndex]?.cards ?? playingPosition.hands[STARTING_HAND_INDEX].cards),
  nextCard as Card
];
