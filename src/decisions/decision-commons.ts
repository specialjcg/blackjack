import { BlackJack, Card, PlayingHand, PlayingPosition, PlayingPositionId } from '../black-jack';
import { Hand, handIsDone, Hands } from '../player-hands';

export type NextTurn = {
  playingPositions: PlayingPosition[];
  cards: Card[];
};

const PICTURES = ['10', 'j', 'q', 'k'];

const PICTURE_VALUE = 10;

const DEFAULT_HAND_INDEX = 0 as const;

const LOW_ACE_VALUE = 1 as const;

const HIGH_ACE_VALUE = 11 as const;

const BEST_SCORE = 21 as const;

const DEALER_LIMIT_HAND_VALUE = 17;

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = DEFAULT_HAND_INDEX): PlayingPositionId =>
    ((game.currentPlayingHand.playingPositionId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const allPlayersIn = ({ playingPositions: { length: numberOfPlayers } }: BlackJack): PlayingPositionId[] =>
  Array.from({ length: numberOfPlayers });

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, nextReadyPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.hands.every(handIsDone) ? nextReadyPlayerId : nextPlayerId;

const betterAceValueFor = (handValue: number): number =>
  handValue + HIGH_ACE_VALUE > BEST_SCORE ? LOW_ACE_VALUE : HIGH_ACE_VALUE;

const valueOf = (card: string) => (PICTURES.includes(card) ? PICTURE_VALUE : +card);

const cardValue = (card: Card, handValue: number) => (card === 'ace' ? betterAceValueFor(handValue) : valueOf(card));

const toHandValue = (handValue: number, card: Card) => handValue + cardValue(card, handValue);

export const nextPlayerId = (game: BlackJack) =>
  allPlayersIn(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(DEFAULT_HAND_INDEX));

const byAceAtTheEnd = (a: Card) => (a === 'ace' ? 1 : -1);

const handValueWithMultipleAces = (hand: Card[], numberOfAces: number) => {
  const handValueWithoutAces = hand.filter((card) => card !== 'ace').reduce(toHandValue, 0);
  return handValueWithoutAces + numberOfAces + (HIGH_ACE_VALUE - 1) <= BEST_SCORE
    ? handValueWithoutAces + numberOfAces + (HIGH_ACE_VALUE - 1)
    : handValueWithoutAces + numberOfAces;
};

export const computeHandValue = (hand: Card[]) => {
  const numberOfAces = hand.filter((card) => card === 'ace').length;
  return numberOfAces > 1
    ? handValueWithMultipleAces(hand, numberOfAces)
    : [...hand].sort(byAceAtTheEnd).reduce(toHandValue, DEFAULT_HAND_INDEX);
};

export const isHigherValue =
  (cards: Card[]) =>
  (dealerCards: Card[]): boolean =>
    computeHandValue(cards) > computeHandValue(dealerCards);

export const exceeding21 = (hand: Card[]) => computeHandValue(hand) > BEST_SCORE;

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

const availablePlayerNextHand = (gameUpdate: BlackJack) => (curentPlayingPosition?: PlayingPosition) =>
  (curentPlayingPosition?.hands.length ?? DEFAULT_HAND_INDEX) > 1 &&
  gameUpdate.currentPlayingHand.handIndex === DEFAULT_HAND_INDEX;

const nextHand = (game: BlackJack): PlayingHand => ({
  playingPositionId: game.currentPlayingHand.playingPositionId,
  handIndex: 1
});

const nextPLayer = (game: BlackJack): PlayingHand => {
  const playingPositionId = nextPlayerId(game);

  return {
    playingPositionId,
    handIndex: game.playingPositions[playingPositionId]?.hands.at(DEFAULT_HAND_INDEX)?.isDone ? 1 : 0
  };
};

export const curentPlayingPosition = (game: BlackJack) => (playingPosition: PlayingPosition) =>
  playingPosition.id === game.currentPlayingHand.playingPositionId;

const curentPlayingPositionFor = (game: BlackJack): PlayingPosition | undefined =>
  game.playingPositions.find(curentPlayingPosition(game));

const nextHandOrPlayer = (game: BlackJack) =>
  availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPLayer(game);

export const nextPlayingHand =
  (game: BlackJack) =>
  (hasMultipleHands: boolean): PlayingHand =>
    hasMultipleHands ? nextHandOrPlayer(game) : nextPLayer(game);

const isDealerTurn = (game: BlackJack) => (playingHand: PlayingHand) =>
  playingHand.playingPositionId < game.currentPlayingHand.playingPositionId;

const dealerHandReachedLimitHandValue = ({ dealerHand }: BlackJack) =>
  computeHandValue(dealerHand.cards) >= DEALER_LIMIT_HAND_VALUE;

const nextPlayerTurn =
  (game: BlackJack) =>
  (cards: Card[], currentPlayingHand: PlayingHand): BlackJack => ({
    ...game,
    currentPlayingHand,
    cards
  });

const nextDealerHand = (game: BlackJack) => (dealerCard: Card, isDone: boolean) => ({
  isDone,
  cards: isDone ? game.dealerHand.cards : [...game.dealerHand.cards, ...(dealerCard ? [dealerCard] : [])]
});

const nextDealerTurn =
  (game: BlackJack) =>
  ([dealerCard, ...cards]: Card[], currentPlayingHand: PlayingHand) => ({
    ...game,
    dealerHand: nextDealerHand(game)(dealerCard as Card, dealerHandReachedLimitHandValue(game)),
    currentPlayingHand,
    cards
  });

export const prepareNextTurn =
  (game: BlackJack) =>
  (nextGame: BlackJack, cards: Card[], hasMultipleHands: boolean): BlackJack => {
    const playingHand: PlayingHand = nextPlayingHand(game)(hasMultipleHands);

    return (isDealerTurn(game)(playingHand) && !game.dealerHand.isDone ? nextDealerTurn(nextGame) : nextPlayerTurn(nextGame))(
      cards,
      playingHand
    );
  };

export const noChangeFor = (playingPosition: PlayingPosition) => (nextTurn: NextTurn) => ({
  playingPositions: [...nextTurn.playingPositions, playingPosition],
  cards: nextTurn.cards
});

export const isPlaying =
  ({ currentPlayingHand: { playingPositionId } }: BlackJack) =>
  (playingPosition: PlayingPosition) =>
    playingPositionId === playingPosition.id;

export const initNextTurn = (game: BlackJack) => ({
  playingPositions: [],
  cards: game.cards
});

export const addNextCard = (game: BlackJack) => (playingPosition: PlayingPosition, nextCard: Card) => [
  ...(playingPosition.hands[game.currentPlayingHand.handIndex]?.cards ?? playingPosition.hands[DEFAULT_HAND_INDEX].cards),
  nextCard as Card
];
