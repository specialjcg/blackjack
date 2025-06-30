export const VALUES = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'] as const;

export type Card = (typeof VALUES)[number];
