import { Shuffler } from '../actions';
import { Card } from './card';

let seed = 1;

const random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const randomShuffler: Shuffler = (cards: Card[]) => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]] as [Card, Card];
  }
  return cards;
};
