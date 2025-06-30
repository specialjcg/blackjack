import { BlackJack, Card, VALUES } from '../core';
import type { BetRange } from './bet.action';

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES];

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES];

export type Shuffler = (cards: Card[]) => Card[];

export const start =
  (shuffler: Shuffler) =>
  ({ decksCount, betRange }: { decksCount: DecksCount; betRange: BetRange }): BlackJack => ({
    dealerHand: { cards: [], hiddenCard: [], isDone: false },
    playingPositions: [],
    cards: shuffler(new Array(decksCount).fill(DECK).flat()),
    betRange,
    currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
  });
