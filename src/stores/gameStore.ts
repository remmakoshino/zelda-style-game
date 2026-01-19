import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import { GameState, GAME_CONFIG, ItemId } from '../data/gameConfig';
import type { InventoryItem } from '../data/itemsData';
import { INITIAL_INVENTORY } from '../data/itemsData';

// プレイヤーの状態
export interface PlayerState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  health: number;
  maxHealth: number;
  magic: number;
  maxMagic: number;
  isGrounded: boolean;
  isAttacking: boolean;
  isDefending: boolean;
  isRolling: boolean;
  isInvincible: boolean;
  targetLocked: boolean;
  targetEnemy: string | null;
  inventory: InventoryItem[];
  equippedItem: ItemId | null;
  rupees: number;
}

// ワールドの状態
export interface WorldState {
  currentLevel: string;
  timeOfDay: number; // 0-1, 0=midnight, 0.5=noon
  enemiesDefeated: string[];
  chestsOpened: string[];
  flags: Record<string, boolean>;
  npcsInteracted: string[];
}

// ゲーム全体の状態
export interface GameStore {
  // ゲーム状態
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  // プレイヤー
  player: PlayerState;
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerRotation: (rotation: THREE.Euler) => void;
  setPlayerVelocity: (velocity: THREE.Vector3) => void;
  setPlayerHealth: (health: number) => void;
  setPlayerMagic: (magic: number) => void;
  setPlayerGrounded: (grounded: boolean) => void;
  setPlayerAttacking: (attacking: boolean) => void;
  setPlayerDefending: (defending: boolean) => void;
  setPlayerRolling: (rolling: boolean) => void;
  setPlayerInvincible: (invincible: boolean) => void;
  setTargetLocked: (locked: boolean, enemyId?: string | null) => void;
  addItem: (itemId: ItemId, quantity?: number) => void;
  removeItem: (itemId: ItemId, quantity?: number) => void;
  setEquippedItem: (itemId: ItemId | null) => void;
  addRupees: (amount: number) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  
  // ワールド
  world: WorldState;
  setCurrentLevel: (level: string) => void;
  advanceTime: (delta: number) => void;
  defeatEnemy: (enemyId: string) => void;
  openChest: (chestId: string) => void;
  setFlag: (flag: string, value: boolean) => void;
  interactWithNPC: (npcId: string) => void;
  
  // UI状態
  showMenu: boolean;
  toggleMenu: () => void;
  dialogueText: string[];
  dialogueIndex: number;
  setDialogue: (text: string[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;
  
  // セーブ/ロード
  saveSlot: number;
  setSaveSlot: (slot: number) => void;
  
  // リセット
  resetGame: () => void;
  initializeFromSave: (data: Partial<GameStore>) => void;
}

// 初期プレイヤー状態
const initialPlayerState: PlayerState = {
  position: new THREE.Vector3(0, 1, 0),
  rotation: new THREE.Euler(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  health: GAME_CONFIG.player.maxHealth,
  maxHealth: GAME_CONFIG.player.maxHealth,
  magic: GAME_CONFIG.player.maxMagic,
  maxMagic: GAME_CONFIG.player.maxMagic,
  isGrounded: false,
  isAttacking: false,
  isDefending: false,
  isRolling: false,
  isInvincible: false,
  targetLocked: false,
  targetEnemy: null,
  inventory: [...INITIAL_INVENTORY],
  equippedItem: ItemId.SWORD,
  rupees: 0,
};

// 初期ワールド状態
const initialWorldState: WorldState = {
  currentLevel: 'main_field',
  timeOfDay: 0.25, // 朝6時
  enemiesDefeated: [],
  chestsOpened: [],
  flags: {},
  npcsInteracted: [],
};

// ゲームストア
export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // ゲーム状態
    gameState: GameState.TITLE,
    setGameState: (state) => set({ gameState: state }),
    
    // プレイヤー
    player: { ...initialPlayerState },
    setPlayerPosition: (position) =>
      set((state) => ({ player: { ...state.player, position: position.clone() } })),
    setPlayerRotation: (rotation) =>
      set((state) => ({ player: { ...state.player, rotation: rotation.clone() } })),
    setPlayerVelocity: (velocity) =>
      set((state) => ({ player: { ...state.player, velocity: velocity.clone() } })),
    setPlayerHealth: (health) =>
      set((state) => ({
        player: { ...state.player, health: Math.max(0, Math.min(health, state.player.maxHealth)) },
      })),
    setPlayerMagic: (magic) =>
      set((state) => ({
        player: { ...state.player, magic: Math.max(0, Math.min(magic, state.player.maxMagic)) },
      })),
    setPlayerGrounded: (grounded) =>
      set((state) => ({ player: { ...state.player, isGrounded: grounded } })),
    setPlayerAttacking: (attacking) =>
      set((state) => ({ player: { ...state.player, isAttacking: attacking } })),
    setPlayerDefending: (defending) =>
      set((state) => ({ player: { ...state.player, isDefending: defending } })),
    setPlayerRolling: (rolling) =>
      set((state) => ({ player: { ...state.player, isRolling: rolling } })),
    setPlayerInvincible: (invincible) =>
      set((state) => ({ player: { ...state.player, isInvincible: invincible } })),
    setTargetLocked: (locked, enemyId = null) =>
      set((state) => ({
        player: { ...state.player, targetLocked: locked, targetEnemy: locked ? enemyId : null },
      })),
    addItem: (itemId, quantity = 1) =>
      set((state) => {
        const inventory = [...state.player.inventory];
        const existingItem = inventory.find((item) => item.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          inventory.push({ itemId, quantity });
        }
        return { player: { ...state.player, inventory } };
      }),
    removeItem: (itemId, quantity = 1) =>
      set((state) => {
        const inventory = state.player.inventory
          .map((item) => {
            if (item.itemId === itemId) {
              return { ...item, quantity: item.quantity - quantity };
            }
            return item;
          })
          .filter((item) => item.quantity > 0);
        return { player: { ...state.player, inventory } };
      }),
    setEquippedItem: (itemId) =>
      set((state) => ({ player: { ...state.player, equippedItem: itemId } })),
    addRupees: (amount) =>
      set((state) => ({ player: { ...state.player, rupees: state.player.rupees + amount } })),
    takeDamage: (damage) => {
      const state = get();
      if (state.player.isInvincible || state.player.isDefending) return;
      
      const newHealth = Math.max(0, state.player.health - damage);
      set((s) => ({
        player: { ...s.player, health: newHealth, isInvincible: true },
      }));
      
      // 無敵時間の終了
      setTimeout(() => {
        set((s) => ({ player: { ...s.player, isInvincible: false } }));
      }, GAME_CONFIG.player.invincibilityTime * 1000);
      
      // ゲームオーバー判定
      if (newHealth <= 0) {
        set({ gameState: GameState.GAME_OVER });
      }
    },
    heal: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          health: Math.min(state.player.health + amount, state.player.maxHealth),
        },
      })),
    
    // ワールド
    world: { ...initialWorldState },
    setCurrentLevel: (level) =>
      set((state) => ({ world: { ...state.world, currentLevel: level } })),
    advanceTime: (delta) =>
      set((state) => ({
        world: { ...state.world, timeOfDay: (state.world.timeOfDay + delta) % 1 },
      })),
    defeatEnemy: (enemyId) =>
      set((state) => ({
        world: {
          ...state.world,
          enemiesDefeated: [...state.world.enemiesDefeated, enemyId],
        },
      })),
    openChest: (chestId) =>
      set((state) => ({
        world: { ...state.world, chestsOpened: [...state.world.chestsOpened, chestId] },
      })),
    setFlag: (flag, value) =>
      set((state) => ({
        world: { ...state.world, flags: { ...state.world.flags, [flag]: value } },
      })),
    interactWithNPC: (npcId) =>
      set((state) => ({
        world: {
          ...state.world,
          npcsInteracted: state.world.npcsInteracted.includes(npcId)
            ? state.world.npcsInteracted
            : [...state.world.npcsInteracted, npcId],
        },
      })),
    
    // UI状態
    showMenu: false,
    toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),
    dialogueText: [],
    dialogueIndex: 0,
    setDialogue: (text) =>
      set({ dialogueText: text, dialogueIndex: 0, gameState: GameState.DIALOGUE }),
    advanceDialogue: () =>
      set((state) => {
        if (state.dialogueIndex < state.dialogueText.length - 1) {
          return { dialogueIndex: state.dialogueIndex + 1 };
        }
        return { dialogueText: [], dialogueIndex: 0, gameState: GameState.PLAYING };
      }),
    closeDialogue: () =>
      set({ dialogueText: [], dialogueIndex: 0, gameState: GameState.PLAYING }),
    
    // セーブ/ロード
    saveSlot: 0,
    setSaveSlot: (slot) => set({ saveSlot: slot }),
    
    // リセット
    resetGame: () =>
      set({
        player: {
          ...initialPlayerState,
          position: new THREE.Vector3(0, 1, 0),
          rotation: new THREE.Euler(0, 0, 0),
          velocity: new THREE.Vector3(0, 0, 0),
        },
        world: { ...initialWorldState },
        gameState: GameState.PLAYING,
        showMenu: false,
        dialogueText: [],
        dialogueIndex: 0,
      }),
    initializeFromSave: (data) =>
      set((state) => ({
        ...state,
        ...data,
        gameState: GameState.PLAYING,
      })),
  }))
);
