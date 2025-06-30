import { BlackJack } from './black-jack';
import { PlayingPosition } from './playing-position';

export type Player = {
  availableMoney: number;
};

export const isPlaying =
  ({ currentPlayingHand: { playingPositionId } }: BlackJack) =>
  (playingPosition: PlayingPosition) =>
    playingPositionId === playingPosition.id;
