import type { VoxelMinesweeperGame } from '../game/VoxelMinesweeperGame';

export function initUiEvents(game: VoxelMinesweeperGame): void {
  const btnDig = document.getElementById('btn-mode-dig')!;
  const btnFlag = document.getElementById('btn-mode-flag')!;

  btnDig.addEventListener('click', () => {
    game.currentMode = 'dig';
    btnDig.className = 'flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-lg ring-2 ring-emerald-500 bg-emerald-600 text-white';
    btnFlag.className = 'flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700';
  });

  btnFlag.addEventListener('click', () => {
    game.currentMode = 'flag';
    btnFlag.className = 'flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-lg ring-2 ring-rose-500 bg-rose-600 text-white';
    btnDig.className = 'flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700';
  });

  document.getElementById('btn-pitch')!.addEventListener('click', () => game.cyclePitchAngle());
  document.getElementById('btn-xray')!.addEventListener('click', () => game.toggleXRay());

  document.getElementById('btn-zoom-in')!.addEventListener('click', () => game.setZoom(0.25));
  document.getElementById('btn-zoom-out')!.addEventListener('click', () => game.setZoom(-0.25));
  document.getElementById('btn-zoom-reset')!.addEventListener('click', () => game.setZoom(1.0, true));

  document.getElementById('btn-rot-left')!.addEventListener('click', () => game.rotateCamera(-1));
  document.getElementById('btn-rot-right')!.addEventListener('click', () => game.rotateCamera(1));

  document.getElementById('btn-reset')!.addEventListener('click', () => game.resetGame());
  document.getElementById('modal-restart-btn')!.addEventListener('click', () => game.resetGame());
  document.getElementById('modal-observe-btn')!.addEventListener('click', () => game.hideModalToObserve());
  document.getElementById('btn-return-modal')!.addEventListener('click', () => game.showModalFromObserve());

  document.querySelectorAll<HTMLButtonElement>('.diff-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach((b) => {
        b.classList.remove('text-amber-400');
        b.classList.add('text-slate-400');
      });
      btn.classList.remove('text-slate-400');
      btn.classList.add('text-amber-400');

      game.gridSize = parseInt(btn.dataset.size!, 10);
      game.maxHeight = parseInt(btn.dataset.height!, 10);
      game.activeMines = parseInt(btn.dataset.mines!, 10);
      game.resetGame();
    });
  });
}
