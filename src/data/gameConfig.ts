// ゲーム設定
export const GAME_CONFIG = {
  // プレイヤー設定
  player: {
    moveSpeed: 5,
    runSpeed: 8,
    jumpForce: 8,
    gravity: 20,
    rotationSpeed: 10,
    maxHealth: 6, // ハート3つ（1ハート=2HP）
    maxMagic: 100,
    attackDamage: 2,
    attackRange: 3.5,
    attackCooldown: 0.4,
    rollSpeed: 10,
    rollDuration: 0.5,
    invincibilityTime: 1.5,
  },

  // カメラ設定
  camera: {
    distance: 8,
    minDistance: 3,
    maxDistance: 15,
    height: 3,
    rotationSpeed: 0.003,
    followSpeed: 5,
    lockOnDistance: 10,
  },

  // ワールド設定
  world: {
    groundSize: 100,
    dayDuration: 300, // 秒
  },

  // UI設定
  ui: {
    heartSize: 32,
    magicBarWidth: 150,
    magicBarHeight: 12,
  },

  // セーブ設定
  save: {
    autoSaveInterval: 60, // 秒
    maxSlots: 3,
    storageKey: 'zelda-style-game-save',
  },
};

// アイテムID
export const ItemId = {
  SWORD: 'sword',
  SHIELD: 'shield',
  BOW: 'bow',
  BOMB: 'bomb',
  HOOKSHOT: 'hookshot',
  BOOMERANG: 'boomerang',
  SLINGSHOT: 'slingshot',
  HEART_CONTAINER: 'heart_container',
  MAGIC_JAR: 'magic_jar',
  KEY: 'key',
  BOSS_KEY: 'boss_key',
} as const;

export type ItemId = typeof ItemId[keyof typeof ItemId];

// ゲームステート
export const GameState = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  DIALOGUE: 'dialogue',
  CUTSCENE: 'cutscene',
  GAME_OVER: 'game_over',
  LOADING: 'loading',
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

// デバイスタイプ
export const DeviceType = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];
