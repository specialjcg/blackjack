import { BlackJack, Hand, PlayingHand, PlayingPosition, PlayingPositionId, STARTING_HAND_INDEX } from '../../core';

const availablePlayerNextHand = (gameUpdate: BlackJack) => (curentPlayingPosition?: PlayingPosition) =>
  (curentPlayingPosition?.hands.length ?? STARTING_HAND_INDEX) > 1 &&
  gameUpdate.currentPlayingHand.handIndex === STARTING_HAND_INDEX;

const nextHand = (game: BlackJack): PlayingHand => ({
  playingPositionId: game.currentPlayingHand.playingPositionId,
  handIndex: 1
});

const toNextPlayerId =
  (game: BlackJack) =>
  (_: number, playerIndex: number = STARTING_HAND_INDEX): PlayingPositionId =>
    ((game.currentPlayingHand.playingPositionId + playerIndex + 1) % game.playingPositions.length) as PlayingPositionId;

const allPlayersIn = ({ playingPositions: { length: numberOfPlayers } }: BlackJack): PlayingPositionId[] =>
  Array.from({ length: numberOfPlayers });

const handIsDone = ({ isDone }: Hand) => isDone;

const toNextReadyPlayer =
  (game: BlackJack) =>
  (nextPlayerId: PlayingPositionId, nextReadyPlayerId: PlayingPositionId): PlayingPositionId =>
    game.playingPositions[nextPlayerId]?.hands.every(handIsDone) ? nextReadyPlayerId : nextPlayerId;

const nextPlayerId = (game: BlackJack) =>
  allPlayersIn(game).map(toNextPlayerId(game)).reduce(toNextReadyPlayer(game), toNextPlayerId(game)(STARTING_HAND_INDEX));

const nextPlayer = (game: BlackJack): PlayingHand => {
  const playingPositionId = nextPlayerId(game);

  return {
    playingPositionId,
    handIndex: game.playingPositions[playingPositionId]?.hands.at(STARTING_HAND_INDEX)?.isDone ? 1 : 0
  };
};

const curentPlayingPosition = (game: BlackJack) => (playingPosition: PlayingPosition) =>
  playingPosition.id === game.currentPlayingHand.playingPositionId;

const curentPlayingPositionFor = (game: BlackJack): PlayingPosition | undefined =>
  game.playingPositions.find(curentPlayingPosition(game));

const nextHandOrPlayer = (game: BlackJack) =>
  availablePlayerNextHand(game)(curentPlayingPositionFor(game)) ? nextHand(game) : nextPlayer(game);

export const nextPlayingHand =
  (game: BlackJack) =>
  (hasMultipleHands: boolean): PlayingHand =>
    hasMultipleHands ? nextHandOrPlayer(game) : nextPlayer(game);
