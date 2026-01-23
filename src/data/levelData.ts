

// レベルデータの型定義
export interface LevelObject {
  id: string;
  type: 'ground' | 'tree' | 'rock' | 'building' | 'water' | 'bridge' | 'chest' | 'door' | 'wall' | 'switch' | 'hookshot_target';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  properties?: Record<string, unknown>;
}

export interface EnemySpawn {
  id: string;
  type: string;
  position: [number, number, number];
  patrolPoints?: [number, number, number][];
  respawn?: boolean;
  nightOnly?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  position: [number, number, number];
  rotation?: number;
  dialogue: string[];
}

export interface LevelData {
  id: string;
  name: string;
  objects: LevelObject[];
  enemies: EnemySpawn[];
  npcs: NPCData[];
  spawnPoint: [number, number, number];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

// メインフィールドデータ
export const MAIN_FIELD: LevelData = {
  id: 'main_field',
  name: 'ハイラル平原',
  spawnPoint: [0, 1, 0],
  bounds: {
    min: [-50, -10, -50],
    max: [50, 50, 50],
  },
  objects: [
    // 地面
    {
      id: 'ground_main',
      type: 'ground',
      position: [0, 0, 0],
      scale: [100, 1, 100],
      color: '#4a7c4e',
    },
    // 木々
    { id: 'tree_1', type: 'tree', position: [5, 0, 5] },
    { id: 'tree_2', type: 'tree', position: [-8, 0, 3] },
    { id: 'tree_3', type: 'tree', position: [12, 0, -7] },
    { id: 'tree_4', type: 'tree', position: [-15, 0, 10] },
    { id: 'tree_5', type: 'tree', position: [20, 0, 15] },
    { id: 'tree_6', type: 'tree', position: [-5, 0, -12] },
    { id: 'tree_7', type: 'tree', position: [8, 0, -18] },
    { id: 'tree_8', type: 'tree', position: [-20, 0, -8] },
    // 岩
    { id: 'rock_1', type: 'rock', position: [3, 0, -5], scale: [1.5, 1.5, 1.5] },
    { id: 'rock_2', type: 'rock', position: [-10, 0, -10], scale: [2, 2, 2] },
    { id: 'rock_3', type: 'rock', position: [15, 0, 8] },
    { id: 'rock_4', type: 'rock', position: [-18, 0, 15], scale: [1.8, 1.2, 1.5] },
    // 建物（村の家）
    {
      id: 'house_1',
      type: 'building',
      position: [-25, 0, -25],
      scale: [4, 4, 4],
      color: '#8B4513',
    },
    {
      id: 'house_2',
      type: 'building',
      position: [-30, 0, -20],
      scale: [3, 3, 3],
      color: '#A0522D',
    },
    // 水場
    {
      id: 'pond',
      type: 'water',
      position: [25, -0.3, 20],
      scale: [10, 0.5, 10],
    },
    // 宝箱
    {
      id: 'chest_1',
      type: 'chest',
      position: [10, 0.5, -15],
      properties: { itemId: 'bomb', quantity: 5 },
    },
    // ダンジョン入口
    {
      id: 'dungeon_door',
      type: 'door',
      position: [35, 0, 0],
      rotation: [0, -Math.PI / 2, 0],
      properties: { targetLevel: 'dungeon_1', locked: false },
    },
    // 水の神殿入口
    {
      id: 'water_temple_door',
      type: 'door',
      position: [-40, 0, -30],
      rotation: [0, Math.PI / 4, 0],
      properties: { targetLevel: 'water_temple', locked: false },
    },
  ],
  enemies: [
    // スライム - 基本的な敵
    {
      id: 'enemy_1',
      type: 'slime',
      position: [10, 0.5, 10],
      respawn: true,
    },
    {
      id: 'enemy_2',
      type: 'slime',
      position: [-5, 0.5, 8],
      respawn: true,
    },
    // スケルトン - 剣を持った骸骨
    {
      id: 'enemy_3',
      type: 'skeleton',
      position: [20, 0.5, -10],
      patrolPoints: [
        [20, 0.5, -10],
        [25, 0.5, -5],
        [20, 0.5, 0],
      ],
      respawn: true,
    },
    // リザルフォス - 俊敏なトカゲ戦士
    {
      id: 'enemy_lizalfos_1',
      type: 'lizalfos',
      position: [-25, 0.5, 20],
      patrolPoints: [
        [-25, 0.5, 20],
        [-30, 0.5, 25],
        [-20, 0.5, 22],
      ],
      respawn: true,
    },
    {
      id: 'enemy_lizalfos_2',
      type: 'lizalfos',
      position: [30, 0.5, -25],
      respawn: true,
    },
    // スタルフォス - 上級骸骨戦士
    {
      id: 'enemy_stalfos_1',
      type: 'stalfos',
      position: [-35, 0.5, -30],
      patrolPoints: [
        [-35, 0.5, -30],
        [-30, 0.5, -25],
      ],
      respawn: true,
    },
    // キース - 空飛ぶコウモリ
    {
      id: 'enemy_keese_1',
      type: 'keese',
      position: [15, 2, -20],
      respawn: true,
    },
    {
      id: 'enemy_keese_2',
      type: 'keese',
      position: [-15, 2, 25],
      respawn: true,
    },
    {
      id: 'enemy_keese_3',
      type: 'keese',
      position: [28, 2, 15],
      respawn: true,
    },
    // ゴースト - 夜のみ出現
    {
      id: 'enemy_ghost_1',
      type: 'ghost',
      position: [0, 1, -30],
      nightOnly: true,
      respawn: true,
    },
    {
      id: 'enemy_ghost_2',
      type: 'ghost',
      position: [-30, 1, 0],
      nightOnly: true,
      respawn: true,
    },
    {
      id: 'enemy_ghost_3',
      type: 'ghost',
      position: [35, 1, 28],
      nightOnly: true,
      respawn: true,
    },
    // デクババ - 植物の敵
    {
      id: 'enemy_deku_baba_1',
      type: 'deku_baba',
      position: [22, 0.5, 30],
      respawn: true,
    },
    {
      id: 'enemy_deku_baba_2',
      type: 'deku_baba',
      position: [-32, 0.5, 15],
      respawn: true,
    },
    // フリザド - 氷の精霊
    {
      id: 'enemy_frizzard_1',
      type: 'frizzard',
      position: [-40, 0.5, -35],
      respawn: true,
    },
  ],
  npcs: [
    {
      id: 'npc_elder',
      name: '村長',
      position: [-25, 0, -22],
      rotation: 0,
      dialogue: [
        'おお、勇者よ！よくぞ来てくれた。',
        'この村は最近、魔物に襲われて困っておる。',
        '東の洞窟に魔物の親玉がいるという噂じゃ。',
        'どうか、村を救ってくれ！',
      ],
    },
    {
      id: 'npc_merchant',
      name: '商人',
      position: [-30, 0, -17],
      rotation: Math.PI / 4,
      dialogue: [
        'いらっしゃい！何かお探しかね？',
        '今は品切れじゃが、また来てくれ。',
      ],
    },
  ],
};

// ダンジョン1データ
export const DUNGEON_1: LevelData = {
  id: 'dungeon_1',
  name: '始まりの洞窟',
  spawnPoint: [0, 1, 0],
  bounds: {
    min: [-20, -5, -20],
    max: [20, 15, 20],
  },
  objects: [
    // 床
    {
      id: 'dungeon_floor',
      type: 'ground',
      position: [0, 0, 0],
      scale: [30, 1, 30],
      color: '#3d3d3d',
    },
    // 宝箱
    {
      id: 'dungeon_chest_1',
      type: 'chest',
      position: [8, 0.5, -8],
      properties: { itemId: 'key', quantity: 1 },
    },
    // ボス部屋への扉
    {
      id: 'boss_door',
      type: 'door',
      position: [0, 0, -12],
      properties: { targetLevel: 'boss_room', locked: true, requiresKey: true },
    },
    // 出口
    {
      id: 'exit_door',
      type: 'door',
      position: [0, 0, 12],
      rotation: [0, Math.PI, 0],
      properties: { targetLevel: 'main_field' },
    },
  ],
  enemies: [
    {
      id: 'dungeon_enemy_1',
      type: 'skeleton',
      position: [5, 0.5, 0],
      respawn: false,
    },
    {
      id: 'dungeon_enemy_2',
      type: 'skeleton',
      position: [-5, 0.5, -5],
      respawn: false,
    },
  ],
  npcs: [],
};

// 水の神殿データ
export const WATER_TEMPLE: LevelData = {
  id: 'water_temple',
  name: '水の神殿',
  spawnPoint: [0, 1, 25],
  bounds: {
    min: [-40, -10, -40],
    max: [40, 20, 40],
  },
  objects: [
    // メインフロア
    {
      id: 'water_floor_main',
      type: 'ground',
      position: [0, 0, 0],
      scale: [60, 1, 60],
      color: '#1a4a6e',
    },
    // 水のプール（中央）
    {
      id: 'water_pool_center',
      type: 'water',
      position: [0, -1, 0],
      scale: [20, 2, 20],
    },
    // 水中通路
    {
      id: 'water_channel_1',
      type: 'water',
      position: [-25, -0.5, 0],
      scale: [10, 1, 30],
    },
    {
      id: 'water_channel_2',
      type: 'water',
      position: [25, -0.5, 0],
      scale: [10, 1, 30],
    },
    // 柱（装飾）
    {
      id: 'pillar_1',
      type: 'wall',
      position: [-15, 3, -15],
      scale: [2, 6, 2],
      color: '#2a5a7e',
    },
    {
      id: 'pillar_2',
      type: 'wall',
      position: [15, 3, -15],
      scale: [2, 6, 2],
      color: '#2a5a7e',
    },
    {
      id: 'pillar_3',
      type: 'wall',
      position: [-15, 3, 15],
      scale: [2, 6, 2],
      color: '#2a5a7e',
    },
    {
      id: 'pillar_4',
      type: 'wall',
      position: [15, 3, 15],
      scale: [2, 6, 2],
      color: '#2a5a7e',
    },
    // 外壁
    {
      id: 'water_wall_north',
      type: 'wall',
      position: [0, 5, -30],
      scale: [60, 10, 2],
      color: '#1a3a5e',
    },
    {
      id: 'water_wall_south',
      type: 'wall',
      position: [0, 5, 30],
      scale: [60, 10, 2],
      color: '#1a3a5e',
    },
    {
      id: 'water_wall_east',
      type: 'wall',
      position: [30, 5, 0],
      scale: [2, 10, 60],
      color: '#1a3a5e',
    },
    {
      id: 'water_wall_west',
      type: 'wall',
      position: [-30, 5, 0],
      scale: [2, 10, 60],
      color: '#1a3a5e',
    },
    // 宝箱 - ダンジョンマップ
    {
      id: 'water_chest_map',
      type: 'chest',
      position: [-20, 0.5, -20],
      properties: { itemId: 'dungeon_map', quantity: 1 },
    },
    // 宝箱 - コンパス
    {
      id: 'water_chest_compass',
      type: 'chest',
      position: [20, 0.5, -20],
      properties: { itemId: 'compass', quantity: 1 },
    },
    // 宝箱 - ボス鍵
    {
      id: 'water_chest_boss_key',
      type: 'chest',
      position: [0, 0.5, -25],
      properties: { itemId: 'key', quantity: 1 },
    },
    // 宝箱 - 氷の矢
    {
      id: 'water_chest_ice_arrow',
      type: 'chest',
      position: [-25, 0.5, 10],
      properties: { itemId: 'ice_arrow', quantity: 10 },
    },
    // ボス部屋への扉
    {
      id: 'water_boss_door',
      type: 'door',
      position: [0, 0, -28],
      properties: { targetLevel: 'water_boss', locked: true, requiresKey: true },
    },
    // 出口
    {
      id: 'water_exit',
      type: 'door',
      position: [0, 0, 28],
      rotation: [0, Math.PI, 0],
      properties: { targetLevel: 'main_field' },
    },
    // スイッチ（水位変更用）
    {
      id: 'water_switch_1',
      type: 'switch',
      position: [-20, 0.3, 0],
      properties: { activates: 'water_level_1' },
    },
    {
      id: 'water_switch_2',
      type: 'switch',
      position: [20, 0.3, 0],
      properties: { activates: 'water_level_2' },
    },
    // 中央の島（フックショット用のポイント）
    {
      id: 'center_platform',
      type: 'ground',
      position: [0, 1, 0],
      scale: [8, 0.5, 8],
      color: '#3a6a8e',
    },
    // フックショットポイント
    {
      id: 'hookshot_point_1',
      type: 'hookshot_target',
      position: [0, 4, -15],
    },
    {
      id: 'hookshot_point_2',
      type: 'hookshot_target',
      position: [-15, 4, 0],
    },
    {
      id: 'hookshot_point_3',
      type: 'hookshot_target',
      position: [15, 4, 0],
    },
  ],
  enemies: [
    // フリザド - 氷の精霊（水の神殿のメイン敵）
    {
      id: 'water_frizzard_1',
      type: 'frizzard',
      position: [-10, 0.5, -10],
      respawn: false,
    },
    {
      id: 'water_frizzard_2',
      type: 'frizzard',
      position: [10, 0.5, -10],
      respawn: false,
    },
    {
      id: 'water_frizzard_3',
      type: 'frizzard',
      position: [0, 0.5, 10],
      respawn: false,
    },
    // リザルフォス - 水辺に生息
    {
      id: 'water_lizalfos_1',
      type: 'lizalfos',
      position: [-22, 0.5, 15],
      patrolPoints: [
        [-22, 0.5, 15],
        [-22, 0.5, -15],
      ],
      respawn: false,
    },
    {
      id: 'water_lizalfos_2',
      type: 'lizalfos',
      position: [22, 0.5, -15],
      patrolPoints: [
        [22, 0.5, -15],
        [22, 0.5, 15],
      ],
      respawn: false,
    },
    // キース - 天井近くを飛ぶ
    {
      id: 'water_keese_1',
      type: 'keese',
      position: [-12, 3, 8],
      respawn: false,
    },
    {
      id: 'water_keese_2',
      type: 'keese',
      position: [12, 3, 8],
      respawn: false,
    },
    {
      id: 'water_keese_3',
      type: 'keese',
      position: [0, 3, -18],
      respawn: false,
    },
    // スケルトン - 守護者
    {
      id: 'water_skeleton_1',
      type: 'skeleton',
      position: [0, 0.5, -22],
      respawn: false,
    },
  ],
  npcs: [],
};

// レベルマップ
export const LEVELS: Record<string, LevelData> = {
  main_field: MAIN_FIELD,
  dungeon_1: DUNGEON_1,
  water_temple: WATER_TEMPLE,
};

// 現在のレベルを取得
export const getLevel = (levelId: string): LevelData | undefined => {
  return LEVELS[levelId];
};
