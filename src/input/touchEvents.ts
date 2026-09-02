import type { VoxelMinesweeperGame } from '../game/VoxelMinesweeperGame';

export function initTouchEvents(game: VoxelMinesweeperGame): void {
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchMoved = false;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPressTriggered = false;
  let initialPinchDist = 0;
  let initialPinchZoom = 1.0;

  const el = game.renderer.domElement;

  el.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        initialPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialPinchZoom = game.zoomFactor;
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        isTouchMoved = false;
        isLongPressTriggered = false;

        if (longPressTimer) clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
          if (!isTouchMoved && !game.isGameOver) {
            const targetCell = game.getCellFromClientPos(touchStartX, touchStartY);
            if (targetCell) {
              isLongPressTriggered = true;
              if (navigator.vibrate) navigator.vibrate(40);
              game.toggleFlag(targetCell);
            }
          }
        }, 360);
      }
    },
    { passive: true },
  );

  el.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (initialPinchDist > 0) {
          const scale = dist / initialPinchDist;
          game.setZoom(initialPinchZoom * scale, true);
        }
        return;
      }

      if (e.touches.length === 1) {
        const dist = Math.hypot(e.touches[0].clientX - touchStartX, e.touches[0].clientY - touchStartY);
        if (dist > 20) {
          isTouchMoved = true;
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      }
    },
    { passive: true },
  );

  el.addEventListener(
    'touchend',
    (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (isLongPressTriggered) return;

      if (e.changedTouches.length === 1 && isTouchMoved) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 60) {
          game.rotateCamera(deltaX > 0 ? -1 : 1);
        }
      }
    },
    { passive: true },
  );
}
