
import { ItemId } from './gameConfig';

// アイテムデータの型定義
export interface ItemData {
  id: ItemId;
  name: string;
  description: string;
  icon: string;
  stackable: boolean;
  maxStack: number;
  usable: boolean;
  equipable: boolean;
  slot?: 'weapon' | 'shield' | 'item';
}

// アイテムデータベース
export const ITEMS: Record<ItemId, ItemData> = {
  [ItemId.SWORD]: {
    id: ItemId.SWORD,
    name: '勇者の剣',
    description: '伝説の勇者が使った剣',
    icon: '⚔️',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'weapon',
  },
  [ItemId.SHIELD]: {
    id: ItemId.SHIELD,
    name: '勇者の盾',
    description: '敵の攻撃を防ぐ頑丈な盾',
    icon: '🛡️',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'shield',
  },
  [ItemId.BOW]: {
    id: ItemId.BOW,
    name: '弓',
    description: '遠くの敵を攻撃できる',
    icon: '🏹',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'item',
  },
  [ItemId.BOMB]: {
    id: ItemId.BOMB,
    name: '爆弾',
    description: '壁や敵を吹き飛ばす',
    icon: '💣',
    stackable: true,
    maxStack: 30,
    usable: true,
    equipable: false,
  },
  [ItemId.HOOKSHOT]: {
    id: ItemId.HOOKSHOT,
    name: 'フックショット',
    description: '遠くの場所に移動できる',
    icon: '🪝',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'item',
  },
  [ItemId.BOOMERANG]: {
    id: ItemId.BOOMERANG,
    name: 'ブーメラン',
    description: '敵を気絶させる',
    icon: '🪃',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'item',
  },
  [ItemId.SLINGSHOT]: {
    id: ItemId.SLINGSHOT,
    name: 'パチンコ',
    description: '小さな石を飛ばす',
    icon: '🎯',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: true,
    slot: 'item',
  },
  [ItemId.HEART_CONTAINER]: {
    id: ItemId.HEART_CONTAINER,
    name: 'ハートの器',
    description: '最大体力が増える',
    icon: '❤️',
    stackable: false,
    maxStack: 1,
    usable: true,
    equipable: false,
  },
  [ItemId.MAGIC_JAR]: {
    id: ItemId.MAGIC_JAR,
    name: '魔法の壺',
    description: '魔力を回復する',
    icon: '🧪',
    stackable: true,
    maxStack: 4,
    usable: true,
    equipable: false,
  },
  [ItemId.KEY]: {
    id: ItemId.KEY,
    name: '小さな鍵',
    description: '扉を開けることができる',
    icon: '🔑',
    stackable: true,
    maxStack: 99,
    usable: false,
    equipable: false,
  },
  [ItemId.BOSS_KEY]: {
    id: ItemId.BOSS_KEY,
    name: 'ボスの鍵',
    description: 'ボス部屋の扉を開ける',
    icon: '🗝️',
    stackable: false,
    maxStack: 1,
    usable: false,
    equipable: false,
  },
};

// インベントリアイテム
export interface InventoryItem {
  itemId: ItemId;
  quantity: number;
}

// 初期インベントリ
export const INITIAL_INVENTORY: InventoryItem[] = [
  { itemId: ItemId.SWORD, quantity: 1 },
  { itemId: ItemId.SHIELD, quantity: 1 },
];

// ドロップアイテム設定
export interface ItemDrop {
  itemId: ItemId;
  chance: number; // 0-1
  minQuantity: number;
  maxQuantity: number;
}

// 敵のドロップテーブル
export const ENEMY_DROPS: Record<string, ItemDrop[]> = {
  slime: [
    { itemId: ItemId.MAGIC_JAR, chance: 0.1, minQuantity: 1, maxQuantity: 1 },
  ],
  skeleton: [
    { itemId: ItemId.BOMB, chance: 0.2, minQuantity: 1, maxQuantity: 3 },
  ],
  boss: [
    { itemId: ItemId.HEART_CONTAINER, chance: 1.0, minQuantity: 1, maxQuantity: 1 },
  ],
};
