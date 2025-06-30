import { key } from '@/libraries/piqure';
import { type State } from '@/libraries/react';
import { type Phase } from '../phase';

export const PHASE_STATE_KEY = key<State<Phase>>('Phase.State');
