import { describe, expect, it } from 'vitest';
import { computeHandValue } from './decision-commons';

describe('decision commons', () => {
  it('should not exceed 21 with q, q, ace', () => {
    const score = computeHandValue(['q', 'q', 'ace']);

    expect(score).toBe(21);
  });

  it('should not exceed 21 with q, ace', () => {
    const score = computeHandValue(['q', 'ace']);

    expect(score).toBe(21);
  });

  it('should not exceed 21 when ace in not the last card hit with 4, ace, 9', () => {
    const score = computeHandValue(['4', 'ace', '9']);

    expect(score).toBe(14);
  });

  it('should be 12 with 8 and 4 ace', () => {
    const score = computeHandValue(['ace', 'ace', '8', 'ace', 'ace']);

    expect(score).toBe(12);
  });

  it('should be 16 with 2 and 4 ace', () => {
    const score = computeHandValue(['ace', 'ace', '2', 'ace', 'ace']);

    expect(score).toBe(16);
  });

  it('should be 13 with 10 and 3 ace', () => {
    const score = computeHandValue(['ace', 'ace', '10', 'ace']);

    expect(score).toBe(13);
  });

  it('should be 12 with 10 and 2 ace', () => {
    const score = computeHandValue(['ace', 'ace', '10']);

    expect(score).toBe(12);
  });
});
