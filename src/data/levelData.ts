

// レベルデータの型定義
export interface LevelObject {
  id: string;
  type: 'ground' | 'tree' | 'rock' | 'building' | 'water' | 'bridge' | 'chest' | 'door';
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
  respawn: boolean;
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
  ],
  enemies: [
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

// レベルマップ
export const LEVELS: Record<string, LevelData> = {
  main_field: MAIN_FIELD,
  dungeon_1: DUNGEON_1,
};

// 現在のレベルを取得
export const getLevel = (levelId: string): LevelData | undefined => {
  return LEVELS[levelId];
};
