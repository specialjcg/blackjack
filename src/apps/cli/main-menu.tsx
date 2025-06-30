import React from 'react';
import { Text, useApp, useInput } from 'ink';
import { inject } from '@/libraries/piqure';
import { randomShuffler } from '@/features/core';
import { BetRange, start } from '@/features/actions';
import { JOINING } from './phase';
import { GAME_STATE_KEY, PHASE_STATE_KEY } from './keys';

export const MainMenu = () => {
  const [, setGame] = inject(GAME_STATE_KEY);
  const [, setPhase] = inject(PHASE_STATE_KEY);
  const { exit } = useApp();

  useInput((input) => {
    if (input === 's') {
      setPhase(JOINING);
      setGame(
        start(randomShuffler)({
          decksCount: 1, // todo: configure this
          betRange: BetRange({ min: 5, max: 100 }) // todo: configure this
        })
      );
    }

    if (input === 'q') {
      exit();
    }
  });

  return (
    <>
      <Text>Press s to start a new game</Text>
      <Text>Press q to exit</Text>
    </>
  );
};
