import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameState, GAME_CONFIG } from '../data/gameConfig';
import { useDeviceDetection } from './useDeviceDetection';

// 入力状態の型
export interface InputState {
  // 移動
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  
  // アクション
  jump: boolean;
  attack: boolean;
  defend: boolean;
  roll: boolean;
  interact: boolean;
  
  // カメラ
  cameraRotateX: number;
  cameraRotateY: number;
  
  // システム
  pause: boolean;
  targetLock: boolean;
  
  // アイテム
  useItem: boolean;
  itemSlot: number;
  
  // タッチ入力（バーチャルジョイスティック）
  touchMoveX: number;
  touchMoveY: number;
}

// 初期入力状態
const initialInputState: InputState = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  jump: false,
  attack: false,
  defend: false,
  roll: false,
  interact: false,
  cameraRotateX: 0,
  cameraRotateY: 0,
  pause: false,
  targetLock: false,
  useItem: false,
  itemSlot: -1,
  touchMoveX: 0,
  touchMoveY: 0,
};

// 入力マネージャーフック
export const useInputManager = () => {
  const { deviceType, isTouchDevice } = useDeviceDetection();
  const gameState = useGameStore((state) => state.gameState);
  const inputStateRef = useRef<InputState>({ ...initialInputState });
  const keysPressed = useRef<Set<string>>(new Set());
  
  // キーダウンハンドラー
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== GameState.PLAYING) return;
    
    const key = event.key.toLowerCase();
    keysPressed.current.add(key);
    
    // 移動
    if (key === 'w' || key === 'arrowup') inputStateRef.current.moveForward = true;
    if (key === 's' || key === 'arrowdown') inputStateRef.current.moveBackward = true;
    if (key === 'a' || key === 'arrowleft') inputStateRef.current.moveLeft = true;
    if (key === 'd' || key === 'arrowright') inputStateRef.current.moveRight = true;
    
    // アクション
    if (key === ' ') {
      inputStateRef.current.jump = true;
      event.preventDefault();
    }
    if (key === 'shift') inputStateRef.current.roll = true;
    if (key === 'e') inputStateRef.current.interact = true;
    if (key === 'q') inputStateRef.current.targetLock = true;
    if (key === 'r') inputStateRef.current.useItem = true;
    
    // ポーズ
    if (key === 'escape' || key === 'p') {
      inputStateRef.current.pause = true;
    }
    
    // アイテムスロット
    if (key >= '1' && key <= '5') {
      inputStateRef.current.itemSlot = parseInt(key) - 1;
    }
  }, [gameState]);
  
  // キーアップハンドラー
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    keysPressed.current.delete(key);
    
    // 移動
    if (key === 'w' || key === 'arrowup') inputStateRef.current.moveForward = false;
    if (key === 's' || key === 'arrowdown') inputStateRef.current.moveBackward = false;
    if (key === 'a' || key === 'arrowleft') inputStateRef.current.moveLeft = false;
    if (key === 'd' || key === 'arrowright') inputStateRef.current.moveRight = false;
    
    // アクション
    if (key === ' ') inputStateRef.current.jump = false;
    if (key === 'shift') inputStateRef.current.roll = false;
    if (key === 'e') inputStateRef.current.interact = false;
    if (key === 'q') inputStateRef.current.targetLock = false;
    if (key === 'r') inputStateRef.current.useItem = false;
    
    // ポーズ
    if (key === 'escape' || key === 'p') {
      inputStateRef.current.pause = false;
    }
    
    // アイテムスロット
    if (key >= '1' && key <= '5') {
      inputStateRef.current.itemSlot = -1;
    }
  }, []);
  
  // マウスムーブハンドラー
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (gameState !== GameState.PLAYING) return;
    if (document.pointerLockElement) {
      inputStateRef.current.cameraRotateX = event.movementX * GAME_CONFIG.camera.rotationSpeed;
      inputStateRef.current.cameraRotateY = event.movementY * GAME_CONFIG.camera.rotationSpeed;
    }
  }, [gameState]);
  
  // マウスダウンハンドラー
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (gameState !== GameState.PLAYING) return;
    
    if (event.button === 0) { // 左クリック
      inputStateRef.current.attack = true;
    }
    if (event.button === 2) { // 右クリック
      inputStateRef.current.defend = true;
    }
  }, [gameState]);
  
  // マウスアップハンドラー
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (event.button === 0) {
      inputStateRef.current.attack = false;
    }
    if (event.button === 2) {
      inputStateRef.current.defend = false;
    }
  }, []);
  
  // 右クリックメニュー無効化
  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);
  
  // フォーカスを失った時のリセット
  const handleBlur = useCallback(() => {
    inputStateRef.current = { ...initialInputState };
    keysPressed.current.clear();
  }, []);
  
  // イベントリスナーの登録
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp, handleContextMenu, handleBlur]);
  
  // 入力状態を取得
  const getInputState = useCallback((): InputState => {
    return { ...inputStateRef.current };
  }, []);
  
  // カメラ回転をリセット
  const resetCameraRotation = useCallback(() => {
    inputStateRef.current.cameraRotateX = 0;
    inputStateRef.current.cameraRotateY = 0;
  }, []);
  
  // タッチ入力を更新（バーチャルジョイスティック用）
  const setTouchMove = useCallback((x: number, y: number) => {
    inputStateRef.current.touchMoveX = x;
    inputStateRef.current.touchMoveY = y;
  }, []);
  
  // タッチアクションを設定
  const setTouchAction = useCallback((action: keyof InputState, value: boolean) => {
    (inputStateRef.current as any)[action] = value;
  }, []);
  
  return {
    getInputState,
    resetCameraRotation,
    setTouchMove,
    setTouchAction,
    isTouchDevice,
    deviceType,
  };
};
