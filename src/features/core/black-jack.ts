// https://en.wikipedia.org/wiki/Blackjack

import { type BetRange } from '../actions';
import { Card } from './card';
import { DealerHand, PlayingHand } from './hand';
import { PlayingPosition } from './playing-position';

export type BlackJack = {
  currentPlayingHand: PlayingHand;
  playingPositions: PlayingPosition[];
  cards: Card[];
  betRange: BetRange;
  dealerHand: DealerHand;
};
