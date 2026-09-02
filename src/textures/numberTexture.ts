import * as THREE from 'three';
import { textureCache } from './textureCache';

const numberColors = [
  '#94a3b8', // 0
  '#38bdf8', // 1 (蛍光シアン)
  '#4ade80', // 2 (ライムグリーン)
  '#f87171', // 3 (鮮烈レッド)
  '#c084fc', // 4 (ネオンパープル)
  '#fbbf24', // 5 (鮮明アンバー)
  '#2dd4bf', // 6 (エメラルドティール)
  '#fb7185', // 7 (ホットピンク)
  '#ffffff', // 8 (ピュアホワイト)
  '#f97316', // 9 (ネオンオレンジ)
  '#e11d48', // 10 (ディープローズ)
  '#06b6d4', // 11 (ディープシアン)
  '#84cc16', // 12 (シャープライム)
  '#a855f7', // 13 (マゼンタパープル)
  '#eab308', // 14 (ゴールド)
  '#10b981', // 15+ (ミントグリーン)
];

export function getNumberColor(num: number): string {
  if (num < numberColors.length) return numberColors[num];
  return '#38bdf8';
}

// 1〜26までの2桁数字にも対応する超高解像度(256x256)数字テクスチャ
export function getNumberTexture(num: number): THREE.CanvasTexture {
  if (textureCache.numbers[num]) return textureCache.numbers[num];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // 背景の深色石畳プレート
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#111827';
  ctx.fillRect(10, 10, 236, 236);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, 228, 228);

  if (num > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(128, 128, 92, 0, Math.PI * 2);
    ctx.fill();

    // 2桁数字（10以上）のはみ出し防止：桁数に応じてフォントサイズを動的調整
    const isTwoDigit = num >= 10;
    const fontSize = isTwoDigit ? 96 : 148;
    ctx.font = `900 ${fontSize}px "JetBrains Mono", "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const color = getNumberColor(num);
    const yPos = isTwoDigit ? 132 : 134;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = isTwoDigit ? 20 : 26;
    ctx.lineJoin = 'round';
    ctx.strokeText(num.toString(), 128, yPos);

    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    ctx.fillStyle = color;
    ctx.fillText(num.toString(), 128, yPos);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(num.toString(), 128, yPos);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  textureCache.numbers[num] = tex;
  return tex;
}
