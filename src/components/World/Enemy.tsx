import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONFIG, GameState } from '../../data/gameConfig';

interface EnemyProps {
  id: string;
  type: 'slime' | 'skeleton';
  position: [number, number, number];
  patrolPoints?: [number, number, number][];
}

// 敵の設定
const ENEMY_CONFIG = {
  slime: {
    health: 2,
    damage: 1,
    speed: 1.5,
    detectionRange: 8,
    attackRange: 1.5,
    attackCooldown: 2,
    color: '#7cfc00',
    size: 0.4,
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
  },
};

export const Enemy: React.FC<EnemyProps> = ({ id, type, position, patrolPoints }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(ENEMY_CONFIG[type].health);
  const [isAlive, setIsAlive] = useState(true);
  const [isHit, setIsHit] = useState(false);
  const attackCooldownRef = useRef(0);
  const patrolIndexRef = useRef(0);
  const stateRef = useRef<'idle' | 'patrol' | 'chase' | 'attack'>('idle');
  
  const {
    player,
    gameState,
    defeatEnemy,
    world,
    takeDamage,
  } = useGameStore();
  
  const config = ENEMY_CONFIG[type];
  
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
  
  if (!isAlive) return null;
  
  return (
    <group ref={meshRef} position={position}>
      {type === 'slime' ? (
        // スライム
        <mesh castShadow>
          <sphereGeometry args={[config.size, 16, 16]} />
          <meshStandardMaterial
            color={isHit ? '#ff0000' : config.color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ) : (
        // スケルトン
        <>
          {/* 体 */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
            <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
          </mesh>
          {/* 頭 */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={isHit ? '#ff0000' : config.color} />
          </mesh>
          {/* 目（赤） */}
          <mesh position={[0.07, 0.88, 0.15]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          <mesh position={[-0.07, 0.88, 0.15]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          {/* 武器 */}
          <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
            <boxGeometry args={[0.08, 0.8, 0.02]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </>
      )}
      
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
