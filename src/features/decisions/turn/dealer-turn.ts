import { areAllPlayingPositionDone } from '../../actions';
import { BlackJack, Card, computeHandValue, PlayingHand } from '../../core';

const DEALER_LIMIT_HAND_VALUE = 17;

const dealerHandReachedLimitHandValue = (dealerCards: Card[]) => computeHandValue(dealerCards) >= DEALER_LIMIT_HAND_VALUE;

const nextDealerHand =
  (game: BlackJack, currentPlayingHand: PlayingHand) =>
  ({ dealerCards, nextCards }: { dealerCards: Card[]; nextCards: Card[] }) => ({
    ...game,
    dealerHand: {
      isDone: true,
      hiddenCard: [] as [Card] | [],
      cards: dealerCards
    },
    currentPlayingHand,
    cards: nextCards
  });

export const isDealerTurn = (game: BlackJack) => areAllPlayingPositionDone(game);

const playNextCard =
  (dealerCards: Card[]) =>
  ([card, ...nextCards]: Card[]) => ({
    dealerCards: [...dealerCards, card] as Card[],
    nextCards
  });

const playUtilLimitHandValueReached = ({
  dealerCards,
  nextCards
}: {
  dealerCards: Card[];
  nextCards: Card[];
}): { dealerCards: Card[]; nextCards: Card[] } =>
  dealerHandReachedLimitHandValue(dealerCards) ? { dealerCards, nextCards } : playNextCard(dealerCards)(nextCards);

const revealDealerHiddenCard =
  ({ dealerHand: { cards: dealerCards, hiddenCard } }: BlackJack) =>
  (cards: Card[]) => ({
    dealerCards: [...dealerCards, ...hiddenCard],
    nextCards: cards
  });

export const nextDealerTurn = (game: BlackJack, currentPlayingHand: PlayingHand) => (cards: Card[]) =>
  nextDealerHand(game, currentPlayingHand)(cards.reduce(playUtilLimitHandValueReached, revealDealerHiddenCard(game)(cards)));
