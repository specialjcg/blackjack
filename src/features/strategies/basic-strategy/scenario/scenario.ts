import { Card } from '../../../core';

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

export type Scenario = ScenarioDealerHandValue & (ScenarioHandCards | ScenarioHandValue);
