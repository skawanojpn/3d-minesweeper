import type { Block, Board, ExposedFaces, HeightMap } from './types';

// 露出面（外気に触れている面）の検出
export function getExposedFaces(x: number, y: number, z: number, heightMap: HeightMap, size: number): ExposedFaces {
  const isOccupied = (tx: number, ty: number, tz: number): boolean => {
    if (tx < 0 || tx >= size || tz < 0 || tz >= size) return false;
    return ty < heightMap[tx][tz];
  };

  return {
    px: !isOccupied(x + 1, y, z), // 右
    nx: !isOccupied(x - 1, y, z), // 左
    py: !isOccupied(x, y + 1, z), // 上
    ny: y > 0 && !isOccupied(x, y - 1, z), // 下
    pz: !isOccupied(x, y, z + 1), // 前
    nz: !isOccupied(x, y, z - 1), // 後
  };
}

// 3次元26近傍の隣接アクティブブロック取得
export function get3DNeighbors(block: Block, board: Board, gridSize: number, maxHeight: number): Block[] {
  const neighbors: Block[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const nx = block.x + dx;
        const ny = block.y + dy;
        const nz = block.z + dz;

        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < maxHeight && nz >= 0 && nz < gridSize) {
          const n = board[nx][ny][nz];
          if (n && n.isActive) {
            neighbors.push(n);
          }
        }
      }
    }
  }
  return neighbors;
}
