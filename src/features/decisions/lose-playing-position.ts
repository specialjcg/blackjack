import { Card, Hand, Hands, PlayingPosition } from '../core';

const setLoseFor =
  (hand: Hand) =>
  (cards: Card[]): Hand => ({ ...{ ...hand, cards }, isDone: true, bettingBox: 0 });

const toLosingHand =
  (handIndex: number, cards: Card[]) =>
  (hand: Hand, currentHandIndex: number): Hand =>
    handIndex === currentHandIndex ? setLoseFor(hand)(cards) : hand;

export const losePlayingPosition =
  (playingPosition: PlayingPosition) =>
  (cards: Card[], handIndex: number): PlayingPosition => ({
    ...playingPosition,
    hands: playingPosition.hands.map(toLosingHand(handIndex, cards)) as Hands
  });
