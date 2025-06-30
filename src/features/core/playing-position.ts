import { Hands } from './hand';

export type PlayingPositionId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlayingPosition = {
  id: PlayingPositionId;
  availableMoney: number;
  hands: Hands;
};
