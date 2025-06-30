import { BlackJack, Card, exceeding21, Hand, Hands, isPlaying, PlayingPosition } from '../core';
import { losePlayingPosition } from './lose-playing-position';
import { addNextCard, initNextTurn, NextTurn, noChangeFor, prepareNextTurn } from './turn';

const toUpdateHitHandsCards =
  (handIndex: number, cards: Card[]) =>
  (hand: Hand, index: number): Hand =>
    index === handIndex ? { ...hand, cards } : hand;

const hitPlayingPosition =
  (playingPosition: PlayingPosition) =>
  (cards: Card[], handIndex: number): PlayingPosition => ({
    ...playingPosition,
    hands: playingPosition.hands.map(toUpdateHitHandsCards(handIndex, cards)) as Hands
  });

const updatePlayingPositions =
  (game: BlackJack) =>
  (nextCard: Card, { playingPosition, nextTurn }: { playingPosition: PlayingPosition; nextTurn: NextTurn }) => {
    const handCards: Card[] = addNextCard(game)(playingPosition, nextCard);

    return [
      ...nextTurn.playingPositions,
      exceeding21(handCards)
        ? losePlayingPosition(playingPosition)(handCards, game.currentPlayingHand.handIndex)
        : hitPlayingPosition(playingPosition)(handCards, game.currentPlayingHand.handIndex)
    ];
  };

const nextTurnFor =
  (game: BlackJack) => (playingPositionToUpdate: { playingPosition: PlayingPosition; nextTurn: NextTurn }) => {
    const [nextCard, ...cards] = playingPositionToUpdate.nextTurn.cards as [Card, ...Card[]];

    return {
      playingPositions: updatePlayingPositions(game)(nextCard, playingPositionToUpdate),
      cards
    };
  };

const toNextTurn =
  (game: BlackJack) =>
  (nextTurn: NextTurn, playingPosition: PlayingPosition): NextTurn =>
    isPlaying(game)(playingPosition)
      ? nextTurnFor(game)({ playingPosition, nextTurn })
      : noChangeFor(playingPosition)(nextTurn);

export const hit = (game: BlackJack) => (): BlackJack => {
  const nextTurn: NextTurn = game.playingPositions.reduce(toNextTurn(game), initNextTurn(game));

  return prepareNextTurn(game)({ ...game, playingPositions: nextTurn.playingPositions }, nextTurn.cards, true);
};
