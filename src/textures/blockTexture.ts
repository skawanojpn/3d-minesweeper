import * as THREE from 'three';
import { textureCache } from './textureCache';

export function getUnrevealedTopTexture(): THREE.CanvasTexture {
  if (textureCache.unrevealedTop) return textureCache.unrevealedTop;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1e3a1b';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(8, 8, 112, 112);
  ctx.fillStyle = '#3a7332';
  ctx.fillRect(16, 16, 96, 96);
  ctx.strokeStyle = '#529648';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 92, 92);
  const tex = new THREE.CanvasTexture(canvas);
  textureCache.unrevealedTop = tex;
  return tex;
}

export function getUnrevealedSideTexture(): THREE.CanvasTexture {
  if (textureCache.unrevealedSide) return textureCache.unrevealedSide;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#271911';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#452b1e';
  ctx.fillRect(6, 6, 116, 116);
  ctx.fillStyle = '#2d5a27';
  ctx.fillRect(6, 6, 116, 20);
  ctx.strokeStyle = '#5a3d2e';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 112, 112);
  const tex = new THREE.CanvasTexture(canvas);
  textureCache.unrevealedSide = tex;
  return tex;
}
