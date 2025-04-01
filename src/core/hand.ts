import { Card } from './card';
import { PlayingPosition, PlayingPositionId } from './playing-position';

export type Hand = {
  bettingBox: number;
  cards: Card[];
  isDone: boolean;
};

export type DealerHand = {
  cards: Card[];
  hiddenCard: [Card] | [];
  isDone: boolean;
};

export type PlayingHand = {
  playingPositionId: PlayingPositionId;
  handIndex: 0 | 1;
};

export type Hands = [Hand] | [Hand, Hand];

const PICTURE_VALUE = 10;

const LOW_ACE_VALUE = 1 as const;

const HIGH_ACE_VALUE = 11 as const;

const BEST_SCORE = 21 as const;

const PICTURES = ['10', 'j', 'q', 'k'];

export const EMPTY_PLAYER_HAND = { bettingBox: 0, cards: [], isDone: false };

export const STARTING_HAND_INDEX = 0 as const;

const cardValue = (card: Card, handValue: number) => (card === 'ace' ? betterAceValueFor(handValue) : valueOf(card));

const toHandValue = (handValue: number, card: Card) => handValue + cardValue(card, handValue);

const handValueWithMultipleAces = (hand: Card[], numberOfAces: number) => {
  const handValueWithoutAces = hand.filter((card) => card !== 'ace').reduce(toHandValue, 0);
  return handValueWithoutAces + numberOfAces + (HIGH_ACE_VALUE - 1) <= BEST_SCORE
    ? handValueWithoutAces + numberOfAces + (HIGH_ACE_VALUE - 1)
    : handValueWithoutAces + numberOfAces;
};

const byAceAtTheEnd = (a: Card) => (a === 'ace' ? 1 : -1);

const betterAceValueFor = (handValue: number): number =>
  handValue + HIGH_ACE_VALUE > BEST_SCORE ? LOW_ACE_VALUE : HIGH_ACE_VALUE;

const valueOf = (card: string) => (PICTURES.includes(card) ? PICTURE_VALUE : +card);

export const computeHandValue = (hand: Card[]) => {
  const numberOfAces = hand.filter((card) => card === 'ace').length;
  return numberOfAces > 1
    ? handValueWithMultipleAces(hand, numberOfAces)
    : [...hand].sort(byAceAtTheEnd).reduce(toHandValue, STARTING_HAND_INDEX);
};

export const exceeding21 = (hand: Card[]) => computeHandValue(hand) > BEST_SCORE;

export const handsAreDone = ({ hands }: PlayingPosition) => hands.every(({ isDone }: Hand) => isDone);
