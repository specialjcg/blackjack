export const MAIN_MENU = 'MAIN_MENU' as const;
export const JOINING = 'JOINING' as const;
export const BETTING = 'BETTING' as const;
export const PLAYING = 'PLAYING' as const;

export type Phase = typeof MAIN_MENU | typeof JOINING | typeof BETTING | typeof PLAYING;
