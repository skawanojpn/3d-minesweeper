import type { HeightMap, TerrainType } from '../game/types';

const TERRAIN_TYPES: TerrainType[] = ['mountain', 'ridge', 'twin_peaks', 'caldera', 'terrace'];

// プロシージャル地形生成（単独峰、稜線、双子峰、カルデラなど毎回変化）
export function generateProceduralHeights(size: number, maxH: number): HeightMap {
  const map: HeightMap = [];
  const type = TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];
  const phaseX = Math.random() * 10;
  const phaseZ = Math.random() * 10;

  for (let x = 0; x < size; x++) {
    map[x] = [];
    for (let z = 0; z < size; z++) {
      const nx = (x / (size - 1)) * 2 - 1;
      const nz = (z / (size - 1)) * 2 - 1;
      const dist = Math.hypot(nx, nz);
      let hRatio = 0;

      if (type === 'mountain') {
        hRatio = Math.max(0, 1 - dist * 1.15);
      } else if (type === 'ridge') {
        hRatio = Math.max(0, 1 - Math.abs(nx + nz * 0.5) * 1.2);
      } else if (type === 'twin_peaks') {
        const d1 = Math.hypot(nx - 0.45, nz - 0.45);
        const d2 = Math.hypot(nx + 0.45, nz + 0.45);
        hRatio = Math.max(0, Math.max(1 - d1 * 1.4, 1 - d2 * 1.4));
      } else if (type === 'caldera') {
        hRatio = Math.sin(dist * Math.PI) * 0.9;
      } else {
        hRatio = Math.max(0, 1 - dist) + 0.2;
      }

      const noise = Math.sin(x * 1.2 + phaseX) * Math.cos(z * 1.2 + phaseZ) * 0.35;
      let rawHeight = Math.round(1 + (hRatio + noise) * (maxH - 1));
      rawHeight = Math.max(1, Math.min(maxH, rawHeight));
      map[x][z] = rawHeight;
    }
  }
  return map;
}
