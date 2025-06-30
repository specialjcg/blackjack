import { describe, it, expect } from 'vitest';
import { bet, BetRange, deal, join, Shuffler, start } from '../../actions';
import { Card } from '../../core';
import { double, hit, split, stand, surrender } from '../../decisions';
import { basicStrategy } from './basic-strategy';

const readyGameWithTwoPlayers = (shuffler: Shuffler) => {
  const game = start(shuffler)({
    decksCount: 1,
    betRange: BetRange({ min: 5, max: 100 })
  });

  const gameWithOnePlayer = join(game)({ availableMoney: 500 }, 0);
  const gameWithTwoPlayers = join(gameWithOnePlayer)({ availableMoney: 600 }, 1);

  const gameWith1Bet = bet(gameWithTwoPlayers)({ position: 0, amount: 50 });
  const gameWith2Bets = bet(gameWith1Bet)({ position: 1, amount: 100 });

  return deal(gameWith2Bets);
};

describe('basic strategy', () => {
  it('should throw error when game is not ready', () => {
    const shuffler: Shuffler = () => [...([] as Card[])];

    const game = start(shuffler)({
      decksCount: 1,
      betRange: BetRange({ min: 5, max: 100 })
    });

    expect(() => basicStrategy(game)).toThrowError('Game is not ready');
  });

  it('should stand for hand value 18-21 and every dealer card', () => {
    const shuffler: Shuffler = () => [...(['8', '10', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(stand);
  });

  it('should surrender for hand value 17 and ace dealer card', () => {
    const shuffler: Shuffler = () => [...(['7', '10', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should stand for hand value 16 and dealer card between 2 and 6', () => {
    const shuffler: Shuffler = () => [...(['7', '9', '4', '5', '4', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(stand);
  });

  it('should hit for hand value 16 and dealer card is 7', () => {
    const shuffler: Shuffler = () => [...(['7', '9', '4', '5', '7', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should hit for hand value 16 and dealer card is 8', () => {
    const shuffler: Shuffler = () => [...(['7', '9', '4', '5', '8', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should surrender for hand value 16 dealer card is 9', () => {
    const shuffler: Shuffler = () => [...(['7', '9', '4', '5', '9', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should surrender for hand value 16 dealer card is 10', () => {
    const shuffler: Shuffler = () => [...(['7', '9', '4', '5', '10', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should surrender for hand value 16 dealer card is ace', () => {
    const shuffler: Shuffler = () => [...(['8', '8', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should hit for hand value 15 dealer card is 7', () => {
    const shuffler: Shuffler = () => [...(['8', '7', '4', '5', '7', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should hit for hand value 15 dealer card is 9', () => {
    const shuffler: Shuffler = () => [...(['8', '7', '4', '5', '9', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should surrender for hand value 15 dealer card is 10', () => {
    const shuffler: Shuffler = () => [...(['8', '7', '4', '5', '10', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should surrender for hand value 15 dealer card is ace', () => {
    const shuffler: Shuffler = () => [...(['8', '7', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(surrender);
  });

  it('should hit for hand value 14 and dealer card is 3', () => {
    const shuffler: Shuffler = () => [...(['6', '8', '4', '5', '7', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should hit for hand value 14 and dealer card is ace', () => {
    const shuffler: Shuffler = () => [...(['7', '7', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should hit for hand value 13 and dealer card is 3', () => {
    const shuffler: Shuffler = () => [...(['7', '6', '4', '5', '7', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should hit for hand value 13 and dealer card is ace', () => {
    const shuffler: Shuffler = () => [...(['7', '6', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should double for hand value 11 and dealer card is 6', () => {
    const shuffler: Shuffler = () => [...(['5', '6', '4', '5', '6', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(double);
  });

  it('should stand for hand cards ace,8 and dealer card is 4', () => {
    const shuffler: Shuffler = () => [...(['ace', '8', '4', '5', '4', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(stand);
  });

  it('should double for hand cards 8,ace and dealer card is 6', () => {
    const shuffler: Shuffler = () => [...(['8', 'ace', '4', '5', '6', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(double);
  });

  it('should double for hand cards ace,8 and dealer card is 6', () => {
    const shuffler: Shuffler = () => [...(['ace', '8', '4', '5', '6', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(double);
  });

  it('should split for hand cards ace,ace and dealer card is 6', () => {
    const shuffler: Shuffler = () => [...(['ace', 'ace', '4', '5', '6', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should split for hand cards 9,9 and dealer card is 4', () => {
    const shuffler: Shuffler = () => [...(['9', '9', '4', '5', '4', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 9,9 and dealer card is 8', () => {
    const shuffler: Shuffler = () => [...(['9', '9', '4', '5', '8', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 8,8 and dealer card is 10', () => {
    const shuffler: Shuffler = () => [...(['8', '8', '4', '5', '10', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 7,7 and dealer card is 7', () => {
    const shuffler: Shuffler = () => [...(['7', '7', '4', '5', '7', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 6,6 and dealer card is 6', () => {
    const shuffler: Shuffler = () => [...(['6', '6', '4', '5', '6', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 5,5 and dealer card is 9', () => {
    const shuffler: Shuffler = () => [...(['5', '5', '4', '5', '9', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(double);
  });

  it('should stand for hand cards 5,5 and dealer card is 10', () => {
    const shuffler: Shuffler = () => [...(['5', '5', '4', '5', '10', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });

  it('should stand for hand cards 4,4 and dealer card is 5', () => {
    const shuffler: Shuffler = () => [...(['4', '4', '4', '5', '5', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 3,3 and dealer card is 2', () => {
    const shuffler: Shuffler = () => [...(['3', '3', '4', '5', '2', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 2,2 and dealer card is 2', () => {
    const shuffler: Shuffler = () => [...(['2', '2', '4', '5', '2', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(split);
  });

  it('should stand for hand cards 2,2 and dealer card is ace', () => {
    const shuffler: Shuffler = () => [...(['2', '2', '4', '5', 'ace', '3'] as Card[])];

    const readyGame = readyGameWithTwoPlayers(shuffler);

    const decision = basicStrategy(readyGame);

    expect(decision).toBe(hit);
  });
});
