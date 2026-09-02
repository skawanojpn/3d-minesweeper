import * as THREE from 'three';
import type { Block, ExposedFaces } from '../game/types';
import { getNumberTexture } from '../textures/numberTexture';
import { getFlagTexture, getCorrectFlagTexture, getWrongFlagTexture } from '../textures/flagTexture';
import { getBombTexture } from '../textures/bombTexture';
import { getUnrevealedTopTexture, getUnrevealedSideTexture } from '../textures/blockTexture';

const FACE_ORDER: (keyof ExposedFaces)[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

interface MaterialContext {
  isXRayActive: boolean;
  isGameOver: boolean;
}

// ブロックの全露出面にテクスチャを一括反映する中核関数
export function updateBlockMaterials(block: Block, ctx: MaterialContext): void {
  const exposed = block.exposedFaces;
  const opacity = ctx.isXRayActive ? 0.45 : 1.0;
  const transparent = ctx.isXRayActive;

  let targetTex: THREE.CanvasTexture | null = null;
  if (block.revealed) {
    targetTex = getNumberTexture(block.neighborMines);
  } else if (block.flagged) {
    if (ctx.isGameOver) {
      targetTex = block.isMine ? getCorrectFlagTexture() : getWrongFlagTexture();
    } else {
      targetTex = getFlagTexture();
    }
  } else if (ctx.isGameOver && block.isMine) {
    targetTex = getBombTexture(block.isExploded);
  }

  const materials: THREE.MeshLambertMaterial[] = [];

  for (const faceKey of FACE_ORDER) {
    const isFaceExposed = exposed[faceKey];

    if (targetTex && isFaceExposed) {
      // 露出している全方位に同じテクスチャ（数字・旗・爆弾）を投影
      materials.push(
        new THREE.MeshLambertMaterial({
          map: targetTex,
          transparent,
          opacity,
        }),
      );
    } else if (block.revealed) {
      materials.push(
        new THREE.MeshLambertMaterial({
          color: 0x1f2937,
          transparent,
          opacity,
        }),
      );
    } else {
      if (faceKey === 'py') {
        materials.push(
          new THREE.MeshLambertMaterial({
            map: getUnrevealedTopTexture(),
            transparent,
            opacity,
          }),
        );
      } else {
        materials.push(
          new THREE.MeshLambertMaterial({
            map: getUnrevealedSideTexture(),
            transparent,
            opacity,
          }),
        );
      }
    }
  }

  block.mesh.material = materials;
  materials.forEach((m) => (m.needsUpdate = true));
}
