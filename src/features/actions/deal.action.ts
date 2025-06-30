import { BlackJack, Card, DealerHand, PlayingPosition, STARTING_HAND_INDEX } from '../core';

type DealingInProgress = { cards: Card[]; playingPositions: PlayingPosition[] };

const startDealing = ({ cards }: BlackJack) => ({
  cards,
  playingPositions: []
});

const giveCardsTo =
  (playingPosition: PlayingPosition) =>
  (cards: Card[]): PlayingPosition => ({
    ...playingPosition,
    hands: [{ ...playingPosition.hands[STARTING_HAND_INDEX], cards }]
  });

const dealerHand = (card?: Card, dealerHiddenCard?: Card): { dealerHand: DealerHand } => ({
  dealerHand:
    card == null || dealerHiddenCard == null
      ? { isDone: false, cards: [], hiddenCard: [] }
      : { isDone: false, cards: [card], hiddenCard: [dealerHiddenCard] }
});

const untilDealingIsDone = (
  { playingPositions, cards: [card1, card2, ...cards] }: DealingInProgress,
  playingPosition: PlayingPosition
): { cards: Card[]; playingPositions: PlayingPosition[] } => ({
  cards,
  playingPositions: [...playingPositions, giveCardsTo(playingPosition)([card1, card2] as Card[])]
});

const readyGame =
  (game: BlackJack) =>
  ({
    cards: [dealerCard, dealerHiddenCard, ...cards],
    playingPositions
  }: {
    playingPositions: PlayingPosition[];
    cards: Card[];
  }) => ({
    ...game,
    ...{ playingPositions, ...dealerHand(dealerCard, dealerHiddenCard), cards }
  });

export const deal = (game: BlackJack): BlackJack =>
  readyGame(game)(game.playingPositions.reduce(untilDealingIsDone, startDealing(game)));
