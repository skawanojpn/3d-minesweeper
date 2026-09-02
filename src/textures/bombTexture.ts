import * as THREE from 'three';
import { textureCache } from './textureCache';

function createVectorBombTexture(isExploded: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isExploded ? '#991b1b' : '#3f0c10';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = isExploded ? '#ef4444' : '#b91c1c';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 236, 236);

  // 地雷本体（黒丸）
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 138, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 8;
  ctx.stroke();

  // スパイク針
  for (let i = 0; i < 8; i++) {
    const rad = (i * Math.PI) / 4;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(rad) * 60, 138 + Math.sin(rad) * 60);
    ctx.lineTo(128 + Math.cos(rad) * 95, 138 + Math.sin(rad) * 95);
    ctx.stroke();
  }

  // ハイライト
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(106, 116, 14, 0, Math.PI * 2);
  ctx.fill();

  if (isExploded) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', 128, 70);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

export function getBombTexture(exploded = false): THREE.CanvasTexture {
  if (exploded) {
    if (!textureCache.explodedBomb) textureCache.explodedBomb = createVectorBombTexture(true);
    return textureCache.explodedBomb;
  }
  if (!textureCache.bomb) textureCache.bomb = createVectorBombTexture(false);
  return textureCache.bomb;
}
