import type { VoxelMinesweeperGame } from '../game/VoxelMinesweeperGame';

export function initKeyboardEvents(game: VoxelMinesweeperGame): void {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') game.rotateCamera(-1);
    else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') game.rotateCamera(1);
    else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowUp' || e.key === 'ArrowDown') game.cyclePitchAngle();
    else if (e.key === 'x' || e.key === 'X') game.toggleXRay();
    else if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
      const btnDig = document.getElementById('btn-mode-dig')!;
      const btnFlag = document.getElementById('btn-mode-flag')!;
      if (game.currentMode === 'dig') btnFlag.click();
      else btnDig.click();
    }
  });
}
