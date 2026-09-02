import type { VoxelMinesweeperGame } from '../game/VoxelMinesweeperGame';

export function initPointerEvents(game: VoxelMinesweeperGame): void {
  window.addEventListener('pointermove', (e) => {
    if (game.isGameOver) {
      game.hoverBox.visible = false;
      return;
    }
    const cell = game.getCellFromClientPos(e.clientX, e.clientY);
    if (cell) {
      game.hoverBox.position.copy(cell.mesh.position);
      game.hoverBox.visible = true;
      game.showNeighborHighlights(cell);
    } else {
      game.hoverBox.visible = false;
      game.hideNeighborHighlights();
    }
  });

  game.renderer.domElement.addEventListener('click', (e) => {
    const cell = game.getCellFromClientPos(e.clientX, e.clientY);
    if (!cell) return;

    if (game.currentMode === 'flag') {
      game.toggleFlag(cell);
    } else if (cell.revealed) {
      game.chordCell(cell);
    } else {
      game.revealCell(cell);
    }
  });

  game.renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const cell = game.getCellFromClientPos(e.clientX, e.clientY);
    if (cell) game.toggleFlag(cell);
  });

  game.renderer.domElement.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      game.setZoom(delta);
    },
    { passive: false },
  );
}
