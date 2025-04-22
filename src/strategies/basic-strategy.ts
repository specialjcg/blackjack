import { BlackJack, Card, computeHandValue } from '../core';
import { double, hit, split, stand, surrender } from '../decisions';

type ScenarioDealerHandValue = {
  dealerHandValueFloor: number;
  dealerHandValueCeil: number;
};

type ScenarioHandCards = {
  handCards: [Card, Card];
  playerHandValue?: never;
};

type ScenarioHandValue = {
  handCards?: never;
  playerHandValue: number;
};

type Scenario = ScenarioDealerHandValue & (ScenarioHandCards | ScenarioHandValue);

const hitScenarios: Scenario[] = [
  { playerHandValue: 16, dealerHandValueFloor: 7, dealerHandValueCeil: 8 },
  { playerHandValue: 15, dealerHandValueFloor: 7, dealerHandValueCeil: 9 },
  { playerHandValue: 14, dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { playerHandValue: 13, dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { playerHandValue: 12, dealerHandValueFloor: 2, dealerHandValueCeil: 3 },
  { playerHandValue: 12, dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { playerHandValue: 10, dealerHandValueFloor: 10, dealerHandValueCeil: 11 },
  { playerHandValue: 9, dealerHandValueFloor: 2, dealerHandValueCeil: 2 },
  { playerHandValue: 9, dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { playerHandValue: 8, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { playerHandValue: 7, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { playerHandValue: 6, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { playerHandValue: 5, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { handCards: ['ace', '7'], dealerHandValueFloor: 9, dealerHandValueCeil: 11 },
  { handCards: ['ace', '6'], dealerHandValueFloor: 2, dealerHandValueCeil: 2 },
  { handCards: ['ace', '6'], dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { handCards: ['ace', '5'], dealerHandValueFloor: 2, dealerHandValueCeil: 3 },
  { handCards: ['ace', '4'], dealerHandValueFloor: 2, dealerHandValueCeil: 3 },
  { handCards: ['ace', '5'], dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { handCards: ['ace', '4'], dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { handCards: ['ace', '3'], dealerHandValueFloor: 2, dealerHandValueCeil: 4 },
  { handCards: ['ace', '2'], dealerHandValueFloor: 2, dealerHandValueCeil: 4 },
  { handCards: ['ace', '3'], dealerHandValueFloor: 7, dealerHandValueCeil: 11 },
  { handCards: ['ace', '2'], dealerHandValueFloor: 7, dealerHandValueCeil: 11 }
];

const surrenderScenarios: Scenario[] = [
  { playerHandValue: 17, dealerHandValueFloor: 11, dealerHandValueCeil: 11 },
  { playerHandValue: 16, dealerHandValueFloor: 9, dealerHandValueCeil: 11 },
  { playerHandValue: 15, dealerHandValueFloor: 10, dealerHandValueCeil: 11 }
];

const doubleScenarios: Scenario[] = [
  { playerHandValue: 11, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { playerHandValue: 10, dealerHandValueFloor: 2, dealerHandValueCeil: 9 },
  { playerHandValue: 9, dealerHandValueFloor: 3, dealerHandValueCeil: 6 },
  { handCards: ['ace', '8'], dealerHandValueFloor: 6, dealerHandValueCeil: 6 },
  { handCards: ['ace', '7'], dealerHandValueFloor: 2, dealerHandValueCeil: 6 },
  { handCards: ['ace', '6'], dealerHandValueFloor: 3, dealerHandValueCeil: 6 },
  { handCards: ['ace', '5'], dealerHandValueFloor: 4, dealerHandValueCeil: 6 },
  { handCards: ['ace', '4'], dealerHandValueFloor: 4, dealerHandValueCeil: 6 },
  { handCards: ['ace', '3'], dealerHandValueFloor: 5, dealerHandValueCeil: 6 },
  { handCards: ['ace', '2'], dealerHandValueFloor: 5, dealerHandValueCeil: 6 }
];

const splitScenarios: Scenario[] = [{ handCards: ['ace', 'ace'], dealerHandValueFloor: 2, dealerHandValueCeil: 11 }];

const currentHand = (game: BlackJack): Card[] | undefined =>
  game.playingPositions[game.currentPlayingHand.playingPositionId]?.hands[game.currentPlayingHand.handIndex]?.cards;

const inDealerBound = (dealerCard: Card[], scenario: Scenario) =>
  computeHandValue(dealerCard) >= scenario.dealerHandValueFloor && computeHandValue(dealerCard) <= scenario.dealerHandValueCeil;

const hardTotal = (scenario: Scenario) => (playerHand: Card[], dealerCard: Card[]) =>
  computeHandValue(playerHand) === scenario.playerHandValue && inDealerBound(dealerCard, scenario);

const softTotal = (scenario: Scenario) => (playerHand: Card[], dealerCard: Card[]) => {
  return (
    ((scenario.handCards?.[0] === playerHand[0] && scenario.handCards?.[1] === playerHand[1]) ||
      (scenario.handCards?.[0] === playerHand[1] && scenario.handCards?.[0] === playerHand[1])) &&
    inDealerBound(dealerCard, scenario)
  );
};

const satisfy = (scenario: Scenario) => (playerHand: Card[], dealerCard: Card[]) =>
  softTotal(scenario)(playerHand, dealerCard) || hardTotal(scenario)(playerHand, dealerCard);

const satisfyScenario = (playerHand: Card[], dealerCard: Card[]) => (matchScenario: boolean, scenario: Scenario) =>
  matchScenario || satisfy(scenario)(playerHand, dealerCard);

export const basicStrategy = (game: BlackJack) => {
  const playerHand = currentHand(game);
  const dealerCard = game.dealerHand.cards;

  if (playerHand == null || dealerCard == null) {
    throw new Error('Game is not ready');
  }

  if (splitScenarios.reduce(satisfyScenario(playerHand, dealerCard), false)) {
    return split;
  }

  if (hitScenarios.reduce(satisfyScenario(playerHand, dealerCard), false)) {
    return hit;
  }

  if (surrenderScenarios.reduce(satisfyScenario(playerHand, dealerCard), false)) {
    return surrender;
  }

  if (doubleScenarios.reduce(satisfyScenario(playerHand, dealerCard), false)) {
    return double;
  }

  return stand;
};
