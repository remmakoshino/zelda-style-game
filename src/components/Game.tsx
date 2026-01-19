import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../stores/gameStore';
import { GameState } from '../data/gameConfig';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

// コンポーネント
import { Player } from './World/Player';
import { Enemy } from './World/Enemy';
import { NPC } from './World/NPC';
import { Environment } from './World/Environment';
import { CameraController } from './World/CameraController';
import { HUD } from './UI/HUD';
import VirtualControls, { DialogueBox, PauseMenu, GameOverScreen } from './UI/Controls';

// レベルデータ
import { MAIN_FIELD } from '../data/levelData';

// 3Dシーン
const Scene: React.FC = () => {
  const level = MAIN_FIELD;
  
  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 太陽光 */}
      <directionalLight
        position={[50, 80, -50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* 半球光（空からの光） */}
      <hemisphereLight
        color="#87ceeb"
        groundColor="#4a7c4e"
        intensity={0.3}
      />
      
      {/* プレイヤー */}
      <Player initialPosition={level.spawnPoint} />
      
      {/* カメラコントローラー */}
      <CameraController />
      
      {/* 環境 */}
      <Environment />
      
      {/* 敵 */}
      {level.enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          id={enemy.id}
          type={enemy.type as 'slime' | 'skeleton'}
          position={enemy.position}
          patrolPoints={enemy.patrolPoints}
        />
      ))}
      
      {/* NPC */}
      {level.npcs.map((npc) => (
        <NPC key={npc.id} data={npc} />
      ))}
    </>
  );
};

// メインゲームコンポーネント
export const Game: React.FC = () => {
  const { gameState } = useGameStore();
  const { pixelRatio } = useDeviceDetection();
  
  // ゲームがプレイ中でない場合は何も表示しない
  if (gameState !== GameState.PLAYING && 
      gameState !== GameState.DIALOGUE && 
      gameState !== GameState.PAUSED &&
      gameState !== GameState.GAME_OVER) {
    return null;
  }
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Three.js Canvas */}
      <Canvas
        shadows
        dpr={Math.min(pixelRatio, 2)}
        camera={{
          fov: 60,
          near: 0.1,
          far: 500,
          position: [0, 10, 15],
        }}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* HUD */}
      <HUD />
      
      {/* バーチャルコントロール（モバイル用） */}
      <VirtualControls />
      
      {/* ダイアログボックス */}
      <DialogueBox />
      
      {/* ポーズメニュー */}
      <PauseMenu />
      
      {/* ゲームオーバー */}
      <GameOverScreen />
    </div>
  );
};

export default Game;
