import React, { useState } from 'react';
import { render } from 'ink';
import { PipeProviders } from '@/libraries/providers';
import { type State } from '@/libraries/react';
import { type BlackJack } from '@/features/core';
import { Joining } from './joining';
import { MainMenu } from './main-menu';
import { type Phase, JOINING, MAIN_MENU } from './phase';
import { withGameState, withPhaseState } from './providers';

const EMPTY_GAME: BlackJack = undefined as unknown as BlackJack;

const isMainMenu = ([phase]: State<Phase>): boolean => phase === MAIN_MENU;

const isJoining = ([phase]: State<Phase>): boolean => phase === JOINING;

const App = () => {
  // todo: initialize game state before state instead of using undefined

  const gameState: State<BlackJack> = useState<BlackJack>(EMPTY_GAME);
  const phaseState: State<Phase> = useState<Phase>(MAIN_MENU);

  // todo: b => bet

  return (
    <PipeProviders providers={[withGameState(gameState), withPhaseState(phaseState)]}>
      {isMainMenu(phaseState) && <MainMenu />}
      {isJoining(phaseState) && <Joining />}
    </PipeProviders>
  );
};

render(<App />);
