import { describe, expect, it } from 'vitest';
import { bet, BetRange, deal, gameEnd, isGameFinished, join, leave, Shuffler, start } from '../actions';
import {
  double,
  hit,
  OnlyDoubleWhenNoSplitError,
  OnlySplitEqualCardsError,
  OnlySplitFirstTurnError,
  split,
  stand,
  surrender
} from '../decisions';
import { BlackJack } from './black-jack';
import { Card } from './card';

let seed = 1;

const LOW_SHUFFLER: Shuffler = () => [
  ...(['2', '3', '4', '5', '6', '6', '5', '5', '4', '1', '7', '1', '7'] as Card[]),
  ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const HIGH_SHUFFLER: Shuffler = () => [
  ...(['j', 'k', 'q', '4', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
  ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const SPLIT_SHUFFLER: Shuffler = () => [
  ...(['3', '3', '5', '4', '3', '5', 'q', '5', '6', 'k', '7', '2', '7'] as Card[]),
  ...(['2', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
  ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
  ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
];

const random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const randomShuffler: Shuffler = (cards: Card[]) => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]] as [Card, Card];
  }
  return cards;
};

const readyGameWithTwoPlayers = (shuffler?: Shuffler) => {
  const game = start(shuffler ? shuffler : randomShuffler)({
    decksCount: 1,
    betRange: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
  const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

  const gameWith1Bet = bet(gameWithTwoPlayers)({ position: 0, amount: 50 });
  const gameWith2Bets = bet(gameWith1Bet)({ position: 1, amount: 100 });

  return deal(gameWith2Bets);
};

const readyGameWithFourPlayers = () => {
  const game = start(randomShuffler)({
    decksCount: 1,
    betRange: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
  const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);
  const gameWithThreePlayers = join(gameWithTwoPlayers)({ availableMoney: 600 }, 2);
  const gameWithFourPlayers = join(gameWithThreePlayers)({ availableMoney: 600 }, 3);

  const gameWith1Bet = bet(gameWithFourPlayers)({ position: 0, amount: 50 });
  const gameWith2Bets = bet(gameWith1Bet)({ position: 1, amount: 100 });
  const gameWith3Bets = bet(gameWith2Bets)({ position: 2, amount: 100 });
  const gameWith4Bets = bet(gameWith3Bets)({ position: 3, amount: 50 });

  return deal(gameWith4Bets);
};

describe('blackJack game', () => {
  it('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
    const game = start(randomShuffler)({
      decksCount: 2,
      betRange: BetRange({ min: 5, max: 100 })
    });
    expect(game.playingPositions.length).toBe(0);
    expect(game.cards.length).toBe(104);
    expect(game.betRange.min).toBe(5);
    expect(game.betRange.max).toBe(100);
  });

  it('should create a game with 1 shuffeled deck', () => {
    const game = start(randomShuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });
    const expectedDesk: Card[] = [
      ...(['j', 'k', 'q', '5', '3', '5', '5', '6', '4', '10', '7', '10', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    expect(game.cards).toStrictEqual(expectedDesk);
  });

  it('should join two players', () => {
    const game = start(randomShuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(gameWithTwoPlayers.playingPositions).toStrictEqual([
      { availableMoney: 500, id: 0, hands: [{ bettingBox: 0, cards: [], isDone: false }] },
      { availableMoney: 600, id: 1, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should have 1 betting player', () => {
    const game = start(randomShuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    const gameWith1Bet = bet(gameWithTwoPlayers)({ position: 0, amount: 50 });

    expect(gameWith1Bet.playingPositions).toStrictEqual([
      { availableMoney: 450, id: 0, hands: [{ bettingBox: 50, cards: [], isDone: false }] },
      { availableMoney: 600, id: 1, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should deal cards for every playing position and for the dealer', () => {
    const readyGame = readyGameWithTwoPlayers();

    expect(readyGame).toStrictEqual({
      dealerHand: { cards: ['10'], hiddenCard: ['9'], isDone: false },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: [
        ...['q', '9', 'j', '2', '4', 'q', '6', '4', 'k', 'k', '7', '3'],
        ...['9', '4', '8', 'k', '10', '5', '3', '3', '2', 'ace', '2', '7', '7'],
        ...['2', '8', 'q', '6', 'ace', 'k', '5', 'ace', '9', 'ace', '3', 'j', '5'],
        ...['8', 'q', '4', '10', '7', '8', '6', '10']
      ],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['j', 'j'], isDone: false }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['6', '5'], isDone: false }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    });
  });

  it('should not bet amount less than minimal game bet amount', () => {
    const game = start(randomShuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(() => {
      bet(gameWithTwoPlayers)({ position: 0, amount: 1 });
    }).toThrowError('Player should bet more than 5, 1 received');
  });

  it('should not bet amount more than maximal game bet amount', () => {
    const game = start(randomShuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });

    const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
    const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

    expect(() => {
      bet(gameWithTwoPlayers)({ position: 0, amount: 101 });
    }).toThrowError('Player should bet less than 100, 101 received');
  });

  it('should stand for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = stand(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
  });

  it('should surrender for first player', () => {
    const readyGame = readyGameWithTwoPlayers();

    const played = surrender(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(0);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(475);
  });

  it('should double for first player', () => {
    const shuffler: Shuffler = () => [
      ...(['2', '3', '4', '5', '6', '6', '5', '5', '4', '1', '7', '1', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const firstPlayerPlayed = double(readyGame)();

    expect(firstPlayerPlayed.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(firstPlayerPlayed.playingPositions.at(0)?.hands[0].bettingBox).toBe(100);
    expect(firstPlayerPlayed.playingPositions.at(0)?.availableMoney).toBe(400);
    expect(firstPlayerPlayed.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(firstPlayerPlayed.playingPositions.at(0)?.hands[0].isDone).toStrictEqual(true);
    expect(firstPlayerPlayed.dealerHand.cards).toStrictEqual(['6']);

    expect(firstPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['5', '4', '1']);

    const secondPlayerPlayed = double(firstPlayerPlayed)();
    expect(secondPlayerPlayed.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['4', '5', '5']);
    expect(secondPlayerPlayed.dealerHand.cards).toStrictEqual(['6', '6', '4', '1']);
    expect(secondPlayerPlayed.cards.slice(0, 3)).toStrictEqual(['7', '1', '7']);
  });

  it('should hit for first player', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const played = hit(readyGame)();

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(450);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['2', '3', '5']);
    expect(played.currentPlayingHand).toStrictEqual({ playingPositionId: 1, handIndex: 0 });
  });

  it('should not hit a second time while every player has not played', () => {
    const readyGame = readyGameWithTwoPlayers();

    const playerOnePlayed = hit(readyGame)();
    const playerTwoPlayed = hit(playerOnePlayed)();

    expect(playerTwoPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 0, handIndex: 0 });
  });

  it('should ignore player surrander player with two players', () => {
    const readyGame = readyGameWithTwoPlayers();
    const playerOneSurrender = surrender(readyGame)();
    const playerTwoPlayed = hit(playerOneSurrender)();

    expect(playerTwoPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 1, handIndex: 0 });
  });

  it('should ignore player surrander player with three players', () => {
    const readyGame = readyGameWithFourPlayers();
    const playerOneSurrender = surrender(readyGame)();
    const playerTwoSurrender = surrender(playerOneSurrender)();
    const playerThreeSurrender = surrender(playerTwoSurrender)();
    const playerFourPlayed = hit(playerThreeSurrender)();

    expect(playerFourPlayed.currentPlayingHand).toStrictEqual({ playingPositionId: 3, handIndex: 0 });
  });

  it('should lose after some hits for first player', () => {
    const readyGame = readyGameWithTwoPlayers(HIGH_SHUFFLER);
    const playerOneHit = hit(readyGame)();

    expect(playerOneHit.playingPositions.at(0)?.hands[0].isDone).toBe(true);
    expect(playerOneHit.playingPositions.at(0)?.hands[0].bettingBox).toStrictEqual(0);
  });

  it('should should split for first player', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const played = split(readyGame)(10);

    expect(played.playingPositions.at(0)?.hands[0].isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[1]?.isDone).toBe(false);
    expect(played.playingPositions.at(0)?.hands[0].bettingBox).toBe(50);
    expect(played.playingPositions.at(0)?.hands[1]?.bettingBox).toBe(10);
    expect(played.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', 'q']);
    expect(played.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5']);
    expect(played.playingPositions.at(0)?.availableMoney).toBe(440);
  });

  it('should use next player second hand when first hand is done', () => {
    const shuffler: Shuffler = () => [
      ...(['3', '3', '5', '4', '3', '5', 'q', '5', '6', 'k', '7', '2', '7'] as Card[]),
      ...(['2', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(shuffler);
    const player1SplitTurn1 = split(readyGame)(10);
    const player2HitTurn1 = hit(player1SplitTurn1)();
    const player1HitTurn2Hand1 = hit(player2HitTurn1)();
    const player1HitTurn2Hand2 = hit(player1HitTurn2Hand1)();
    const player2HitTurn2 = hit(player1HitTurn2Hand2)();
    const player1HitTurn3Hand1 = hit(player2HitTurn2)();
    const player1HitTurn3Hand2 = hit(player1HitTurn3Hand1)();
    const player1HitTurn4Hand1 = hit(player1HitTurn3Hand2)();

    expect(player1HitTurn4Hand1.playingPositions.at(0)?.hands).toStrictEqual([
      { isDone: true, bettingBox: 0, cards: ['3', 'q', 'k'] },
      { isDone: true, bettingBox: 0, cards: ['3', '5', '7', '7'] }
    ]);

    expect(player1HitTurn4Hand1.playingPositions.at(1)?.hands).toStrictEqual([
      { isDone: true, bettingBox: 0, cards: ['5', '4', '6', '2', '2', '4'] }
    ]);

    expect(player1HitTurn4Hand1.dealerHand.cards).toStrictEqual(['3', '5', '7', '7']);
    expect(player1HitTurn4Hand1.dealerHand.hiddenCard).toStrictEqual([]);
  });

  it('should continue to play when hand 0 is done but not hand 1', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const gameAfterSplitForPLayer1 = split(readyGame)(10);

    const gameAfterSurrenderForPlayer2 = surrender(gameAfterSplitForPLayer1)();
    const turn1AfterSplit = hit(gameAfterSurrenderForPlayer2)();
    const turn2AfterSplit = hit(turn1AfterSplit)();
    const turn3AfterSplit = hit(turn2AfterSplit)();
    const turn4AfterSplit = hit(turn3AfterSplit)();
    const turn5AfterSplit = hit(turn4AfterSplit)();

    expect(turn5AfterSplit.playingPositions.at(0)?.hands).toStrictEqual([
      { isDone: true, bettingBox: 0, cards: ['3', 'q', '6', '7'] },
      { isDone: true, bettingBox: 0, cards: ['3', '5', 'k', '2', '7'] }
    ]);
  });

  it('should only allow split when cards are equals', () => {
    const readyGame = readyGameWithTwoPlayers(HIGH_SHUFFLER);

    expect(() => {
      split(readyGame)(10);
    }).toThrowError(new OnlySplitEqualCardsError('j', 'k'));
  });

  it('should only allow split on first player turn', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const playerOnePlayed = hit(readyGame)();
    const playerTwoPlayed = surrender(playerOnePlayed)();

    expect(() => {
      split(playerTwoPlayed)(10);
    }).toThrowError(new OnlySplitFirstTurnError());
  });

  it('should manage player with two hands for split decision', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = split(readyGame)(10);
    const playerTwoPlayed = hit(playerOneSplit)();
    const playerOneHitForHand1 = hit(playerTwoPlayed)();
    const playerOneHitForHand2 = hit(playerOneHitForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', 'q', 'k']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', '7']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should not switch to next ready player when next player second hand is not done', () => {
    const shuffler = () => [
      ...(['10', '10', '2', '2', '3', 'k', '2', '3', '3', '10', '7', '4', 'ace'] as Card[]),
      ...(['ace', '8', '5', '6', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(shuffler);
    const playerOneSplit = split(readyGame)(10);
    const playerTwoSplit = split(playerOneSplit)(10);
    const playerOneHitForHand1Turn1 = hit(playerTwoSplit)();
    const playerOneHitForHand2Turn1 = hit(playerOneHitForHand1Turn1)();
    const playerTwoHitForHand1Turn1 = hit(playerOneHitForHand2Turn1)();
    const playerTwoHitForHand2Turn1 = hit(playerTwoHitForHand1Turn1)();
    const playerOneHitForHand1Turn2 = hit(playerTwoHitForHand2Turn1)();

    expect(playerOneHitForHand1Turn2.playingPositions.at(0)?.hands[0]?.cards).toStrictEqual(['10', '2', '7', '8']);
    expect(playerOneHitForHand1Turn2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['10', '3', '4']);
  });

  it('should forbid double after a split', () => {
    const readyGame = readyGameWithTwoPlayers(SPLIT_SHUFFLER);
    const playerOneSplit = split(readyGame)(10);
    const playerTwoPlayed = hit(playerOneSplit)();

    expect(() => {
      double(playerTwoPlayed)();
    }).toThrowError(new OnlyDoubleWhenNoSplitError());
  });

  it('should manage player with two hands for stand decision', () => {
    const shuffler: Shuffler = () => [
      ...(['3', '3', '5', '4', '3', '5', 'q', '5', '6', 'k', '7', '2', '7'] as Card[]),
      ...(['2', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(shuffler);
    const playerOneSplit = split(readyGame)(10);
    const playerTwoPlayed = hit(playerOneSplit)();
    const playerOneStandForHand1 = stand(playerTwoPlayed)();
    const playerOneHitForHand2 = hit(playerOneStandForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', 'q']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', 'k']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should manage player with two hands for surrender decision', () => {
    const splitShuffler: Shuffler = () => [
      ...(['3', '3', '5', '4', '3', '5', 'q', '5', '6', 'k', '7', '2', '7'] as Card[]),
      ...(['2', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(splitShuffler);
    const playerOneSplit = split(readyGame)(10);
    const playerTwoPlayed = hit(playerOneSplit)();
    const playerOneSurrenderForHand1 = surrender(playerTwoPlayed)();
    const playerOneHitForHand2 = hit(playerOneSurrenderForHand1)();

    expect(playerOneHitForHand2.playingPositions.at(0)?.availableMoney).toStrictEqual(465);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].cards).toStrictEqual(['3', 'q']);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].isDone).toStrictEqual(true);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[0].bettingBox).toStrictEqual(0);
    expect(playerOneHitForHand2.playingPositions.at(0)?.hands[1]?.cards).toStrictEqual(['3', '5', 'k']);
    expect(playerOneHitForHand2.playingPositions.at(1)?.hands[0].cards).toStrictEqual(['5', '4', '6']);
  });

  it('should manage dealer next cards', () => {
    const lowShuffler: Shuffler = () => [
      ...(['2', '3', '4', '5', '6', '6', '5', '5', '4', '1', '7', '1', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(lowShuffler);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();

    expect(turnOnePlayerTwo.dealerHand).toStrictEqual({
      cards: ['6'],
      hiddenCard: ['6'],
      isDone: false
    });
    expect(turnOnePlayerTwo.cards.at(0)).toBe('4');
  });

  it('should update player cards on lose', () => {
    const lowShuffler: Shuffler = () => [
      ...(['2', '3', '4', '5', '6', '6', '5', '5', '4', 'k', '7', '1', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(lowShuffler);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();

    expect(turnTwoPlayerTwo.playingPositions.at(1)?.hands.at(0)?.cards).toStrictEqual(['4', '5', '5', 'k']);
    expect(turnTwoPlayerTwo.playingPositions.at(1)?.hands.at(0)?.isDone).toStrictEqual(true);
  });

  it('should manage dealer next cards until reach dealer hand limit', () => {
    const shuffler: Shuffler = () => [
      ...(['2', '3', '4', '5', '6', '6', '5', '5', '4', '1', '7', '1', '7'] as Card[]),
      ...(['k', '4', '7', '7', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'] as Card[]),
      ...(['4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6', 'ace'] as Card[]),
      ...(['q', '2', 'q', '8', '2', '9', 'ace', '8', '9', 'k', '3', '8', '2'] as Card[])
    ];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();
    const turnFourPlayerOne = hit(turnThreePlayerTwo)();
    const turnFourPlayerTwo = hit(turnFourPlayerOne)();

    expect(turnFourPlayerTwo.playingPositions.at(0)?.hands.at(0)?.cards).toStrictEqual(['2', '3', '5', '4', '7', '7']);
    expect(turnFourPlayerTwo.playingPositions.at(0)?.hands.at(0)?.isDone).toStrictEqual(true);

    expect(turnFourPlayerTwo.playingPositions.at(1)?.hands.at(0)?.cards).toStrictEqual(['4', '5', '5', '1', '1', 'k']);
    expect(turnFourPlayerTwo.playingPositions.at(1)?.hands.at(0)?.isDone).toStrictEqual(true);

    expect(turnFourPlayerTwo.dealerHand.cards).toStrictEqual(['6', '6', '4', '7']);
    expect(turnFourPlayerTwo.dealerHand.isDone).toBe(true);
  });

  it('should not detect a finished game', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const isFinished = isGameFinished(readyGame);

    expect(isFinished).toBe(false);
  });

  it('should not detect a finished game when all player are not done', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();

    const isFinished = isGameFinished(turnThreePlayerTwo);

    expect(isFinished).toBe(false);
  });

  it('should detect a finished game with dealer done', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();
    const turnFourPlayerOne = hit(turnThreePlayerTwo)();
    const turnFivePlayerOne = hit(turnFourPlayerOne)();

    const isFinished = isGameFinished(turnFivePlayerOne);

    expect(isFinished).toBe(true);
  });

  it('should create a new game with same players when all losers', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();
    const turnFourPlayerOne = hit(turnThreePlayerTwo)();
    const turnFivePlayerOne = hit(turnFourPlayerOne)();
    const turnSixPlayerOne = hit(turnFivePlayerOne)();
    const turnSevenPlayerOne = hit(turnSixPlayerOne)();

    const nextGame = gameEnd(turnSevenPlayerOne);

    expect(nextGame).toStrictEqual({
      dealerHand: { cards: [], hiddenCard: [], isDone: false },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: expect.arrayContaining(['10', '9', '3', '8', 'k', 'ace', '4', 'j', '9', '2', 'q']),
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 0, cards: [], isDone: false }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    });
  });

  it('should return player bet when player score is equal to dealer score', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['k', 'k'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'j'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(500);
    expect(nextGame.playingPositions.at(1)?.availableMoney).toBe(500);
  });

  it('should return player bet with gain when player score is better than dealer score', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['ace', 'k'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(550);
    expect(nextGame.playingPositions.at(1)?.availableMoney).toBe(500);
  });

  it('should lose player bet when player score is higher than 21', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'k', 'j'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(450);
  });

  it('should win with low score and dealer bust', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8', '4'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'k'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions.at(0)?.availableMoney).toBe(550);
  });

  it('should remove player without money from ext game', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8', '4'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 0, hands: [{ bettingBox: 50, cards: ['10', 'k', 'j'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    expect(nextGame.playingPositions).toStrictEqual([
      { id: 1, availableMoney: 700, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should be able to quit the game when game has not started', () => {
    const gameToTest: BlackJack = {
      dealerHand: { cards: ['10', '8', '4'], hiddenCard: [], isDone: true },
      betRange: BetRange({ min: 5, max: 100 }),
      cards: ['10', 'j', '4', 'ace', '10', '9', '3', '8', 'k', 'ace'],
      playingPositions: [
        { id: 0, availableMoney: 450, hands: [{ bettingBox: 50, cards: ['10', 'k'], isDone: true }] },
        { id: 1, availableMoney: 500, hands: [{ bettingBox: 100, cards: ['4', 'ace'], isDone: true }] }
      ],
      currentPlayingHand: { playingPositionId: 0, handIndex: 0 }
    };

    const nextGame = gameEnd(gameToTest);

    const nextGameWithoutPlayer1 = leave(nextGame)(0);

    expect(nextGameWithoutPlayer1.playingPositions).toStrictEqual([
      { id: 1, availableMoney: 700, hands: [{ bettingBox: 0, cards: [], isDone: false }] }
    ]);
  });

  it('should not be possible to leave a started game', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();

    expect(() => {
      leave(turnThreePlayerTwo)(0);
    }).toThrowError('Cannot leave a started game');
  });

  it('should not be possible to end a game that is not finished', () => {
    const readyGame = readyGameWithTwoPlayers(LOW_SHUFFLER);

    const turnOnePlayerOne = hit(readyGame)();
    const turnOnePlayerTwo = hit(turnOnePlayerOne)();
    const turnTwoPlayerOne = hit(turnOnePlayerTwo)();
    const turnTwoPlayerTwo = hit(turnTwoPlayerOne)();
    const turnThreePlayerOne = hit(turnTwoPlayerTwo)();
    const turnThreePlayerTwo = hit(turnThreePlayerOne)();

    expect(() => {
      gameEnd(turnThreePlayerTwo);
    }).toThrowError('Game is not finished yet');
  });
});

// Comment jouer au blackjack
// 1. Les joueurs placent leurs mises
// 2. Le croupier distribue les cartes : une carte visible et une carte face cachée pour lui, une carte face visible pour chaque joueur
// 3. Les joueurs décident de leur action : rester, tirer, doubler, partager, abandonner
// 4. Le croupier révèle sa carte cachée et joue sa main jusqu'à ce qu'il atteigne 17 ou plus
// 5. Les gains sont distribués
// 6. Les joueurs peuvent quitter la table
// 7. Retour à l'étape 1

// todo: fix dealer turn
//  simulate and check cases => dealer should reveal hidden card when all players are done, then play until 17
