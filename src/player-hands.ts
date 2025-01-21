import { Card, PlayingPosition } from './black-jack';

export type Hand = {
  bettingBox: number;
  cards: Card[];
  isDone: boolean;
};

export type Hands = [Hand] | [Hand, Hand];

export const handIsDone = ({ isDone }: Hand) => isDone;

export const handsAreDone = ({ hands }: PlayingPosition) => hands.every(handIsDone);
