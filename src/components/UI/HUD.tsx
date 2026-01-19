import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { DeviceType } from '../../data/gameConfig';
import './HUD.css';

export const HUD: React.FC = () => {
  const { player, world } = useGameStore();
  const { deviceType } = useDeviceDetection();
  
  // ハート表示を生成
  const renderHearts = () => {
    const hearts = [];
    const totalHearts = Math.ceil(player.maxHealth / 2);
    const currentHealth = player.health;
    
    for (let i = 0; i < totalHearts; i++) {
      const heartIndex = (i + 1) * 2;
      let heartState: 'full' | 'half' | 'empty';
      
      if (currentHealth >= heartIndex) {
        heartState = 'full';
      } else if (currentHealth >= heartIndex - 1) {
        heartState = 'half';
      } else {
        heartState = 'empty';
      }
      
      hearts.push(
        <div key={i} className={`heart ${heartState}`}>
          {heartState === 'full' && '❤️'}
          {heartState === 'half' && '💔'}
          {heartState === 'empty' && '🖤'}
        </div>
      );
    }
    
    return hearts;
  };
  
  // 魔力バーの幅を計算
  const magicPercentage = (player.magic / player.maxMagic) * 100;
  
  // 時刻を表示用に変換
  const getTimeOfDayString = () => {
    const hours = Math.floor(world.timeOfDay * 24);
    const minutes = Math.floor((world.timeOfDay * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // 昼夜を判定
  const isDaytime = world.timeOfDay > 0.25 && world.timeOfDay < 0.75;
  
  return (
    <div className={`hud ${deviceType}`}>
      {/* 左上: ライフとマジック */}
      <div className="hud-top-left">
        {/* ハート */}
        <div className="hearts-container">
          {renderHearts()}
        </div>
        
        {/* マジックバー */}
        <div className="magic-container">
          <div className="magic-bar">
            <div
              className="magic-fill"
              style={{ width: `${magicPercentage}%` }}
            />
          </div>
          <span className="magic-text">MP</span>
        </div>
      </div>
      
      {/* 右上: ミニマップとルピー */}
      <div className="hud-top-right">
        {/* ルピー */}
        <div className="rupees-container">
          <span className="rupee-icon">💎</span>
          <span className="rupee-count">{player.rupees}</span>
        </div>
        
        {/* 時刻表示 */}
        <div className="time-container">
          <span className="time-icon">{isDaytime ? '☀️' : '🌙'}</span>
          <span className="time-text">{getTimeOfDayString()}</span>
        </div>
        
        {/* ミニマップ（簡易版） */}
        <div className="minimap">
          <div className="minimap-bg">
            <div
              className="minimap-player"
              style={{
                left: `${((player.position.x + 50) / 100) * 100}%`,
                top: `${((player.position.z + 50) / 100) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      
      {/* 左下: 装備アイテム */}
      <div className="hud-bottom-left">
        <div className="equipped-item">
          <div className="item-slot main">
            <span className="item-icon">⚔️</span>
            <span className="item-key">B</span>
          </div>
        </div>
        
        <div className="sub-items">
          {[1, 2, 3].map((slot) => (
            <div key={slot} className="item-slot sub">
              <span className="item-icon">
                {slot === 1 ? '💣' : slot === 2 ? '🏹' : '🪃'}
              </span>
              <span className="item-key">{slot}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 右下: アクションプロンプト（デスクトップのみ） */}
      {deviceType === DeviceType.DESKTOP && (
        <div className="hud-bottom-right">
          <div className="action-prompts">
            <div className="action-prompt">
              <span className="key">E</span>
              <span className="action">話す/調べる</span>
            </div>
            <div className="action-prompt">
              <span className="key">Q</span>
              <span className="action">ロックオン</span>
            </div>
          </div>
        </div>
      )}
      
      {/* ターゲットロック表示 */}
      {player.targetLocked && (
        <div className="target-lock-indicator">
          <div className="target-reticle" />
        </div>
      )}
      
      {/* ダメージエフェクト */}
      {player.isInvincible && (
        <div className="damage-overlay" />
      )}
    </div>
  );
};

export default HUD;
