import { Scenario } from './scenario';

export const splitScenarios: Scenario[] = [
  { handCards: ['ace', 'ace'], dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { handCards: ['9', '9'], dealerHandValueFloor: 2, dealerHandValueCeil: 6 },
  { handCards: ['9', '9'], dealerHandValueFloor: 8, dealerHandValueCeil: 9 },
  { handCards: ['8', '8'], dealerHandValueFloor: 2, dealerHandValueCeil: 10 },
  { handCards: ['7', '7'], dealerHandValueFloor: 2, dealerHandValueCeil: 7 },
  { handCards: ['6', '6'], dealerHandValueFloor: 2, dealerHandValueCeil: 6 },
  { handCards: ['4', '4'], dealerHandValueFloor: 5, dealerHandValueCeil: 6 },
  { handCards: ['3', '3'], dealerHandValueFloor: 2, dealerHandValueCeil: 7 },
  { handCards: ['2', '2'], dealerHandValueFloor: 2, dealerHandValueCeil: 7 }
];
