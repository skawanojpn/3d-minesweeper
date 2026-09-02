import * as THREE from 'three';
import type { Block, Board, PitchAngle } from './types';
import { generateProceduralHeights } from '../terrain/generateHeights';
import { getExposedFaces, get3DNeighbors } from './board';
import { populateMines as populateMinesLogic } from './mines';
import { updateBlockMaterials } from '../render/materials';
import { createFlagPinMesh } from '../render/flagPin';
import { sfx } from '../audio/SoundFX';
import { initPointerEvents } from '../input/pointerEvents';
import { initTouchEvents } from '../input/touchEvents';
import { initKeyboardEvents } from '../input/keyboardEvents';
import { initUiEvents } from '../input/uiEvents';

export class VoxelMinesweeperGame {
  container: HTMLElement;
  width: number;
  height: number;

  gridSize = 8;
  maxHeight = 5;
  activeMines = 14;

  board: Board = [];
  activeBlocks: Block[] = [];
  allMeshes: THREE.Mesh[] = [];

  isFirstClick = true;
  isGameOver = false;
  isGameWon = false;
  currentMode: 'dig' | 'flag' = 'dig';
  flagsPlaced = 0;
  revealedCount = 0;
  totalSafeBlocks = 0;

  pitchAngles: PitchAngle[] = [
    { name: '標準 (35°)', pitch: Math.atan(1 / Math.sqrt(2)) },
    { name: '急斜 (55°)', pitch: 55 * (Math.PI / 180) },
    { name: '真上 (80°)', pitch: 80 * (Math.PI / 180) },
  ];
  pitchIndex = 0;
  isXRayActive = false;
  zoomFactor = 1.0;

  targetRotationY = Math.PI / 4;
  currentRotationY = Math.PI / 4;
  cameraDistance = 55;

  timer = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;

  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  dirLight: THREE.DirectionalLight;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  boxGeometry: THREE.BoxGeometry;
  hoverBox: THREE.Mesh;
  neighborHighlighters: THREE.Mesh[] = [];

  constructor() {
    this.container = document.getElementById('canvas-container')!;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    this.dirLight.position.set(30, 50, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    const shadowD = 22;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.scene.add(this.dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    fillLight.position.set(-30, 20, -30);
    this.scene.add(fillLight);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // ジオメトリ（谷間を見渡せる高さ2/3 = 0.64）
    this.boxGeometry = new THREE.BoxGeometry(0.96, 0.64, 0.96);

    const hoverGeo = new THREE.BoxGeometry(1.02, 0.7, 1.02);
    const hoverMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, wireframe: true, transparent: true, opacity: 0.9 });
    this.hoverBox = new THREE.Mesh(hoverGeo, hoverMat);
    this.hoverBox.visible = false;
    this.scene.add(this.hoverBox);

    // 3D空間26近傍の感知範囲ハイライトプール（最大26個）
    const nGeo = new THREE.BoxGeometry(1.01, 0.68, 1.01);
    const nMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.65 });
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(nGeo, nMat);
      m.visible = false;
      this.scene.add(m);
      this.neighborHighlighters.push(m);
    }

    this.updateCameraProjection();
    this.updateCameraTransform();
    initPointerEvents(this);
    initTouchEvents(this);
    initKeyboardEvents(this);
    initUiEvents(this);
    window.addEventListener('resize', () => this.updateCameraProjection());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateCameraProjection(), 120);
    });

    this.resetGame();
    this.animate();
  }

  updateCameraProjection(): void {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    const aspect = this.width / this.height;

    const maxExtent = this.gridSize * 1.45 + this.maxHeight * 0.72 + 2.0;
    let viewWidth: number;
    let viewHeight: number;
    if (aspect < 1.0) {
      viewWidth = (maxExtent * 1.18) / this.zoomFactor;
      viewHeight = viewWidth / aspect;
    } else {
      viewHeight = (maxExtent * 1.22) / this.zoomFactor;
      viewWidth = viewHeight * aspect;
    }

    this.camera.left = -viewWidth / 2;
    this.camera.right = viewWidth / 2;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  setZoom(delta: number, absolute = false): void {
    if (absolute) {
      this.zoomFactor = delta;
    } else {
      this.zoomFactor = Math.max(0.6, Math.min(2.8, this.zoomFactor + delta));
    }
    const zoomLabel = document.getElementById('btn-zoom-reset');
    if (zoomLabel) {
      zoomLabel.innerText = `${Math.round(this.zoomFactor * 10) / 10}x`;
    }
    this.updateCameraProjection();
  }

  updateCameraTransform(): void {
    const pitch = this.pitchAngles[this.pitchIndex].pitch;
    const radius = this.cameraDistance;
    this.camera.position.x = radius * Math.cos(pitch) * Math.sin(this.currentRotationY);
    this.camera.position.y = radius * Math.sin(pitch);
    this.camera.position.z = radius * Math.cos(pitch) * Math.cos(this.currentRotationY);
    this.camera.lookAt(0, -0.2, 0);
  }

  cyclePitchAngle(): void {
    sfx.playRotate();
    this.pitchIndex = (this.pitchIndex + 1) % this.pitchAngles.length;
    const pObj = this.pitchAngles[this.pitchIndex];
    const label = document.getElementById('pitch-label');
    if (label) label.innerText = pObj.name;
    this.updateCameraTransform();
  }

  toggleXRay(): void {
    this.isXRayActive = !this.isXRayActive;
    const label = document.getElementById('xray-label');
    const btn = document.getElementById('btn-xray');
    if (this.isXRayActive) {
      if (label) label.innerText = '透視 ON';
      if (btn)
        btn.className =
          'px-2 py-1 bg-purple-600 active:scale-95 text-white font-bold rounded-lg transition-all flex items-center gap-1 border border-purple-400 shadow';
    } else {
      if (label) label.innerText = '透視 OFF';
      if (btn)
        btn.className =
          'px-2 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-purple-300 font-bold rounded-lg transition-all flex items-center gap-1 border border-slate-700';
    }

    this.activeBlocks.forEach((b) => this.updateBlockMaterials(b));
  }

  updateBlockMaterials(block: Block): void {
    updateBlockMaterials(block, { isXRayActive: this.isXRayActive, isGameOver: this.isGameOver });
  }

  get3DNeighbors(block: Block): Block[] {
    return get3DNeighbors(block, this.board, this.gridSize, this.maxHeight);
  }

  resetGame(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timer = 0;
    this.timerInterval = null;
    this.updateTimerDisplay();

    this.isFirstClick = true;
    this.isGameOver = false;
    this.isGameWon = false;
    this.flagsPlaced = 0;
    this.revealedCount = 0;
    this.hoverBox.visible = false;
    this.hideNeighborHighlights();

    this.allMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.allMeshes = [];
    this.activeBlocks = [];
    this.board = [];

    const heightMap = generateProceduralHeights(this.gridSize, this.maxHeight);
    const offsetX = (this.gridSize - 1) / 2;
    const offsetZ = (this.gridSize - 1) / 2;
    const baseHeightOffset = ((this.maxHeight - 1) * 0.64) / 2;

    for (let x = 0; x < this.gridSize; x++) {
      this.board[x] = [];
      for (let y = 0; y < this.maxHeight; y++) {
        this.board[x][y] = [];
        for (let z = 0; z < this.gridSize; z++) {
          if (y < heightMap[x][z]) {
            const exposed = getExposedFaces(x, y, z, heightMap, this.gridSize);
            const hasExposedFace = exposed.px || exposed.nx || exposed.py || exposed.pz || exposed.nz;

            const mesh = new THREE.Mesh(this.boxGeometry, []);
            mesh.position.set(x - offsetX, y * 0.64 - baseHeightOffset, z - offsetZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const edgeGeo = new THREE.EdgesGeometry(this.boxGeometry);
            const edgeMat = new THREE.LineBasicMaterial({ color: 0x14100c, transparent: true, opacity: 0.55 });
            const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
            mesh.add(wireframe);

            const blockData: Block = {
              x,
              y,
              z,
              isMine: false,
              revealed: false,
              flagged: false,
              isExploded: false,
              neighborMines: 0,
              mesh,
              flagPin: null,
              exposedFaces: exposed,
              isActive: hasExposedFace,
            };

            mesh.userData = blockData;
            this.updateBlockMaterials(blockData);

            this.scene.add(mesh);
            this.allMeshes.push(mesh);
            this.board[x][y][z] = blockData;

            if (hasExposedFace) {
              this.activeBlocks.push(blockData);
            }
          } else {
            this.board[x][y][z] = null;
          }
        }
      }
    }

    this.activeMines = Math.min(this.activeMines, Math.floor(this.activeBlocks.length * 0.35));
    this.totalSafeBlocks = this.activeBlocks.length - this.activeMines;
    this.updateMineCounter();

    this.updateCameraProjection();

    const modal = document.getElementById('game-modal')!;
    modal.classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('modal-box')!.classList.add('scale-95');

    const banner = document.getElementById('observe-banner')!;
    banner.classList.add('opacity-0', '-translate-y-4');
    banner.classList.remove('opacity-100', 'translate-y-0');
  }

  // 初回クリック後の地雷配置 (初手＆その周囲を100%保証)
  populateMines(firstClickedBlock: Block): void {
    populateMinesLogic(firstClickedBlock, this.activeBlocks, this.board, this.gridSize, this.maxHeight, this.activeMines);
    this.startTimer();
  }

  startTimer(): void {
    if (this.timerInterval) return;
    this.timer = 0;
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay(): void {
    const mins = String(Math.floor(this.timer / 60)).padStart(2, '0');
    const secs = String(this.timer % 60).padStart(2, '0');
    document.getElementById('timer-display')!.innerText = `${mins}:${secs}`;
  }

  updateMineCounter(): void {
    const remaining = this.activeMines - this.flagsPlaced;
    const displayEl = document.getElementById('mine-counter')!;
    displayEl.innerText = remaining < 0 ? `-${String(Math.abs(remaining)).padStart(2, '0')}` : String(remaining).padStart(2, '0');
  }

  revealCell(block: Block | null): void {
    if (!block || !block.isActive || block.revealed || block.flagged || this.isGameOver) return;

    if (this.isFirstClick) {
      this.isFirstClick = false;
      this.populateMines(block);
    }

    if (block.isMine) {
      block.isExploded = true;
      this.gameOver(block);
      return;
    }

    block.revealed = true;
    this.revealedCount++;
    sfx.playDig();

    this.updateBlockMaterials(block);
    block.mesh.scale.set(0.93, 0.93, 0.93);

    // 周囲0マスの場合は3次元連鎖開放（フラッドフィル）
    if (block.neighborMines === 0) {
      const neighbors = this.get3DNeighbors(block);
      neighbors.forEach((neighbor) => {
        if (!neighbor.revealed && !neighbor.flagged) {
          this.revealCell(neighbor);
        }
      });
    }

    if (this.revealedCount >= this.totalSafeBlocks) {
      this.gameVictory();
    }
  }

  chordCell(block: Block | null): void {
    if (!block || !block.revealed || block.neighborMines === 0 || this.isGameOver) return;
    const neighbors = this.get3DNeighbors(block);
    const flaggedCount = neighbors.filter((n) => n.flagged).length;

    if (flaggedCount === block.neighborMines) {
      neighbors.forEach((n) => {
        if (!n.revealed && !n.flagged) {
          this.revealCell(n);
        }
      });
    }
  }

  toggleFlag(block: Block | null): void {
    if (!block || !block.isActive || block.revealed || this.isGameOver) return;
    sfx.playFlag();

    block.flagged = !block.flagged;
    if (block.flagged) {
      this.flagsPlaced++;
      if (!block.flagPin) {
        block.flagPin = createFlagPinMesh();
        block.mesh.add(block.flagPin);
      }
    } else {
      this.flagsPlaced--;
      if (block.flagPin) {
        block.mesh.remove(block.flagPin);
        block.flagPin = null;
      }
    }

    this.updateBlockMaterials(block);
    this.updateMineCounter();
  }

  showNeighborHighlights(block: Block): void {
    const neighbors = this.get3DNeighbors(block);
    this.hideNeighborHighlights();
    neighbors.forEach((n, idx) => {
      if (idx < this.neighborHighlighters.length) {
        const h = this.neighborHighlighters[idx];
        h.position.copy(n.mesh.position);
        h.visible = true;
      }
    });
  }

  hideNeighborHighlights(): void {
    this.neighborHighlighters.forEach((h) => (h.visible = false));
  }

  gameOver(explodedBlock: Block): void {
    this.isGameOver = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    sfx.playExplode();
    this.hideNeighborHighlights();

    let correctCount = 0;
    let wrongCount = 0;

    this.activeBlocks.forEach((b) => {
      if (b.flagged) {
        if (b.isMine) correctCount++;
        else wrongCount++;
      }
      this.updateBlockMaterials(b);
      if (b === explodedBlock) {
        b.mesh.scale.set(1.15, 1.15, 1.15);
      }
    });

    setTimeout(() => {
      this.showModal(false, correctCount, wrongCount);
    }, 850);
  }

  gameVictory(): void {
    this.isGameOver = true;
    this.isGameWon = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    sfx.playWin();
    this.hideNeighborHighlights();

    this.activeBlocks.forEach((b) => {
      if (b.isMine && !b.flagged) {
        b.flagged = true;
        if (!b.flagPin) {
          b.flagPin = createFlagPinMesh();
          b.mesh.add(b.flagPin);
        }
      }
      this.updateBlockMaterials(b);
    });

    this.flagsPlaced = this.activeMines;
    this.updateMineCounter();

    setTimeout(() => {
      this.showModal(true, this.activeMines, 0);
    }, 600);
  }

  showModal(isWin: boolean, correctFlags: number, wrongFlags: number): void {
    const modal = document.getElementById('game-modal')!;
    const modalBox = document.getElementById('modal-box')!;
    const icon = document.getElementById('modal-icon')!;
    const title = document.getElementById('modal-title')!;
    const desc = document.getElementById('modal-desc')!;
    const timeEl = document.getElementById('modal-time')!;
    const correctEl = document.getElementById('modal-correct-flags')!;
    const wrongEl = document.getElementById('modal-wrong-flags')!;

    if (isWin) {
      icon.innerText = '🏆';
      title.innerText = 'TACTICAL CLEAR!';
      title.className = 'text-xl sm:text-2xl font-black text-amber-300 mb-1 font-title';
      desc.innerText = '立体地形の全地雷を暴き、完全制圧を達成しました！';
    } else {
      icon.innerText = '💥';
      title.innerText = 'MISSION FAILED';
      title.className = 'text-xl sm:text-2xl font-black text-rose-500 mb-1 font-title';
      desc.innerText = '地雷が炸裂！盤面観察モードで配置を確認できます。';
    }

    timeEl.innerText = document.getElementById('timer-display')!.innerText;
    correctEl.innerText = `${correctFlags}/${this.activeMines}`;
    wrongEl.innerText = `${wrongFlags}`;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalBox.classList.remove('scale-95');
  }

  hideModalToObserve(): void {
    const modal = document.getElementById('game-modal')!;
    const modalBox = document.getElementById('modal-box')!;
    const banner = document.getElementById('observe-banner')!;

    modal.classList.add('opacity-0', 'pointer-events-none');
    modalBox.classList.add('scale-95');

    banner.classList.remove('opacity-0', '-translate-y-4');
    banner.classList.add('opacity-100', 'translate-y-0');
  }

  showModalFromObserve(): void {
    const modal = document.getElementById('game-modal')!;
    const modalBox = document.getElementById('modal-box')!;
    const banner = document.getElementById('observe-banner')!;

    banner.classList.add('opacity-0', '-translate-y-4');
    banner.classList.remove('opacity-100', 'translate-y-0');

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalBox.classList.remove('scale-95');
  }

  rotateCamera(direction: number): void {
    sfx.playRotate();
    this.targetRotationY += (direction * Math.PI) / 4;
  }

  getCellFromClientPos(clientX: number, clientY: number): Block | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const candidateMeshes = this.activeBlocks.map((b) => b.mesh);
    const intersects = this.raycaster.intersectObjects(candidateMeshes, false);

    if (intersects.length > 0) {
      const unrevealedHit = intersects.find((hit) => !(hit.object.userData as Block).revealed);
      return (unrevealedHit ? unrevealedHit.object.userData : intersects[0].object.userData) as Block;
    }
    return null;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());

    const diff = this.targetRotationY - this.currentRotationY;
    if (Math.abs(diff) > 0.001) {
      this.currentRotationY += diff * 0.14;
      this.updateCameraTransform();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
