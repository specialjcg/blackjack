import { BlackJack, Card, computeHandValue } from '../../core';
import { double, hit, split, stand, surrender } from '../../decisions';
import { doubleScenarios, hitScenarios, Scenario, splitScenarios, surrenderScenarios } from './scenario';

const scenarios = [
  { list: splitScenarios, action: split },
  { list: doubleScenarios, action: double },
  { list: hitScenarios, action: hit },
  { list: surrenderScenarios, action: surrender }
];

const currentHand = (game: BlackJack): Card[] | undefined =>
  game.playingPositions[game.currentPlayingHand.playingPositionId]?.hands[game.currentPlayingHand.handIndex]?.cards;

const inDealerBound = (dealerCard: Card[], scenario: Scenario) =>
  computeHandValue(dealerCard) >= scenario.dealerHandValueFloor && computeHandValue(dealerCard) <= scenario.dealerHandValueCeil;

const matchScenarioPlayerHandValue = (scenario: Scenario) => (playerHand: Card[], dealerCard: Card[]) =>
  computeHandValue(playerHand) === scenario.playerHandValue && inDealerBound(dealerCard, scenario);

const isMatchingHand = ([playerCard1, playerCard2]: Card[], [scenarioCard1, scenarioCard2]: Card[] = []): boolean =>
  (playerCard1 === scenarioCard1 && playerCard2 === scenarioCard2) ||
  (playerCard1 === scenarioCard2 && playerCard2 === scenarioCard1);

const matchScenarioHandCards = (scenario: Scenario) => (playerCards: Card[], dealerCard: Card[]) =>
  isMatchingHand(playerCards, scenario.handCards) && inDealerBound(dealerCard, scenario);

const satisfy = (scenario: Scenario) => (playerHand: Card[], dealerCard: Card[]) =>
  matchScenarioHandCards(scenario)(playerHand, dealerCard) || matchScenarioPlayerHandValue(scenario)(playerHand, dealerCard);

const satisfyScenario = (playerHand: Card[], dealerCard: Card[]) => (matchScenario: boolean, scenario: Scenario) =>
  matchScenario || satisfy(scenario)(playerHand, dealerCard);

const matchingScenarioFor =
  (playerHand: Card[], dealerCard: Card[]) =>
  ({ list }: { list: Scenario[] }): boolean =>
    list.reduce(satisfyScenario(playerHand, dealerCard), false);

export const basicStrategy = (game: BlackJack) => {
  const playerHand = currentHand(game);
  const dealerCard = game.dealerHand.cards;

  if (playerHand == null || dealerCard == null) {
    throw new Error('Game is not ready');
  }

  return scenarios.find(matchingScenarioFor(playerHand, dealerCard))?.action ?? stand;
};
