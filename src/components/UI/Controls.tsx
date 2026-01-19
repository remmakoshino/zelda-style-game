import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useInputManager } from '../../hooks/useInputManager';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useGameStore } from '../../stores/gameStore';
import { GameState } from '../../data/gameConfig';
import './Controls.css';

export const VirtualControls: React.FC = () => {
  const { setTouchMove, setTouchAction, isTouchDevice } = useInputManager();
  const { deviceType } = useDeviceDetection();
  const { gameState, toggleMenu } = useGameStore();
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickCenterRef = useRef({ x: 0, y: 0 });
  
  // ジョイスティックが非表示の場合は何も表示しない
  if (!isTouchDevice || gameState !== GameState.PLAYING) {
    return null;
  }
  
  // ジョイスティックのタッチ処理
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = joystickRef.current?.getBoundingClientRect();
    
    if (rect) {
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setIsJoystickActive(true);
      updateJoystickPosition(touch.clientX, touch.clientY);
    }
  }, []);
  
  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    if (!isJoystickActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateJoystickPosition(touch.clientX, touch.clientY);
  }, [isJoystickActive]);
  
  const handleJoystickEnd = useCallback(() => {
    setIsJoystickActive(false);
    setTouchMove(0, 0);
    
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)';
    }
  }, [setTouchMove]);
  
  const updateJoystickPosition = useCallback((touchX: number, touchY: number) => {
    const center = joystickCenterRef.current;
    const maxDistance = 40;
    
    let deltaX = touchX - center.x;
    let deltaY = touchY - center.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    // ノブの位置を更新
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    }
    
    // 正規化された値を送信（-1 to 1）
    setTouchMove(deltaX / maxDistance, deltaY / maxDistance);
  }, [setTouchMove]);
  
  // アクションボタン処理
  const handleButtonPress = useCallback((action: string) => {
    setTouchAction(action as any, true);
    
    // 一定時間後にリリース
    setTimeout(() => {
      setTouchAction(action as any, false);
    }, 100);
  }, [setTouchAction]);
  
  const handleButtonDown = useCallback((action: string) => {
    setTouchAction(action as any, true);
  }, [setTouchAction]);
  
  const handleButtonUp = useCallback((action: string) => {
    setTouchAction(action as any, false);
  }, [setTouchAction]);
  
  return (
    <div className={`virtual-controls ${deviceType}`}>
      {/* 左側: バーチャルジョイスティック */}
      <div
        ref={joystickRef}
        className="joystick-container"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div className="joystick-base">
          <div ref={knobRef} className="joystick-knob" />
        </div>
      </div>
      
      {/* 右側: アクションボタン */}
      <div className="action-buttons">
        {/* 攻撃ボタン */}
        <button
          className="action-button attack"
          onTouchStart={() => handleButtonDown('attack')}
          onTouchEnd={() => handleButtonUp('attack')}
        >
          <span className="button-label">⚔️</span>
          <span className="button-text">攻撃</span>
        </button>
        
        {/* ジャンプボタン */}
        <button
          className="action-button jump"
          onTouchStart={() => handleButtonPress('jump')}
        >
          <span className="button-label">⬆️</span>
          <span className="button-text">ジャンプ</span>
        </button>
        
        {/* 防御ボタン */}
        <button
          className="action-button defend"
          onTouchStart={() => handleButtonDown('defend')}
          onTouchEnd={() => handleButtonUp('defend')}
        >
          <span className="button-label">🛡️</span>
          <span className="button-text">防御</span>
        </button>
        
        {/* ローリングボタン */}
        <button
          className="action-button roll"
          onTouchStart={() => handleButtonPress('roll')}
        >
          <span className="button-label">🔄</span>
          <span className="button-text">回避</span>
        </button>
      </div>
      
      {/* 上部: システムボタン */}
      <div className="system-buttons">
        {/* メニューボタン */}
        <button
          className="system-button menu"
          onTouchStart={() => toggleMenu()}
        >
          <span>☰</span>
        </button>
        
        {/* ターゲットロックボタン */}
        <button
          className="system-button target"
          onTouchStart={() => handleButtonPress('targetLock')}
        >
          <span>🎯</span>
        </button>
        
        {/* アイテム使用ボタン */}
        <button
          className="system-button item"
          onTouchStart={() => handleButtonPress('useItem')}
        >
          <span>🎒</span>
        </button>
      </div>
      
      {/* インタラクトボタン */}
      <button
        className="interact-button"
        onTouchStart={() => handleButtonPress('interact')}
      >
        <span>Ⓐ</span>
      </button>
    </div>
  );
};

// ダイアログUI
export const DialogueBox: React.FC = () => {
  const { gameState, dialogueText, dialogueIndex, advanceDialogue, closeDialogue } = useGameStore();
  const { isTouchDevice } = useDeviceDetection();
  
  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.DIALOGUE) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'e') {
          advanceDialogue();
        }
        if (e.key === 'Escape') {
          closeDialogue();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, advanceDialogue, closeDialogue]);
  
  if (gameState !== GameState.DIALOGUE || dialogueText.length === 0) {
    return null;
  }
  
  return (
    <div className="dialogue-overlay" onClick={advanceDialogue}>
      <div className="dialogue-box">
        <p className="dialogue-text">{dialogueText[dialogueIndex]}</p>
        <div className="dialogue-indicator">
          {dialogueIndex < dialogueText.length - 1 ? (
            <span className="next-indicator">▼</span>
          ) : (
            <span className="end-indicator">終了</span>
          )}
        </div>
        {!isTouchDevice && (
          <span className="dialogue-hint">スペースキーで続ける</span>
        )}
      </div>
    </div>
  );
};

// ポーズメニュー
export const PauseMenu: React.FC = () => {
  const { showMenu, toggleMenu, gameState, setGameState } = useGameStore();
  
  if (!showMenu || gameState !== GameState.PLAYING) {
    return null;
  }
  
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>ポーズ</h2>
        <div className="pause-buttons">
          <button onClick={toggleMenu}>ゲームに戻る</button>
          <button onClick={() => {
            toggleMenu();
            // セーブ処理
          }}>セーブ</button>
          <button onClick={() => {
            setGameState(GameState.TITLE);
          }}>タイトルに戻る</button>
        </div>
      </div>
    </div>
  );
};

// ゲームオーバー画面
export const GameOverScreen: React.FC = () => {
  const { gameState, resetGame, setGameState } = useGameStore();
  
  if (gameState !== GameState.GAME_OVER) {
    return null;
  }
  
  return (
    <div className="gameover-overlay">
      <div className="gameover-content">
        <h1>GAME OVER</h1>
        <div className="gameover-buttons">
          <button onClick={() => {
            resetGame();
          }}>コンティニュー</button>
          <button onClick={() => {
            setGameState(GameState.TITLE);
          }}>タイトルに戻る</button>
        </div>
      </div>
    </div>
  );
};

export default VirtualControls;
