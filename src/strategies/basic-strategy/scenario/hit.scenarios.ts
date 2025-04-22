import { Scenario } from './scenario';

export const hitScenarios: Scenario[] = [
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
  { playerHandValue: 4, dealerHandValueFloor: 8, dealerHandValueCeil: 11 },
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
