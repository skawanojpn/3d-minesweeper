import type { Block, Board } from './types';
import { get3DNeighbors } from './board';

// 初回クリック後の地雷配置 (初手＆その26近傍の安全を100%保証する)
export function populateMines(
  firstClickedBlock: Block,
  activeBlocks: Block[],
  board: Board,
  gridSize: number,
  maxHeight: number,
  mineCount: number,
  rng: () => number = Math.random,
): void {
  const safeNeighbors = get3DNeighbors(firstClickedBlock, board, gridSize, maxHeight);
  const forbidden = new Set<string>();
  forbidden.add(`${firstClickedBlock.x},${firstClickedBlock.y},${firstClickedBlock.z}`);
  safeNeighbors.forEach((n) => forbidden.add(`${n.x},${n.y},${n.z}`));

  const candidates = activeBlocks.filter((b) => !forbidden.has(`${b.x},${b.y},${b.z}`));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const countToPlace = Math.min(mineCount, candidates.length);
  for (let i = 0; i < countToPlace; i++) {
    candidates[i].isMine = true;
  }

  activeBlocks.forEach((b) => {
    if (b.isMine) return;
    const neighbors = get3DNeighbors(b, board, gridSize, maxHeight);
    b.neighborMines = neighbors.filter((n) => n.isMine).length;
  });
}
