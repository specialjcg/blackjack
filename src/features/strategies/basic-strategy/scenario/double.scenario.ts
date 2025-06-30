import { Scenario } from './scenario';

export const doubleScenarios: Scenario[] = [
  { playerHandValue: 11, dealerHandValueFloor: 2, dealerHandValueCeil: 11 },
  { playerHandValue: 10, dealerHandValueFloor: 2, dealerHandValueCeil: 9 },
  { playerHandValue: 9, dealerHandValueFloor: 3, dealerHandValueCeil: 6 },
  { handCards: ['ace', '8'], dealerHandValueFloor: 6, dealerHandValueCeil: 6 },
  { handCards: ['ace', '7'], dealerHandValueFloor: 2, dealerHandValueCeil: 6 },
  { handCards: ['ace', '6'], dealerHandValueFloor: 3, dealerHandValueCeil: 6 },
  { handCards: ['ace', '5'], dealerHandValueFloor: 4, dealerHandValueCeil: 6 },
  { handCards: ['ace', '4'], dealerHandValueFloor: 4, dealerHandValueCeil: 6 },
  { handCards: ['ace', '3'], dealerHandValueFloor: 5, dealerHandValueCeil: 6 },
  { handCards: ['ace', '2'], dealerHandValueFloor: 5, dealerHandValueCeil: 6 },
  { handCards: ['5', '5'], dealerHandValueFloor: 2, dealerHandValueCeil: 9 }
];
