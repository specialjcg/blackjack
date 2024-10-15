import { describe, expect, it } from 'vitest';
import { computeScore } from './decision-commons';

describe('decision commons', () => {
  it('should not exceed 21 with q, q, ace', () => {
    const score = computeScore(['q', 'q', 'ace']);

    expect(score).toBe(21);
  });

  it('should not exceed 21 with q, ace', () => {
    const score = computeScore(['q', 'ace']);

    expect(score).toBe(21);
  });

  it('should not exceed 21 when ace in not the last card hit with 4, ace, 9', () => {
    const score = computeScore(['4', 'ace', '9']);

    // todo: move ace to the end before computing the score ?

    expect(score).toBe(14);
  });

  it('should be 21 with ace, ace, ace, ace', () => {
    const score = computeScore(['ace', 'ace', '8', 'ace', 'ace']);

    expect(score).toBe(12);
  });
});
