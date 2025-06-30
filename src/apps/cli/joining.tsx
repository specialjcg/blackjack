import React from 'react';
import { Text, useInput } from 'ink';
import { inject } from '@/libraries/piqure';
import { join } from '@/features/actions';
import { BETTING } from './phase';
import { GAME_STATE_KEY, PHASE_STATE_KEY } from './keys';

export const Joining = () => {
  const [game, setGame] = inject(GAME_STATE_KEY);
  const [, setPhase] = inject(PHASE_STATE_KEY);

  useInput((input) => {
    if (input === 'j') {
      setGame(join(game)({ availableMoney: 500 }, 0)); // todo: configure this
    }

    if (input === 'r') {
      setPhase(BETTING);
    }
  });

  return (
    <>
      <Text>Joining the game...</Text>
      <Text>Press j to join the game</Text>
      <Text>Press r when players are ready</Text>
    </>
  );
};
