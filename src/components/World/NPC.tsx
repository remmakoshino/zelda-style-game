import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { GameState } from '../../data/gameConfig';
import type { NPCData } from '../../data/levelData';

interface NPCProps {
  data: NPCData;
}

export const NPC: React.FC<NPCProps> = ({ data }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isNearPlayer, setIsNearPlayer] = useState(false);
  const {
    player,
    gameState,
    setDialogue,
    interactWithNPC,
  } = useGameStore();
  
  // プレイヤーとの距離をチェック
  useFrame(() => {
    if (!meshRef.current || gameState !== GameState.PLAYING) return;
    
    const npcPos = meshRef.current.position;
    const distance = npcPos.distanceTo(player.position);
    
    setIsNearPlayer(distance < 2.5);
  });
  
  const handleInteract = () => {
    if (isNearPlayer && gameState === GameState.PLAYING) {
      interactWithNPC(data.id);
      setDialogue(data.dialogue);
    }
  };
  
  return (
    <group
      ref={meshRef}
      position={data.position}
      rotation={[0, data.rotation || 0, 0]}
      onClick={handleInteract}
    >
      {/* 体 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 頭 */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f5d0a9" />
      </mesh>
      
      {/* 目 */}
      <mesh position={[0.08, 1.15, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.08, 1.15, 0.18]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* 髪/帽子 */}
      {data.id === 'npc_elder' ? (
        // 村長は白髪
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ) : (
        // 商人は帽子
        <mesh position={[0, 1.35, 0]} castShadow>
          <coneGeometry args={[0.2, 0.3, 8]} />
          <meshStandardMaterial color="#ff6347" />
        </mesh>
      )}
      
      {/* インタラクトプロンプト */}
      {isNearPlayer && (
        <group position={[0, 1.8, 0]}>
          {/* 背景 */}
          <mesh>
            <planeGeometry args={[1.2, 0.3]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          {/* テキスト（シンプルな表示） */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.15, 0.15]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        </group>
      )}
      
      {/* 名前表示 */}
      <group position={[0, 1.5, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
};

export default NPC;
