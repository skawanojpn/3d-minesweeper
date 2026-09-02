import { VoxelMinesweeperGame } from './game/VoxelMinesweeperGame';

declare global {
  interface Window {
    game: VoxelMinesweeperGame;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new VoxelMinesweeperGame();
});
