// https://en.wikipedia.org/wiki/Blackjack

import {test, expect,describe}   from "vitest";

type PlayingPositionCount = 5 | 6 | 7 | 8 | 9

type DecksCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

const VALUES = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const

type Card = typeof VALUES[number];

type Deck = [...typeof VALUES, ...typeof VALUES, ...typeof VALUES, ...typeof VALUES]

const DECK: Deck = [...VALUES, ...VALUES, ...VALUES, ...VALUES]

type PlayingPosition = {}

type BlackJack = {
    playingPositions: PlayingPosition[]
    cards: Card[]
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

// todo: min bet
// todo: max bet
// todo: add id to playing position
// todo: add player max money
// todo: add Bet function that takes amount and playing position id => returns BlackJack with ready player
// todo: distribute cards for every bets...

describe('blackJack game ', () => {

    test('should create a game between 5 and 9 playingPosition and between 1 and 8 decks 52 cards', () => {
        const game = BlackJack(testShuffler)(5, 2)
        expect(game.playingPositions.length).toBe(5);
        expect(game.cards.length).toBe(104);
    })

    test('should create a game with 1 shuffeled deck', () => {
        const game = BlackJack(testShuffler)(5, 1)
        const expectedDesk: Card[]= [
            'j', 'k', 'q', '5', '3', '5', '5', '6', '4', '10',
            '7', '10', '7', 'k', '4', '7', '7', 'j', '4', 'as', '10', '9', '3', '8',
            'k', 'as', '4', 'j', '9', '2', 'q', '3', '6', 'j', '6', '5', '10', '6',
            'as', 'q', '2', 'q', '8', '2', '9', 'as', '8', '9', 'k', '3', '8', '2',
        ]

        expect(game.cards).toStrictEqual(expectedDesk);
    })
})


const BlackJack = (shuffler: Shuffler) => (playingPositionCount: PlayingPositionCount, decksCount: DecksCount): BlackJack => {
    return {
        playingPositions: new Array(playingPositionCount).fill({}),
        cards: shuffler(new Array(decksCount).fill(DECK).flat())
    }
}
