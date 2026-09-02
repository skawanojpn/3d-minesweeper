import * as THREE from 'three';

export type TerrainType = 'mountain' | 'ridge' | 'twin_peaks' | 'caldera' | 'terrace';

export type HeightMap = number[][];

export interface ExposedFaces {
  px: boolean;
  nx: boolean;
  py: boolean;
  ny: boolean;
  pz: boolean;
  nz: boolean;
}

export interface Block {
  x: number;
  y: number;
  z: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  isExploded: boolean;
  neighborMines: number;
  mesh: THREE.Mesh;
  flagPin: THREE.Group | null;
  exposedFaces: ExposedFaces;
  isActive: boolean;
}

export type Board = (Block | null)[][][];

export interface DifficultySetting {
  size: number;
  height: number;
  mines: number;
}

export interface PitchAngle {
  name: string;
  pitch: number;
}
