import { key } from '@/libraries/piqure';
import { type State } from '@/libraries/react/state';
import { type BlackJack } from '@/features/core';

export const GAME_STATE_KEY = key<State<BlackJack>>('Game.State');
