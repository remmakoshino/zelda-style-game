import * as THREE from 'three';
import { GAME_CONFIG } from '../data/gameConfig';
import { useGameStore } from '../stores/gameStore';

// セーブデータの型
export interface SaveData {
  version: string;
  timestamp: number;
  playTime: number;
  player: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    health: number;
    maxHealth: number;
    magic: number;
    maxMagic: number;
    inventory: Array<{ itemId: string; quantity: number }>;
    equippedItem: string | null;
    rupees: number;
  };
  world: {
    currentLevel: string;
    timeOfDay: number;
    enemiesDefeated: string[];
    chestsOpened: string[];
    flags: Record<string, boolean>;
    npcsInteracted: string[];
  };
}

// セーブスロット情報
export interface SaveSlotInfo {
  slot: number;
  exists: boolean;
  timestamp: number;
  playTime: number;
  playerHealth: number;
  playerMaxHealth: number;
  currentLevel: string;
}

const SAVE_VERSION = '1.0.0';
const STORAGE_KEY = GAME_CONFIG.save.storageKey;

// セーブシステムクラス
export class SaveSystem {
  // セーブデータを保存
  static save(slot: number): boolean {
    try {
      const state = useGameStore.getState();
      
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        playTime: 0, // TODO: 実際のプレイ時間を追跡
        player: {
          position: {
            x: state.player.position.x,
            y: state.player.position.y,
            z: state.player.position.z,
          },
          rotation: {
            x: state.player.rotation.x,
            y: state.player.rotation.y,
            z: state.player.rotation.z,
          },
          health: state.player.health,
          maxHealth: state.player.maxHealth,
          magic: state.player.magic,
          maxMagic: state.player.maxMagic,
          inventory: state.player.inventory.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
          equippedItem: state.player.equippedItem,
          rupees: state.player.rupees,
        },
        world: {
          currentLevel: state.world.currentLevel,
          timeOfDay: state.world.timeOfDay,
          enemiesDefeated: state.world.enemiesDefeated,
          chestsOpened: state.world.chestsOpened,
          flags: state.world.flags,
          npcsInteracted: state.world.npcsInteracted,
        },
      };
      
      const key = `${STORAGE_KEY}_slot_${slot}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      
      console.log(`Game saved to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }
  
  // セーブデータを読み込み
  static load(slot: number): SaveData | null {
    try {
      const key = `${STORAGE_KEY}_slot_${slot}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log(`No save data found in slot ${slot}`);
        return null;
      }
      
      const saveData: SaveData = JSON.parse(data);
      
      // バージョンチェック
      if (!this.isCompatible(saveData.version)) {
        console.warn(`Save data version ${saveData.version} may not be compatible`);
      }
      
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }
  
  // セーブデータからゲーム状態を復元
  static restoreFromSave(saveData: SaveData): void {
    const store = useGameStore.getState();
    
    // プレイヤー状態を復元
    store.setPlayerPosition(
      new THREE.Vector3(
        saveData.player.position.x,
        saveData.player.position.y,
        saveData.player.position.z
      )
    );
    store.setPlayerRotation(
      new THREE.Euler(
        saveData.player.rotation.x,
        saveData.player.rotation.y,
        saveData.player.rotation.z
      )
    );
    store.setPlayerHealth(saveData.player.health);
    store.setPlayerMagic(saveData.player.magic);
    
    // インベントリを復元
    saveData.player.inventory.forEach((item) => {
      store.addItem(item.itemId as any, item.quantity);
    });
    
    if (saveData.player.equippedItem) {
      store.setEquippedItem(saveData.player.equippedItem as any);
    }
    
    store.addRupees(saveData.player.rupees);
    
    // ワールド状態を復元
    store.setCurrentLevel(saveData.world.currentLevel);
    saveData.world.enemiesDefeated.forEach((id) => store.defeatEnemy(id));
    saveData.world.chestsOpened.forEach((id) => store.openChest(id));
    Object.entries(saveData.world.flags).forEach(([flag, value]) => {
      store.setFlag(flag, value);
    });
    saveData.world.npcsInteracted.forEach((id) => store.interactWithNPC(id));
  }
  
  // セーブスロット情報を取得
  static getSlotInfo(slot: number): SaveSlotInfo {
    const saveData = this.load(slot);
    
    if (!saveData) {
      return {
        slot,
        exists: false,
        timestamp: 0,
        playTime: 0,
        playerHealth: 0,
        playerMaxHealth: 0,
        currentLevel: '',
      };
    }
    
    return {
      slot,
      exists: true,
      timestamp: saveData.timestamp,
      playTime: saveData.playTime,
      playerHealth: saveData.player.health,
      playerMaxHealth: saveData.player.maxHealth,
      currentLevel: saveData.world.currentLevel,
    };
  }
  
  // 全スロット情報を取得
  static getAllSlotInfo(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];
    for (let i = 0; i < GAME_CONFIG.save.maxSlots; i++) {
      slots.push(this.getSlotInfo(i));
    }
    return slots;
  }
  
  // セーブデータを削除
  static delete(slot: number): boolean {
    try {
      const key = `${STORAGE_KEY}_slot_${slot}`;
      localStorage.removeItem(key);
      console.log(`Save slot ${slot} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }
  
  // バージョン互換性チェック
  static isCompatible(version: string): boolean {
    const [major] = version.split('.');
    const [currentMajor] = SAVE_VERSION.split('.');
    return major === currentMajor;
  }
  
  // オートセーブ
  static autoSave(): boolean {
    const state = useGameStore.getState();
    return this.save(state.saveSlot);
  }
}

// オートセーブフック
export const useAutoSave = () => {
  // オートセーブのインターバル設定
  // useEffectで呼び出す
};

export default SaveSystem;
