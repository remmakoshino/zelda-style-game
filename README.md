# Legend of Adventure 〜時を超える勇者〜

ゼルダの伝説 時のオカリナにインスパイアされた3Dアクションアドベンチャーゲームです。

## 🎮 プレイ

**[ゲームをプレイする](https://your-username.github.io/zelda-style-game/)**

## ✨ 特徴

- **3D箱庭探索**: 広大なフィールドを自由に探索
- **アクション戦闘**: 剣での攻撃、盾での防御、ローリング回避
- **マルチデバイス対応**: PC、スマートフォン、タブレットに対応
- **セーブシステム**: LocalStorageを使用した複数スロットのセーブ機能
- **NPCとの会話**: ストーリーを進めるためのダイアログシステム

## 🎯 操作方法

### PC（キーボード＆マウス）

| キー | アクション |
|------|----------|
| WASD / 矢印キー | 移動 |
| スペース | ジャンプ |
| Shift | ローリング回避 |
| マウス左クリック | 攻撃 |
| マウス右クリック | 防御 |
| E | 話す/調べる |
| Q | ターゲットロック |
| 1-5 | アイテム切り替え |
| ESC / P | ポーズ |
| マウス中ボタンドラッグ | カメラ回転 |
| マウスホイール | ズーム |

### スマートフォン / タブレット

- **左側のバーチャルジョイスティック**: 移動
- **右側のボタン**: 攻撃、ジャンプ、防御、回避
- **画面右半分をスワイプ**: カメラ回転
- **Aボタン**: 話す/調べる

## 🛠️ 技術スタック

- **フロントエンド**: React 18+ with TypeScript
- **3Dエンジン**: Three.js with @react-three/fiber
- **状態管理**: Zustand
- **ビルドツール**: Vite
- **デプロイ**: GitHub Pages with GitHub Actions

## 🚀 開発環境のセットアップ

### 必要条件

- Node.js 18.0以上
- npm 9.0以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/zelda-style-game.git
cd zelda-style-game

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてゲームをプレイできます。

### ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📁 プロジェクト構成

```
zelda-style-game/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions設定
├── public/                      # 静的ファイル
├── src/
│   ├── components/
│   │   ├── Game.tsx            # メインゲームコンポーネント
│   │   ├── TitleScreen.tsx     # タイトル画面
│   │   ├── UI/
│   │   │   ├── HUD.tsx         # ヘッドアップディスプレイ
│   │   │   └── Controls.tsx    # 仮想コントローラー
│   │   └── World/
│   │       ├── Player.tsx      # プレイヤー
│   │       ├── Enemy.tsx       # 敵キャラ
│   │       ├── NPC.tsx         # NPC
│   │       ├── Environment.tsx # 環境オブジェクト
│   │       └── CameraController.tsx # カメラ制御
│   ├── stores/
│   │   └── gameStore.ts        # ゲーム状態管理
│   ├── systems/
│   │   └── SaveSystem.ts       # セーブシステム
│   ├── hooks/
│   │   ├── useInputManager.ts  # 入力管理
│   │   └── useDeviceDetection.ts # デバイス検出
│   ├── data/
│   │   ├── gameConfig.ts       # ゲーム設定
│   │   ├── levelData.ts        # レベルデータ
│   │   └── itemsData.ts        # アイテムデータ
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 ゲームシステム

### プレイヤー

- **体力（ハート）**: 初期は3つ（6HP）
- **魔力**: 魔法アイテム使用に必要
- **装備**: 剣、盾、サブアイテム

### 敵

- **スライム**: 基本的な敵、HP2
- **スケルトン**: 武器を持つ敵、HP4

### アイテム

- 剣、盾（基本装備）
- 爆弾、弓、ブーメランなど（サブアイテム）
- 回復アイテム

## 🔧 カスタマイズ

### ゲーム設定の変更

`src/data/gameConfig.ts` でゲームのパラメータを調整できます：

```typescript
export const GAME_CONFIG = {
  player: {
    moveSpeed: 5,      // 移動速度
    jumpForce: 8,      // ジャンプ力
    maxHealth: 6,      // 最大体力
    // ...
  },
  // ...
};
```

### レベルデザイン

`src/data/levelData.ts` でマップのオブジェクト配置を編集できます。

## 📱 対応ブラウザ

- Chrome（最新版）
- Safari（最新版）
- Firefox（最新版）
- Edge（最新版）
- iOS Safari
- Android Chrome

## 🚀 デプロイ

GitHub Actionsにより、`main`ブランチへのプッシュで自動的にGitHub Pagesにデプロイされます。

### 手動デプロイ

1. GitHubリポジトリの Settings > Pages を開く
2. Source を「GitHub Actions」に設定
3. `main`ブランチにプッシュ

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## 🙏 クレジット

- ゲームシステムは『ゼルダの伝説 時のオカリナ』にインスパイアされています
- このゲームはファンメイドのオリジナル作品です
- 任天堂の公式作品ではありません

## 📞 お問い合わせ

バグ報告や機能リクエストはGitHub Issuesでお願いします。

---

**楽しんでプレイしてください！ ⚔️🛡️**
