import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { MAIN_FIELD } from '../../data/levelData';

// 木のコンポーネント
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* 幹 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* 葉 */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.9, 1.5, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
      <mesh position={[0, 4.3, 0]} castShadow>
        <coneGeometry args={[0.6, 1, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
};

// 岩のコンポーネント
const Rock: React.FC<{ position: [number, number, number]; scale?: [number, number, number] }> = ({
  position,
  scale = [1, 1, 1],
}) => {
  return (
    <mesh position={[position[0], position[1] + 0.3 * scale[1], position[2]]} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#808080" roughness={0.8} />
    </mesh>
  );
};

// 建物のコンポーネント
const Building: React.FC<{
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
}> = ({ position, scale = [1, 1, 1], color = '#8b4513' }) => {
  return (
    <group position={position} scale={scale}>
      {/* 本体 */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 屋根 */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <coneGeometry args={[0.85, 0.5, 4]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>
      {/* ドア */}
      <mesh position={[0, 0.25, 0.51]}>
        <boxGeometry args={[0.25, 0.5, 0.05]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
      {/* 窓 */}
      <mesh position={[0.25, 0.6, 0.51]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      <mesh position={[-0.25, 0.6, 0.51]}>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
    </group>
  );
};

// 水場のコンポーネント
const Water: React.FC<{
  position: [number, number, number];
  scale?: [number, number, number];
}> = ({ position, scale = [1, 1, 1] }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={waterRef} position={position} scale={scale} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial
        color="#4169e1"
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  );
};

// 宝箱のコンポーネント
const Chest: React.FC<{
  id: string;
  position: [number, number, number];
  properties?: Record<string, unknown>;
}> = ({ id, position, properties }) => {
  const { world, openChest, addItem } = useGameStore();
  const isOpened = world.chestsOpened.includes(id);
  
  const handleInteract = () => {
    if (!isOpened) {
      openChest(id);
      if (properties?.itemId) {
        addItem(properties.itemId as any, (properties.quantity as number) || 1);
      }
    }
  };
  
  return (
    <group position={position} onClick={handleInteract}>
      {/* 箱本体 */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color={isOpened ? '#8b4513' : '#daa520'} />
      </mesh>
      {/* 蓋 */}
      <mesh
        position={[0, 0.4, isOpened ? -0.15 : 0]}
        rotation={[isOpened ? -Math.PI / 2 : 0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.52, 0.1, 0.37]} />
        <meshStandardMaterial color={isOpened ? '#8b4513' : '#daa520'} />
      </mesh>
      {/* 金具 */}
      <mesh position={[0, 0.25, 0.18]}>
        <boxGeometry args={[0.1, 0.15, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ダンジョン入口
const DungeonDoor: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
}> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* 洞窟の入口 */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 0.5]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>
      {/* 入口の穴 */}
      <mesh position={[0, 1, 0.3]}>
        <boxGeometry args={[1.5, 2, 0.5]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* 装飾 */}
      <mesh position={[0, 2.8, 0.3]}>
        <boxGeometry args={[2, 0.3, 0.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
};

// メイン環境コンポーネント
export const Environment: React.FC = () => {
  const level = MAIN_FIELD;
  
  // 地面のグリッドテクスチャを生成
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // 草の色
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(0, 0, 512, 512);
    
    // ランダムな濃淡
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 30 - 15;
      ctx.fillStyle = `rgb(${74 + shade}, ${124 + shade}, ${78 + shade})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);
  
  return (
    <group>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={groundTexture} />
      </mesh>
      
      {/* オブジェクトの配置 */}
      {level.objects.map((obj) => {
        switch (obj.type) {
          case 'tree':
            return <Tree key={obj.id} position={obj.position} />;
          case 'rock':
            return (
              <Rock
                key={obj.id}
                position={obj.position}
                scale={obj.scale as [number, number, number]}
              />
            );
          case 'building':
            return (
              <Building
                key={obj.id}
                position={obj.position}
                scale={obj.scale as [number, number, number]}
                color={obj.color}
              />
            );
          case 'water':
            return (
              <Water
                key={obj.id}
                position={obj.position}
                scale={obj.scale as [number, number, number]}
              />
            );
          case 'chest':
            return (
              <Chest
                key={obj.id}
                id={obj.id}
                position={obj.position}
                properties={obj.properties}
              />
            );
          case 'door':
            return (
              <DungeonDoor
                key={obj.id}
                position={obj.position}
                rotation={obj.rotation as [number, number, number]}
              />
            );
          default:
            return null;
        }
      })}
      
      {/* 空 */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial color="#87ceeb" side={THREE.BackSide} />
      </mesh>
      
      {/* 太陽 */}
      <mesh position={[50, 80, -50]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      
      {/* 霧 */}
      <fog attach="fog" args={['#87ceeb', 30, 100]} />
    </group>
  );
};

export default Environment;
