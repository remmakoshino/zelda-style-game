import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameState } from '../data/gameConfig';
import SaveSystem from '../systems/SaveSystem';
import type { SaveSlotInfo } from '../systems/SaveSystem';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import './TitleScreen.css';

export const TitleScreen: React.FC = () => {
  const [menuState, setMenuState] = useState<'main' | 'continue' | 'settings'>('main');
  const [saveSlots, setSaveSlots] = useState<SaveSlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [settings, setSettings] = useState({
    bgmVolume: 0.7,
    sfxVolume: 0.8,
    showFps: false,
  });
  
  const { setGameState, resetGame, setSaveSlot } = useGameStore();
  const { deviceType } = useDeviceDetection();
  
  // セーブスロット情報を読み込む
  useEffect(() => {
    setSaveSlots(SaveSystem.getAllSlotInfo());
  }, [menuState]);
  
  // 新規ゲーム開始
  const handleNewGame = useCallback(() => {
    resetGame();
    setSaveSlot(0);
    setGameState(GameState.PLAYING);
  }, [resetGame, setSaveSlot, setGameState]);
  
  // セーブデータからコンティニュー
  const handleContinue = useCallback((slot: number) => {
    const saveData = SaveSystem.load(slot);
    if (saveData) {
      resetGame();
      SaveSystem.restoreFromSave(saveData);
      setSaveSlot(slot);
      setGameState(GameState.PLAYING);
    }
  }, [resetGame, setSaveSlot, setGameState]);
  
  // セーブデータ削除
  const handleDeleteSave = useCallback((slot: number) => {
    if (confirm('このセーブデータを削除しますか？')) {
      SaveSystem.delete(slot);
      setSaveSlots(SaveSystem.getAllSlotInfo());
    }
  }, []);
  
  // 日時フォーマット
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // プレイ時間フォーマット
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };
  
  return (
    <div className="title-screen">
      {/* 背景アニメーション */}
      <div className="title-background">
        <div className="stars"></div>
        <div className="mountains"></div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="title-content">
        {/* ゲームロゴ */}
        <div className="title-logo">
          <h1 className="game-title">
            <span className="title-main">LEGEND OF</span>
            <span className="title-sub">ADVENTURE</span>
          </h1>
          <p className="title-tagline">〜時を超える勇者〜</p>
        </div>
        
        {/* メインメニュー */}
        {menuState === 'main' && (
          <div className="menu-container">
            <button
              className="menu-button primary"
              onClick={handleNewGame}
            >
              <span className="button-icon">⚔️</span>
              <span className="button-text">NEW GAME</span>
            </button>
            
            <button
              className="menu-button"
              onClick={() => setMenuState('continue')}
            >
              <span className="button-icon">📖</span>
              <span className="button-text">CONTINUE</span>
            </button>
            
            <button
              className="menu-button"
              onClick={() => setMenuState('settings')}
            >
              <span className="button-icon">⚙️</span>
              <span className="button-text">SETTINGS</span>
            </button>
          </div>
        )}
        
        {/* コンティニューメニュー */}
        {menuState === 'continue' && (
          <div className="submenu-container">
            <h2 className="submenu-title">セーブデータを選択</h2>
            
            <div className="save-slots">
              {saveSlots.map((slot) => (
                <div
                  key={slot.slot}
                  className={`save-slot ${slot.exists ? 'has-data' : 'empty'} ${
                    selectedSlot === slot.slot ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedSlot(slot.slot)}
                >
                  <div className="slot-header">
                    <span className="slot-number">SLOT {slot.slot + 1}</span>
                    {slot.exists && (
                      <span className="slot-level">{slot.currentLevel}</span>
                    )}
                  </div>
                  
                  {slot.exists ? (
                    <div className="slot-info">
                      <div className="slot-health">
                        <span className="health-hearts">
                          {'❤️'.repeat(Math.ceil(slot.playerHealth / 2))}
                          {'🖤'.repeat(Math.ceil(slot.playerMaxHealth / 2) - Math.ceil(slot.playerHealth / 2))}
                        </span>
                      </div>
                      <div className="slot-time">
                        <span>{formatDate(slot.timestamp)}</span>
                        <span>{formatPlayTime(slot.playTime)}</span>
                      </div>
                      <div className="slot-actions">
                        <button
                          className="slot-button load"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinue(slot.slot);
                          }}
                        >
                          ロード
                        </button>
                        <button
                          className="slot-button delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSave(slot.slot);
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="slot-empty">
                      <span>データなし</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button
              className="back-button"
              onClick={() => setMenuState('main')}
            >
              ← 戻る
            </button>
          </div>
        )}
        
        {/* 設定メニュー */}
        {menuState === 'settings' && (
          <div className="submenu-container">
            <h2 className="submenu-title">設定</h2>
            
            <div className="settings-list">
              <div className="setting-item">
                <label>BGM音量</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.bgmVolume}
                  onChange={(e) =>
                    setSettings({ ...settings, bgmVolume: parseFloat(e.target.value) })
                  }
                />
                <span>{Math.round(settings.bgmVolume * 100)}%</span>
              </div>
              
              <div className="setting-item">
                <label>効果音音量</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.sfxVolume}
                  onChange={(e) =>
                    setSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
                  }
                />
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              
              <div className="setting-item">
                <label>FPS表示</label>
                <button
                  className={`toggle-button ${settings.showFps ? 'active' : ''}`}
                  onClick={() =>
                    setSettings({ ...settings, showFps: !settings.showFps })
                  }
                >
                  {settings.showFps ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            
            <button
              className="back-button"
              onClick={() => setMenuState('main')}
            >
              ← 戻る
            </button>
          </div>
        )}
        
        {/* 操作説明 */}
        <div className="controls-hint">
          {deviceType === 'desktop' ? (
            <p>WASD: 移動 / Space: ジャンプ / クリック: 攻撃 / 右クリック: 防御</p>
          ) : (
            <p>タップしてゲームを開始</p>
          )}
        </div>
        
        {/* フッター */}
        <div className="title-footer">
          <p>© 2025 Legend of Adventure - Fan Made Game</p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
