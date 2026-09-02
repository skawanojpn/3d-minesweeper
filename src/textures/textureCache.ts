import * as THREE from 'three';

interface TextureCache {
  numbers: Record<number, THREE.CanvasTexture>;
  flag: THREE.CanvasTexture | null;
  correctFlag: THREE.CanvasTexture | null;
  wrongFlag: THREE.CanvasTexture | null;
  bomb: THREE.CanvasTexture | null;
  explodedBomb: THREE.CanvasTexture | null;
  unrevealedTop: THREE.CanvasTexture | null;
  unrevealedSide: THREE.CanvasTexture | null;
}

export const textureCache: TextureCache = {
  numbers: {},
  flag: null,
  correctFlag: null,
  wrongFlag: null,
  bomb: null,
  explodedBomb: null,
  unrevealedTop: null,
  unrevealedSide: null,
};
