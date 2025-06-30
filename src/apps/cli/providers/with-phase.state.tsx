import React, { type ReactNode } from 'react';
import { type State } from '@/libraries/react';
import { ClientProvider } from '@/libraries/piqure';
import { PHASE_STATE_KEY } from '../keys';
import { type Phase } from '../phase';

export const withPhaseState =
  (phaseState: State<Phase>) =>
  (children: ReactNode): ReactNode => <ClientProvider bind={PHASE_STATE_KEY} to={phaseState} children={children} />;
