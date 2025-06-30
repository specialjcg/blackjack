import React, { type ReactNode } from 'react';
import { type State } from '@/libraries/react';
import { ClientProvider } from '@/libraries/piqure';
import { type BlackJack } from '@/features/core';
import { GAME_STATE_KEY } from '../keys';

export const withGameState =
  (gameState: State<BlackJack>) =>
  (children: ReactNode): ReactNode => <ClientProvider bind={GAME_STATE_KEY} to={gameState} children={children} />;
