import { describe, expect, it } from 'vitest';
import { getExposedFaces, get3DNeighbors } from './board';
import { makeBlock } from './testHelpers';
import type { Board, HeightMap } from './types';

describe('getExposedFaces', () => {
  it('地表(y=0)の孤立ブロックは下面(ny)以外の5面が露出する', () => {
    const heightMap: HeightMap = [[1]];
    const exposed = getExposedFaces(0, 0, 0, heightMap, 1);
    expect(exposed).toEqual({ px: true, nx: true, py: true, ny: false, pz: true, nz: true });
  });

  it('地表より上のブロックは下が空洞なら下面(ny)も露出する', () => {
    // 高さ2の柱で上段(y=1)を見ると、下段(y=0)は占有されているのでny=falseになる。
    // 一方、宙に浮いた状態を模した2層構造(下段が別カラムのみ占有)ではny=trueになる。
    const heightMap: HeightMap = [[2]];
    const upperOfSolidColumn = getExposedFaces(0, 1, 0, heightMap, 1);
    expect(upperOfSolidColumn.ny).toBe(false);
  });

  it('完全に埋没したブロックは全面非露出になる', () => {
    // 3x3x3ですべての高さが3(=y0..2埋まっている)の場合、中心ブロック(1,1,1)は6面すべて隣接ブロックに囲まれる
    const heightMap: HeightMap = [
      [3, 3, 3],
      [3, 3, 3],
      [3, 3, 3],
    ];
    const exposed = getExposedFaces(1, 1, 1, heightMap, 3);
    expect(exposed).toEqual({ px: false, nx: false, py: false, ny: false, pz: false, nz: false });
  });

  it('地表(y=0)は下面(ny)を常に非露出として扱う', () => {
    const heightMap: HeightMap = [[1]];
    const exposed = getExposedFaces(0, 0, 0, heightMap, 1);
    expect(exposed.ny).toBe(false);
  });

  it('上に別ブロックが乗っている壁面ブロックは側面が露出する', () => {
    // (0,0)の高さ2 vs 隣接(1,0)の高さ1: y=0のブロックは(1,0,0)が埋まっているのでpx面は非露出、
    // y=1のブロックは(1,0,0)がy=1まで届かないのでpx面が露出する
    const heightMap: HeightMap = [
      [2, 2],
      [1, 2],
    ];
    const groundLevel = getExposedFaces(0, 0, 0, heightMap, 2);
    const upperLevel = getExposedFaces(0, 1, 0, heightMap, 2);
    expect(groundLevel.px).toBe(false);
    expect(upperLevel.px).toBe(true);
  });

  it('グリッド外は非占有として扱われ端のブロックは露出する', () => {
    const heightMap: HeightMap = [[1]];
    const exposed = getExposedFaces(0, 0, 0, heightMap, 1);
    expect(exposed.px).toBe(true);
    expect(exposed.nz).toBe(true);
  });
});

describe('get3DNeighbors', () => {
  function buildFlatBoard(size: number): Board {
    const board: Board = [];
    for (let x = 0; x < size; x++) {
      board[x] = [[]];
      for (let z = 0; z < size; z++) {
        board[x][0][z] = makeBlock({ x, y: 0, z });
      }
    }
    return board;
  }

  it('中央ブロックは平面26近傍のうち同層8方向のみ取得する(高さ1のボード)', () => {
    const board = buildFlatBoard(3);
    const center = board[1][0][1]!;
    const neighbors = get3DNeighbors(center, board, 3, 1);
    expect(neighbors).toHaveLength(8);
  });

  it('隅ブロックは範囲外を除いた近傍のみ取得する', () => {
    const board = buildFlatBoard(3);
    const corner = board[0][0][0]!;
    const neighbors = get3DNeighbors(corner, board, 3, 1);
    expect(neighbors).toHaveLength(3);
  });

  it('isActive=falseの近傍ブロックは除外される', () => {
    const board = buildFlatBoard(3);
    board[1][0][0]!.isActive = false;
    const center = board[1][0][1]!;
    const neighbors = get3DNeighbors(center, board, 3, 1);
    expect(neighbors).toHaveLength(7);
  });

  it('立体空間では上下層を含む最大26近傍を取得できる', () => {
    const size = 3;
    const height = 3;
    const board: Board = [];
    for (let x = 0; x < size; x++) {
      board[x] = [];
      for (let y = 0; y < height; y++) {
        board[x][y] = [];
        for (let z = 0; z < size; z++) {
          board[x][y][z] = makeBlock({ x, y, z });
        }
      }
    }
    const center = board[1][1][1]!;
    const neighbors = get3DNeighbors(center, board, size, height);
    expect(neighbors).toHaveLength(26);
  });

  it('nullブロック(未生成領域)は近傍から除外される', () => {
    const board = buildFlatBoard(3);
    board[1][0][0] = null;
    const center = board[1][0][1]!;
    const neighbors = get3DNeighbors(center, board, 3, 1);
    expect(neighbors).toHaveLength(7);
  });
});
