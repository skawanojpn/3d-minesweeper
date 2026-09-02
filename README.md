# Minesweeper 3D

アイソメトリック（クォータービュー）の立体高低差マップと、クラシックパズルのマインスイーパーを融合させた3D推論パズルゲーム。

仕様の詳細は [CLAUDE.md](./CLAUDE.md) を参照。

## 公開URL

https://skawanojpn.github.io/3d-minesweeper/

`main` ブランチへの push で GitHub Actions が自動ビルド・デプロイする。

## 開発

```bash
npm install
npm run dev        # 開発サーバー起動 (http://localhost:5173)
npm run build      # dist/index.html に単一HTMLとしてビルド
npm run preview    # ビルド成果物をローカルでプレビュー
```

### 品質チェック

```bash
npx tsc --noEmit   # 型チェック
npm run lint       # ESLint
npm run format     # Prettier (自動整形)
npm run format:check
npm run test       # Vitest (一括実行)
npm run test:watch # Vitest (watchモード)
```

`main` への push・PR で `CI` ワークフローが上記チェックとビルドを自動実行する。

## 技術構成

- **ビルド**: Vite + [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile)（全アセットをインライン化し、配布物は単一HTMLになる）
- **言語**: TypeScript
- **3D描画**: Three.js（`OrthographicCamera` による等角投影）
- **スタイリング**: Tailwind CSS (CDN) + Google Fonts
- **音響**: Web Audio API によるプロシージャル効果音

## ディレクトリ構成

```
src/
├── main.ts                 # エントリポイント
├── audio/SoundFX.ts         # 効果音シンセサイザー
├── textures/                # Canvas APIによるテクスチャ生成(数字・フラグ・地雷・ブロック)
├── terrain/generateHeights.ts  # プロシージャル地形生成
├── game/
│   ├── VoxelMinesweeperGame.ts # メインゲームクラス
│   ├── board.ts                 # 露出面判定・26近傍探索
│   ├── mines.ts                  # 地雷配置ロジック
│   └── types.ts                   # 型定義
├── render/                   # マテリアル更新・3Dフラグピン生成
└── input/                    # ポインタ・タッチ・キーボード・UIイベント
```

`legacy/index.html` は Vite 移行前の単一HTML実装（履歴保管用、動作対象外）。

## テスト

`src/game/board.ts`（露出面判定・26近傍探索）、`src/game/mines.ts`（初手安全保証つき地雷配置）、
`src/terrain/generateHeights.ts`（地形生成）に対して Vitest で単体テストを実装している。
`VoxelMinesweeperGame` クラス本体（Three.js の WebGL 初期化を伴う）は対象外。
