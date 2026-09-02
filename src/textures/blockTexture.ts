import * as THREE from 'three';
import { textureCache } from './textureCache';

export function getUnrevealedTopTexture(): THREE.CanvasTexture {
  if (textureCache.unrevealedTop) return textureCache.unrevealedTop;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  // 縁取り分の下地(境界線の色)
  ctx.fillStyle = '#1b3318';
  ctx.fillRect(0, 0, 128, 128);
  // 本体を敷き詰め、外周にのみ細い縁を残す
  ctx.fillStyle = '#3a7332';
  ctx.fillRect(3, 3, 122, 122);
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
  // 縁取り分の下地(境界線の色)
  ctx.fillStyle = '#231710';
  ctx.fillRect(0, 0, 128, 128);
  // 土壁本体
  ctx.fillStyle = '#452b1e';
  ctx.fillRect(3, 3, 122, 122);
  // 上部の草冠(縁取りの内側に収める)
  ctx.fillStyle = '#3a7332';
  ctx.fillRect(3, 3, 122, 18);
  const tex = new THREE.CanvasTexture(canvas);
  textureCache.unrevealedSide = tex;
  return tex;
}
