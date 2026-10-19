import { describe, expect, it } from 'vitest';
import { formatLength, formatWeight, fromDisplayLength, fromDisplayWeight, toDisplayLength, toDisplayWeight } from '../js/utils/units.js';

describe('unidades', () => {
  it('métrico não muda nada', () => {
    expect(toDisplayWeight(80, 'metric')).toBe(80);
    expect(fromDisplayWeight('75,5', 'metric')).toBe(75.5);
    expect(formatWeight(80, {}, 'metric')).toBe('80 kg');
  });

  it('lb vai e volta sem deriva', () => {
    expect(toDisplayWeight(100, 'imperial')).toBe(220.5);
    const kg = fromDisplayWeight('225', 'imperial');
    expect(kg).toBe(102.06);
    expect(toDisplayWeight(kg, 'imperial')).toBe(225);
    expect(formatWeight('', {}, 'imperial')).toBe('- lb');
    expect(fromDisplayWeight('', 'imperial')).toBe('');
  });

  it('polegadas viram cm com 1 casa', () => {
    expect(toDisplayLength(180, 'imperial')).toBe(70.9);
    expect(fromDisplayLength('70', 'imperial')).toBe(177.8);
    expect(formatLength(92, {}, 'imperial')).toBe('36,2 pol');
  });
});
