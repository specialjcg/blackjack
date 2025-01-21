import { BlackJack, Card, PlayingPosition } from '../black-jack';
import { Hands } from '../player-hands';
import { initNextTurn, isPlaying, NextTurn, noChangeFor, prepareNextTurn } from './decision-commons';

export class OnlySplitEqualCardsError extends Error {
  public constructor(card1: Card, card2: Card) {
    super(`Card ${card1} and card ${card2} should be equal for a split`);
  }
}

export class OnlySplitFirstTurnError extends Error {
  public constructor() {
    super(`You can only split cards on your first turn`);
  }
}

type InitSplit = {
  hand1Card: Card;
  hand2Card: Card;
  bet: number;
};

const HAND_TO_SPLIT_INDEX = 0 as const;

const updateSplitHandsCards =
  (playingPosition: PlayingPosition) =>
  (split: InitSplit, [hand1Card, hand2Card]: [Card, Card]): Hands => [
    {
      isDone: false,
      bettingBox: playingPosition.hands[HAND_TO_SPLIT_INDEX].bettingBox,
      cards: [hand1Card, split.hand1Card]
    },
    {
      isDone: false,
      bettingBox: split.bet,
      cards: [hand2Card, split.hand2Card]
    }
  ];

const removeSplitBetFromAvailableMoney = (playingPosition: PlayingPosition, split: InitSplit) =>
  playingPosition.availableMoney - split.bet;

const splitPlayingPosition =
  (playingPosition: PlayingPosition) =>
  (split: InitSplit): PlayingPosition => {
    const [hand1Card, hand2Card] = playingPosition.hands[HAND_TO_SPLIT_INDEX].cards as [Card, Card];

    if (playingPosition.hands[HAND_TO_SPLIT_INDEX].cards.length > 2) {
      throw new OnlySplitFirstTurnError();
    }

    if (hand1Card != hand2Card) {
      throw new OnlySplitEqualCardsError(hand1Card, hand2Card);
    }

    return {
      ...playingPosition,
      availableMoney: removeSplitBetFromAvailableMoney(playingPosition, split),
      hands: updateSplitHandsCards(playingPosition)(split, [hand1Card, hand2Card])
    };
  };

const updatePlayingPosition = (
  playingPositionToUpdate: {
    playingPosition: PlayingPosition;
    nextTurn: NextTurn;
  },
  initSplit: InitSplit
) => [
  ...playingPositionToUpdate.nextTurn.playingPositions,
  splitPlayingPosition(playingPositionToUpdate.playingPosition)(initSplit)
];

const nextTurnFor = (bet: number) => (playingPositionToUpdate: { playingPosition: PlayingPosition; nextTurn: NextTurn }) => {
  const [hand1Card, hand2Card, ...cards] = playingPositionToUpdate.nextTurn.cards as [Card, Card, ...Card[]];

  return {
    playingPositions: updatePlayingPosition(playingPositionToUpdate, { hand1Card, hand2Card, bet }),
    cards
  };
};

const toNextTurn =
  (game: BlackJack, bet: number) =>
  (nextTurn: NextTurn, playingPosition: PlayingPosition): NextTurn =>
    isPlaying(game)(playingPosition) ? nextTurnFor(bet)({ playingPosition, nextTurn }) : noChangeFor(playingPosition)(nextTurn);

export const splitDecision =
  (game: BlackJack) =>
  (bet: number): BlackJack => {
    const nextTurn: NextTurn = game.playingPositions.reduce(toNextTurn(game, bet), initNextTurn(game));

    return prepareNextTurn(game)({ ...game, playingPositions: nextTurn.playingPositions }, nextTurn.cards, false);
  };
