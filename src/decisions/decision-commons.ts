import { BlackJack, Card, PlayingHand, PlayingPosition, PlayingPositionId } from '../black-jack';

const PICTURES = ['10', 'j', 'q', 'k'];

const PICTURE_VALUE = 10;

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = 0): PlayingPositionId =>
    ((game.currentPlayingHand.playingPositionId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const nextPlayerIds = ({ playingPositions: { length } }: BlackJack): PlayingPositionId[] => Array.from({ length });

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, currentPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.hands[0].isDone ? currentPlayerId : nextPlayerId;

// todo: refactor this
const cardValue = (card: Card, handValue: number) => {
  if (card === 'ace') {
    if (handValue + 11 > 21) return 1;
    else return 11;
  }

  return PICTURES.includes(card) ? PICTURE_VALUE : +card;
};

const toHandValue = (handValue: number, card: Card) => handValue + cardValue(card, handValue);

export const nextPlayerId = (game: BlackJack) =>
  nextPlayerIds(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(0));

const byAceAtTheEnd = (a: Card) => (a === 'ace' ? 1 : -1);

const handValueWithMultipleAces = (hand: Card[], numberOfAces: number) => {
  const handValueWithoutAces = hand.filter((card) => card !== 'ace').reduce(toHandValue, 0);
  return handValueWithoutAces + numberOfAces + 10 <= 21
    ? handValueWithoutAces + numberOfAces + 10
    : handValueWithoutAces + numberOfAces;
};

export const computeHandValue = (hand: Card[]) => {
  const numberOfAces = hand.filter((card) => card === 'ace').length;
  return numberOfAces > 1
    ? handValueWithMultipleAces(hand, numberOfAces)
    : [...hand].sort(byAceAtTheEnd).reduce(toHandValue, 0);
};

export const isHigherValue =
  (cards: Card[]) =>
  (dealerCards: Card[]): boolean =>
    computeHandValue(cards) > computeHandValue(dealerCards);

export const exceeding21 = (hand: Card[]) => computeHandValue(hand) > 21;

export const losePlayingPosition = (playingPosition: PlayingPosition, cards: Card[]): PlayingPosition => ({
  ...playingPosition,
  hands: [
    {
      ...{ ...playingPosition.hands[0], cards }, // todo: second hand
      isDone: true,
      bettingBox: 0
    }
  ]
});

const availablePlayerNextHand = (gameUpdate: BlackJack) => (curentPlayingPosition?: PlayingPosition) =>
  (curentPlayingPosition?.hands.length ?? 0) > 1 && gameUpdate.currentPlayingHand.handIndex === 0;

const nextHand = (game: BlackJack): PlayingHand => ({
  playingPositionId: game.currentPlayingHand.playingPositionId,
  handIndex: 1
});

const nextPLayer = (game: BlackJack): PlayingHand => ({
  playingPositionId: nextPlayerId(game),
  handIndex: 0
});

export const curentPlayingPosition = (game: BlackJack) => (playingPosition: PlayingPosition) =>
  playingPosition.id === game.currentPlayingHand.playingPositionId;

const curentPlayingPositionFor = (game: BlackJack) => game.playingPositions.find(curentPlayingPosition(game));

const nextHandOrPlayer = (game: BlackJack) =>
  availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPLayer(game);

export const nextPlayingHand =
  (game: BlackJack) =>
  (hasMultipleHands: boolean): PlayingHand =>
    hasMultipleHands ? nextHandOrPlayer(game) : nextPLayer(game);

const isDealerTurn = (game: BlackJack) => (playingHand: PlayingHand) =>
  playingHand.playingPositionId < game.currentPlayingHand.playingPositionId;

const DEALER_LIMIT_HAND_VALUE = 17;

const dealerHandReachedLimitHandValue = ({ dealerHand }: BlackJack) =>
  computeHandValue(dealerHand.cards) >= DEALER_LIMIT_HAND_VALUE;

const nextPlayerTurn = (game: BlackJack) => (cards: Card[], currentPlayingHand: PlayingHand) => ({
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
