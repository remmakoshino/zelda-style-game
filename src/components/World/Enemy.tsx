import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONFIG, GameState } from '../../data/gameConfig';
import { isNighttime } from '../../systems/TimeSystem';

// 敵タイプの定義
export type EnemyType = 
  | 'slime' 
  | 'skeleton' 
  | 'lizalfos' 
  | 'stalfos' 
  | 'frizzard' 
  | 'deku_baba' 
  | 'keese' 
  | 'ghost';

interface EnemyProps {
  id: string;
  type: EnemyType;
  position: [number, number, number];
  patrolPoints?: [number, number, number][];
  nightOnly?: boolean;
}

// 敵の設定
const ENEMY_CONFIG: Record<EnemyType, {
  health: number;
  damage: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  attackCooldown: number;
  color: string;
  size: number;
  dropRupees?: number;
}> = {
  slime: {
    health: 2,
    damage: 1,
    speed: 1.5,
    detectionRange: 8,
    attackRange: 1.5,
    attackCooldown: 2,
    color: '#7cfc00',
    size: 0.4,
    dropRupees: 1,
  },
  skeleton: {
    health: 3,
    damage: 1,
    speed: 2.5,
    detectionRange: 10,
    attackRange: 2,
    attackCooldown: 1.5,
    color: '#f5f5dc',
    size: 0.5,
    dropRupees: 3,
  },
  lizalfos: {
    health: 5,
    damage: 2,
    speed: 3,
    detectionRange: 12,
    attackRange: 2.5,
    attackCooldown: 1.2,
    color: '#228b22',
    size: 0.6,
    dropRupees: 10,
  },
  stalfos: {
    health: 6,
    damage: 2,
    speed: 3.5,
    detectionRange: 15,
    attackRange: 2,
    attackCooldown: 0.8,
    color: '#dcdcdc',
    size: 0.7,
    dropRupees: 15,
  },
  frizzard: {
    health: 4,
    damage: 2,
    speed: 2,
    detectionRange: 10,
    attackRange: 4,
    attackCooldown: 2,
    color: '#00bfff',
    size: 0.5,
    dropRupees: 8,
  },
  deku_baba: {
    health: 2,
    damage: 1,
    speed: 0,
    detectionRange: 3,
    attackRange: 2,
    attackCooldown: 1,
    color: '#228b22',
    size: 0.4,
    dropRupees: 2,
  },
  keese: {
    health: 1,
    damage: 1,
    speed: 4,
    detectionRange: 12,
    attackRange: 1,
    attackCooldown: 1.5,
    color: '#333333',
    size: 0.3,
    dropRupees: 1,
  },
  ghost: {
    health: 4,
    damage: 2,
    speed: 2,
    detectionRange: 10,
    attackRange: 2,
    attackCooldown: 2,
    color: '#9370db',
    size: 0.5,
    dropRupees: 20,
  },
};

export const Enemy: React.FC<EnemyProps> = ({ id, type, position, patrolPoints, nightOnly = false }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(ENEMY_CONFIG[type].health);
  const [isAlive, setIsAlive] = useState(true);
  const [isHit, setIsHit] = useState(false);
  const [isVisible, setIsVisible] = useState(!nightOnly);
  const attackCooldownRef = useRef(0);
  const patrolIndexRef = useRef(0);
  const stateRef = useRef<'idle' | 'patrol' | 'chase' | 'attack'>('idle');
  
  const {
    player,
    gameState,
    defeatEnemy,
    world,
    takeDamage,
    addRupees,
  } = useGameStore();
  
  const config = ENEMY_CONFIG[type];
  
  // 夜間限定の敵の表示制御
  useEffect(() => {
    if (nightOnly) {
      setIsVisible(isNighttime(world.timeOfDay));
    }
  }, [nightOnly, world.timeOfDay]);
  
  // 敵が既に倒されているかチェック
  useEffect(() => {
    if (world.enemiesDefeated.includes(id)) {
      setIsAlive(false);
    }
  }, [id, world.enemiesDefeated]);
  
  // ダメージエフェクト
  useEffect(() => {
    if (isHit) {
      const timer = setTimeout(() => setIsHit(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHit]);
  
  // プレイヤーの攻撃との衝突判定
  useFrame((state, delta) => {
    if (!meshRef.current || !isAlive || gameState !== GameState.PLAYING) return;
    
    const enemyPos = meshRef.current.position;
    const playerPos = player.position;
    const distance = enemyPos.distanceTo(playerPos);
    
    // 攻撃クールダウン
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta;
    }
    
    // プレイヤーが攻撃中かつ範囲内
    if (player.isAttacking && distance < GAME_CONFIG.player.attackRange + config.size) {
      // ダメージを受ける
      if (!isHit) {
        const newHealth = health - GAME_CONFIG.player.attackDamage;
        setHealth(newHealth);
        setIsHit(true);
        
        // ノックバック
        const knockbackDir = enemyPos.clone().sub(playerPos).normalize();
        meshRef.current.position.add(knockbackDir.multiplyScalar(0.5));
        
        if (newHealth <= 0) {
          setIsAlive(false);
          defeatEnemy(id);
          // ルピーをドロップ
          if (config.dropRupees) {
            addRupees(config.dropRupees);
          }
        }
      }
    }
    
    // AI行動
    if (distance < config.detectionRange) {
      // プレイヤーを検知
      if (distance < config.attackRange) {
        // 攻撃
        stateRef.current = 'attack';
        if (attackCooldownRef.current <= 0) {
          takeDamage(config.damage);
          attackCooldownRef.current = config.attackCooldown;
        }
      } else {
        // 追跡
        stateRef.current = 'chase';
        const direction = playerPos.clone().sub(enemyPos).normalize();
        direction.y = 0;
        meshRef.current.position.add(direction.multiplyScalar(config.speed * delta));
        
        // 敵の向きをプレイヤーに向ける
        meshRef.current.lookAt(playerPos.x, meshRef.current.position.y, playerPos.z);
      }
    } else if (patrolPoints && patrolPoints.length > 0) {
      // パトロール
      stateRef.current = 'patrol';
      const targetPoint = new THREE.Vector3(...patrolPoints[patrolIndexRef.current]);
      const toTarget = targetPoint.sub(enemyPos);
      
      if (toTarget.length() < 0.5) {
        patrolIndexRef.current = (patrolIndexRef.current + 1) % patrolPoints.length;
      } else {
        toTarget.normalize();
        meshRef.current.position.add(toTarget.multiplyScalar(config.speed * 0.5 * delta));
        meshRef.current.lookAt(
          targetPoint.x + enemyPos.x,
          meshRef.current.position.y,
          targetPoint.z + enemyPos.z
        );
      }
    } else {
      stateRef.current = 'idle';
    }
    
    // スライムのアニメーション
    if (type === 'slime') {
      const bounce = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.y = 1 + bounce;
      meshRef.current.scale.x = 1 - bounce * 0.5;
      meshRef.current.scale.z = 1 - bounce * 0.5;
    }
  });
  
  if (!isAlive || !isVisible) return null;
  
  // 敵タイプに応じた見た目をレンダリング
  const renderEnemyModel = () => {
    switch (type) {
      case 'slime':
        return (
          <mesh castShadow>
            <sphereGeometry args={[config.size, 16, 16]} />
            <meshStandardMaterial
              color={isHit ? '#ff0000' : config.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      
      case 'skeleton':
        return (
          <>
            <mesh position={[0, 0.3, 0]} castShadow>
              <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            <mesh position={[0, 0.85, 0]} castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            <mesh position={[0.07, 0.88, 0.15]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[-0.07, 0.88, 0.15]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
              <boxGeometry args={[0.08, 0.8, 0.02]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          </>
        );
      
      case 'lizalfos':
        return (
          <>
            {/* トカゲ戦士の体 */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 頭 */}
            <mesh position={[0, 0.95, 0.15]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.25, 0.4]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 目 */}
            <mesh position={[0.1, 1, 0.35]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
            <mesh position={[-0.1, 1, 0.35]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
            {/* 尻尾 */}
            <mesh position={[0, 0.2, -0.4]} rotation={[0.5, 0, 0]} castShadow>
              <coneGeometry args={[0.1, 0.6, 8]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 剣 */}
            <mesh position={[0.5, 0.4, 0]} rotation={[0, 0, -0.3]} castShadow>
              <boxGeometry args={[0.08, 0.9, 0.03]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
            </mesh>
            {/* 盾 */}
            <mesh position={[-0.4, 0.4, 0.1]} castShadow>
              <boxGeometry args={[0.1, 0.4, 0.3]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          </>
        );
      
      case 'stalfos':
        return (
          <>
            {/* 骸骨戦士の体 */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <capsuleGeometry args={[0.25, 0.7, 8, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 頭蓋骨 */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 目（炎） */}
            <pointLight position={[0.08, 1.15, 0.18]} color="#ff0000" intensity={0.5} distance={1} />
            <pointLight position={[-0.08, 1.15, 0.18]} color="#ff0000" intensity={0.5} distance={1} />
            <mesh position={[0.08, 1.15, 0.18]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[-0.08, 1.15, 0.18]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            {/* 大剣 */}
            <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -0.4]} castShadow>
              <boxGeometry args={[0.12, 1.2, 0.03]} />
              <meshStandardMaterial color="#555555" metalness={0.9} />
            </mesh>
          </>
        );
      
      case 'frizzard':
        return (
          <>
            {/* 氷の敵 - 浮遊する氷の結晶 */}
            <mesh castShadow>
              <octahedronGeometry args={[config.size, 0]} />
              <meshStandardMaterial 
                color={isHit ? '#ff0000' : config.color}
                transparent
                opacity={0.7}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* 内側の光 */}
            <pointLight position={[0, 0, 0]} color="#00ffff" intensity={1} distance={3} />
            {/* 周りの小さな氷片 */}
            <mesh position={[0.3, 0.2, 0]} rotation={[0.5, 0.3, 0]}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial color={config.color} transparent opacity={0.5} />
            </mesh>
            <mesh position={[-0.25, -0.15, 0.2]} rotation={[0.3, 0.5, 0]}>
              <octahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial color={config.color} transparent opacity={0.5} />
            </mesh>
          </>
        );
      
      case 'deku_baba':
        return (
          <>
            {/* 茎 */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
              <meshStandardMaterial color="#228b22" />
            </mesh>
            {/* 頭（口） */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : '#ff4444'} />
            </mesh>
            {/* 葉 */}
            <mesh position={[0.2, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
              <boxGeometry args={[0.3, 0.02, 0.15]} />
              <meshStandardMaterial color="#32cd32" />
            </mesh>
            <mesh position={[-0.2, 0.25, 0]} rotation={[0, 0, 0.6]} castShadow>
              <boxGeometry args={[0.25, 0.02, 0.12]} />
              <meshStandardMaterial color="#32cd32" />
            </mesh>
            {/* 牙 */}
            <mesh position={[0.1, 0.4, 0.2]} rotation={[0.3, 0, 0.2]}>
              <coneGeometry args={[0.03, 0.12, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.1, 0.4, 0.2]} rotation={[0.3, 0, -0.2]}>
              <coneGeometry args={[0.03, 0.12, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </>
        );
      
      case 'keese':
        return (
          <>
            {/* コウモリの体 */}
            <mesh castShadow>
              <sphereGeometry args={[config.size * 0.6, 16, 16]} />
              <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
            </mesh>
            {/* 羽（左） */}
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.sin(Date.now() * 0.01) * 0.5]} castShadow>
              <boxGeometry args={[0.4, 0.02, 0.2]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            {/* 羽（右） */}
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.sin(Date.now() * 0.01) * 0.5]} castShadow>
              <boxGeometry args={[0.4, 0.02, 0.2]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            {/* 目 */}
            <mesh position={[0.05, 0.05, 0.15]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
            <mesh position={[-0.05, 0.05, 0.15]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          </>
        );
      
      case 'ghost':
        return (
          <>
            {/* 幽霊の体（半透明） */}
            <mesh castShadow>
              <capsuleGeometry args={[0.3, 0.5, 8, 16]} />
              <meshStandardMaterial 
                color={isHit ? '#ff0000' : config.color}
                transparent
                opacity={0.5}
                emissive={config.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* ランタン */}
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.15, 0.2, 0.15]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <pointLight position={[0.4, 0.1, 0]} color="#88ff88" intensity={1} distance={5} />
            {/* 目 */}
            <mesh position={[0.08, 0.2, 0.25]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.08, 0.2, 0.25]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </>
        );
      
      default:
        return (
          <mesh castShadow>
            <sphereGeometry args={[config.size, 16, 16]} />
            <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
          </mesh>
        );
    }
  };
  
  return (
    <group ref={meshRef} position={position}>
      {renderEnemyModel()}
      
      {/* 体力バー */}
      <group position={[0, type === 'slime' ? 0.8 : 1.2, 0]}>
        {/* 背景 */}
        <mesh>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        {/* 体力 */}
        <mesh position={[(health / ENEMY_CONFIG[type].health - 1) * 0.3, 0, 0.01]}>
          <planeGeometry args={[(health / ENEMY_CONFIG[type].health) * 0.6, 0.06]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>
    </group>
  );
};

export default Enemy;
