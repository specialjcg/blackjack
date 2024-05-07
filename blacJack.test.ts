// https://en.wikipedia.org/wiki/Blackjack

import {test, expect,describe}   from "vitest";

type PlayingPositionCount = 5 | 6 | 7 | 8 | 9

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

const VALUES = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const

type Card = typeof VALUES[number];

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES]

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES]

type PlayingPosition = {
    availableMoney: number
} | {}

type Model<TName extends string, TValues> = TValues & { [modelKey in `is${Capitalize<TName>}`]: true };

type Bet = Model<'Bet', { min: number, max: number }>;

const throwBetError = (bet: Omit<Bet, 'isBet'>): Bet => {
    throw new Error(`Bet with value min: ${bet.min} and max: ${bet.max} is invalid`);
};

const isValiBet = (bet: Omit<Bet, 'isBet'>): bet is Bet => bet.min >= 0 && bet.max > bet.min;

const Bet = (bet: Omit<Bet, 'isBet'>): Bet => (isValiBet(bet) ? bet : throwBetError(bet))


type BlackJackConfiguration = {
    playingPositionCount: PlayingPositionCount,
    decksCount: DecksCount,
    bet: Bet
}

type BlackJack = {
    playingPositions: PlayingPosition[],
    cards: Card[],
    bet: Bet
}

type Shuffler = (cards: Card[]) => Card[]


let seed = 1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

const testShuffler: Shuffler = (cards: Card[]) => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

const invite = (player: PlayingPosition) => (game: BlackJack): BlackJack => {
    const availableIndex: number | null = game.playingPositions.findIndex((playingPosition: PlayingPosition) => !playingPosition.hasOwnProperty('availableMoney'));
    
    if (availableIndex == null) throw new Error('There is no more available playing position');

    const playingPositions = [...game.playingPositions];
    playingPositions[availableIndex] = player
    
    return ({
        ...game,
        playingPositions
    })
}

// todo: min bet
// todo: max bet
// todo: add player max money
// todo: add id to playing position ????
// todo: add Bet function that takes amount and playing position id => returns BlackJack with ready player
// todo: distribute cards for every bets...

describe('blackJack game ', () => {

    test('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
        const game = BlackJack(testShuffler)({
            playingPositionCount: 5,
            decksCount: 2,
            bet: Bet({min: 5, max: 100})
        })
        expect(game.playingPositions.length).toBe(5);
        expect(game.cards.length).toBe(104);
        expect(game.bet.min).toBe(5);
        expect(game.bet.max).toBe(100);
    })

    test('should create a game with 1 shuffeled deck', () => {
        const game = BlackJack(testShuffler)({
            playingPositionCount: 5,
            decksCount: 1,
            bet: Bet({min: 5, max: 100})
        })
        const expectedDesk: Card[]= [
            'j', 'k', 'q', '5', '3', '5', '5', '6', '4', '10',
            '7', '10', '7', 'k', '4', '7', '7', 'j', '4', 'as', '10', '9', '3', '8',
            'k', 'as', '4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6',
            'as', 'q', '2', 'q', '8', '2', '9', 'as', '8', '9', 'k', '3', '8', '2',
        ]

        expect(game.cards).toStrictEqual(expectedDesk);
    })

    test('should invite two players', () => {
        const game = BlackJack(testShuffler)({
            playingPositionCount: 5,
            decksCount: 1,
            bet: Bet({min: 5, max: 100})
        })

        const gameWithOnePlayer = invite({availableMoney: 500})(game)
        const gameWithTwoPlayers = invite({availableMoney: 600})(gameWithOnePlayer)

        expect(gameWithTwoPlayers.playingPositions).toStrictEqual([
            {availableMoney: 500},
            {availableMoney: 600},
            {},
            {},
            {},
        ])
    })
})


const BlackJack = (shuffler: Shuffler) => (blackJackConfiguration: BlackJackConfiguration): BlackJack => {
    return {
        playingPositions: new Array(blackJackConfiguration.playingPositionCount).fill({}),
        cards: shuffler(new Array(blackJackConfiguration.decksCount).fill(DECK).flat()),
        bet: blackJackConfiguration.bet
    }
}
