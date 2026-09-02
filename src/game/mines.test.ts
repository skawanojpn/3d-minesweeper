import { describe, expect, it } from 'vitest';
import { populateMines } from './mines';
import { makeBlock } from './testHelpers';
import type { Board } from './types';

function buildFlatBoard(size: number): { board: Board; activeBlocks: ReturnType<typeof makeBlock>[] } {
  const board: Board = [];
  const activeBlocks: ReturnType<typeof makeBlock>[] = [];
  for (let x = 0; x < size; x++) {
    board[x] = [[]];
    for (let z = 0; z < size; z++) {
      const block = makeBlock({ x, y: 0, z });
      board[x][0][z] = block;
      activeBlocks.push(block);
    }
  }
  return { board, activeBlocks };
}

describe('populateMines', () => {
  it('初手セルには地雷を配置しない', () => {
    const { board, activeBlocks } = buildFlatBoard(5);
    const firstClick = board[2][0][2]!;
    populateMines(firstClick, activeBlocks, board, 5, 1, 10);
    expect(firstClick.isMine).toBe(false);
  });

  it('初手セルの26近傍(同層8方向)には地雷を配置しない', () => {
    const { board, activeBlocks } = buildFlatBoard(5);
    const firstClick = board[2][0][2]!;
    // 中央セルの周囲を全部埋めるほどの地雷数を要求しても、近傍は安全なまま
    populateMines(firstClick, activeBlocks, board, 5, 1, activeBlocks.length);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dz === 0) continue;
        expect(board[2 + dx][0][2 + dz]!.isMine).toBe(false);
      }
    }
  });

  it('指定した地雷数だけ配置される(候補が十分な場合)', () => {
    const { board, activeBlocks } = buildFlatBoard(6);
    const firstClick = board[0][0][0]!;
    populateMines(firstClick, activeBlocks, board, 6, 1, 5);
    const mineCount = activeBlocks.filter((b) => b.isMine).length;
    expect(mineCount).toBe(5);
  });

  it('候補数が地雷数より少ない場合は候補数までしか配置しない', () => {
    const { board, activeBlocks } = buildFlatBoard(3);
    const firstClick = board[1][0][1]!;
    // 3x3グリッドで中央クリック -> 安全マスは9個全部(中央+8近傍) -> 候補0
    populateMines(firstClick, activeBlocks, board, 3, 1, 5);
    const mineCount = activeBlocks.filter((b) => b.isMine).length;
    expect(mineCount).toBe(0);
  });

  it('地雷以外のブロックのneighborMinesが実際の隣接地雷数と一致する', () => {
    const { board, activeBlocks } = buildFlatBoard(5);
    const firstClick = board[0][0][0]!;
    populateMines(firstClick, activeBlocks, board, 5, 1, 8);

    for (const block of activeBlocks) {
      if (block.isMine) continue;
      let expectedCount = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dz === 0) continue;
          const nx = block.x + dx;
          const nz = block.z + dz;
          if (nx >= 0 && nx < 5 && nz >= 0 && nz < 5 && board[nx][0][nz]!.isMine) {
            expectedCount++;
          }
        }
      }
      expect(block.neighborMines).toBe(expectedCount);
    }
  });

  it('rngを固定すると配置は決定論的になる', () => {
    const fixedRng = (() => {
      let seed = 42;
      return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    })();

    const run1 = buildFlatBoard(6);
    populateMines(run1.board[0][0][0]!, run1.activeBlocks, run1.board, 6, 1, 5, fixedRng);
    const minePositions1 = run1.activeBlocks.filter((b) => b.isMine).map((b) => `${b.x},${b.z}`);

    const rerunRng = (() => {
      let seed = 42;
      return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    })();
    const run2 = buildFlatBoard(6);
    populateMines(run2.board[0][0][0]!, run2.activeBlocks, run2.board, 6, 1, 5, rerunRng);
    const minePositions2 = run2.activeBlocks.filter((b) => b.isMine).map((b) => `${b.x},${b.z}`);

    expect(minePositions1).toEqual(minePositions2);
  });
});
