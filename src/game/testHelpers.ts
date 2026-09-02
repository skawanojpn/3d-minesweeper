import type { Block } from './types';

// テスト専用: THREE.Mesh を必要としないロジックのための最小限のBlockスタブ
export function makeBlock(overrides: Partial<Block> & Pick<Block, 'x' | 'y' | 'z'>): Block {
  return {
    isMine: false,
    revealed: false,
    flagged: false,
    isExploded: false,
    neighborMines: 0,
    mesh: null as unknown as Block['mesh'],
    flagPin: null,
    exposedFaces: { px: true, nx: true, py: true, ny: true, pz: true, nz: true },
    isActive: true,
    ...overrides,
  };
}
