import { describe, expect, it } from 'vitest';
import { generateProceduralHeights } from './generateHeights';

describe('generateProceduralHeights', () => {
  it('指定サイズのグリッドを生成する', () => {
    const map = generateProceduralHeights(8, 5);
    expect(map).toHaveLength(8);
    map.forEach((row) => expect(row).toHaveLength(8));
  });

  it('すべての高さが1以上maxH以下に収まる', () => {
    for (let i = 0; i < 20; i++) {
      const map = generateProceduralHeights(10, 6);
      for (const row of map) {
        for (const h of row) {
          expect(h).toBeGreaterThanOrEqual(1);
          expect(h).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  it('実行のたびに異なる地形が生成されうる(決定論的固定でない)', () => {
    const maps = Array.from({ length: 10 }, () => generateProceduralHeights(8, 5));
    const serialized = maps.map((m) => JSON.stringify(m));
    const uniqueCount = new Set(serialized).size;
    expect(uniqueCount).toBeGreaterThan(1);
  });
});
