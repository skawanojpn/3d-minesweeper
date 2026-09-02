import * as THREE from 'three';
import { textureCache } from './textureCache';

type SubIcon = 'check' | 'cross' | null;

function createVectorFlagTexture(bgColor: string, borderColor: string, subIcon: SubIcon): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 236, 236);

  // ポール
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(85, 45);
  ctx.lineTo(85, 215);
  ctx.stroke();

  // 三角フラッグ
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(85, 55);
  ctx.lineTo(195, 95);
  ctx.lineTo(85, 135);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 6;
  ctx.stroke();

  // サブアイコン (正解 ✅ / 誤り ❌)
  if (subIcon === 'check') {
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(125, 185);
    ctx.lineTo(155, 215);
    ctx.lineTo(215, 155);
    ctx.stroke();
  } else if (subIcon === 'cross') {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(135, 155);
    ctx.lineTo(205, 225);
    ctx.moveTo(205, 155);
    ctx.lineTo(135, 225);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

export function getFlagTexture(): THREE.CanvasTexture {
  if (!textureCache.flag) textureCache.flag = createVectorFlagTexture('#064e3b', '#10b981', null);
  return textureCache.flag;
}

export function getCorrectFlagTexture(): THREE.CanvasTexture {
  if (!textureCache.correctFlag) textureCache.correctFlag = createVectorFlagTexture('#064e3b', '#22c55e', 'check');
  return textureCache.correctFlag;
}

export function getWrongFlagTexture(): THREE.CanvasTexture {
  if (!textureCache.wrongFlag) textureCache.wrongFlag = createVectorFlagTexture('#4c0519', '#e11d48', 'cross');
  return textureCache.wrongFlag;
}
