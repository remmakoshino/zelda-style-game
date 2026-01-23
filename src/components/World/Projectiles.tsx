import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface ArrowProps {
  startPosition: THREE.Vector3;
  direction: THREE.Vector3;
  arrowType: 'normal' | 'fire' | 'ice' | 'light';
  onHit?: (targetId: string, position: THREE.Vector3) => void;
  onExpire?: () => void;
}

const ARROW_SPEED = 30;
const ARROW_LIFETIME = 3; // 秒

const ARROW_COLORS = {
  normal: '#8b4513',
  fire: '#ff4400',
  ice: '#00ccff',
  light: '#ffff00',
};

export const Arrow: React.FC<ArrowProps> = ({
  startPosition,
  direction,
  arrowType = 'normal',
  onExpire,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isActive, setIsActive] = useState(true);
  const lifetimeRef = useRef(0);
  const velocityRef = useRef(direction.clone().normalize().multiplyScalar(ARROW_SPEED));
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(startPosition);
      // 矢の向きを進行方向に合わせる
      meshRef.current.lookAt(startPosition.clone().add(direction));
    }
  }, [startPosition, direction]);
  
  useFrame((_, delta) => {
    if (!meshRef.current || !isActive) return;
    
    lifetimeRef.current += delta;
    
    // 寿命チェック
    if (lifetimeRef.current > ARROW_LIFETIME) {
      setIsActive(false);
      onExpire?.();
      return;
    }
    
    // 重力を適用（軽め）
    velocityRef.current.y -= 5 * delta;
    
    // 位置更新
    meshRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta));
    
    // 向きを速度方向に合わせる
    if (velocityRef.current.length() > 0.1) {
      const lookTarget = meshRef.current.position.clone().add(velocityRef.current);
      meshRef.current.lookAt(lookTarget);
    }
    
    // 地面との衝突判定
    if (meshRef.current.position.y <= 0.1) {
      setIsActive(false);
      onExpire?.();
    }
  });
  
  if (!isActive) return null;
  
  const color = ARROW_COLORS[arrowType];
  
  return (
    <group ref={meshRef}>
      {/* 矢の棒 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 矢じり */}
      <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* 羽根 */}
      <mesh position={[0, 0, 0.25]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.01, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.25]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.08, 0.01, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* 特殊矢のエフェクト */}
      {arrowType === 'fire' && (
        <pointLight position={[0, 0, -0.2]} color="#ff4400" intensity={2} distance={3} />
      )}
      {arrowType === 'ice' && (
        <pointLight position={[0, 0, -0.2]} color="#00ccff" intensity={1.5} distance={2} />
      )}
      {arrowType === 'light' && (
        <pointLight position={[0, 0, -0.2]} color="#ffff00" intensity={3} distance={5} />
      )}
    </group>
  );
};

// フックショットのフック
interface HookshotHookProps {
  startPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  isExtending: boolean;
  isRetracting: boolean;
  onReachTarget?: () => void;
  onReturnComplete?: () => void;
}

const HOOKSHOT_SPEED = 25;
const HOOKSHOT_MAX_DISTANCE = 15;

export const HookshotHook: React.FC<HookshotHookProps> = ({
  startPosition,
  targetPosition,
  isExtending,
  isRetracting,
  onReachTarget,
  onReturnComplete,
}) => {
  const hookRef = useRef<THREE.Group>(null);
  const chainRef = useRef<THREE.Mesh>(null);
  const [hookPosition, setHookPosition] = useState(startPosition.clone());
  const progressRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!hookRef.current) return;
    
    if (isExtending) {
      progressRef.current += delta * HOOKSHOT_SPEED / HOOKSHOT_MAX_DISTANCE;
      
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        onReachTarget?.();
      }
    } else if (isRetracting) {
      progressRef.current -= delta * HOOKSHOT_SPEED / HOOKSHOT_MAX_DISTANCE;
      
      if (progressRef.current <= 0) {
        progressRef.current = 0;
        onReturnComplete?.();
      }
    }
    
    // フック位置を補間
    const newPosition = new THREE.Vector3().lerpVectors(
      startPosition,
      targetPosition,
      progressRef.current
    );
    setHookPosition(newPosition);
    hookRef.current.position.copy(newPosition);
    
    // チェーンの長さを更新
    if (chainRef.current) {
      const distance = startPosition.distanceTo(newPosition);
      chainRef.current.scale.set(1, distance / 2, 1);
      
      const midPoint = new THREE.Vector3().addVectors(startPosition, newPosition).multiplyScalar(0.5);
      chainRef.current.position.copy(midPoint);
      
      // チェーンをフックに向ける
      chainRef.current.lookAt(newPosition);
      chainRef.current.rotateX(Math.PI / 2);
    }
  });
  
  return (
    <>
      {/* チェーン */}
      <mesh ref={chainRef}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* フック */}
      <group ref={hookRef} position={hookPosition.toArray()}>
        {/* フックの本体 */}
        <mesh>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* フックの爪 */}
        <mesh position={[0, 0, -0.15]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0, -0.1]} rotation={[0.5, 0, 0.3]}>
          <boxGeometry args={[0.05, 0.05, 0.15]} />
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.08, 0, -0.1]} rotation={[0.5, 0, -0.3]}>
          <boxGeometry args={[0.05, 0.05, 0.15]} />
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
};

// 爆弾
interface BombProps {
  position: THREE.Vector3;
  fuseTime?: number;
  onExplode?: (position: THREE.Vector3, radius: number) => void;
}

const BOMB_FUSE_TIME = 3;
const BOMB_EXPLOSION_RADIUS = 5;

export const Bomb: React.FC<BombProps> = ({
  position,
  fuseTime = BOMB_FUSE_TIME,
  onExplode,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [flashIntensity, setFlashIntensity] = useState(0);
  const timerRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!meshRef.current || isExploded) return;
    
    timerRef.current += delta;
    
    // 点滅エフェクト（残り時間に応じて速く）
    const remainingTime = fuseTime - timerRef.current;
    const flashSpeed = Math.max(1, 10 - remainingTime * 3);
    setFlashIntensity(Math.sin(timerRef.current * flashSpeed * Math.PI) * 0.5 + 0.5);
    
    // 爆発
    if (timerRef.current >= fuseTime) {
      setIsExploded(true);
      onExplode?.(position, BOMB_EXPLOSION_RADIUS);
    }
  });
  
  if (isExploded) {
    // 爆発エフェクト
    return (
      <group position={position.toArray()}>
        <pointLight color="#ff6600" intensity={10} distance={BOMB_EXPLOSION_RADIUS * 2} />
        <mesh>
          <sphereGeometry args={[BOMB_EXPLOSION_RADIUS * 0.5, 16, 16]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }
  
  return (
    <group position={position.toArray()}>
      {/* 爆弾本体 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={flashIntensity > 0.5 ? '#ff3300' : '#222222'}
          emissive={flashIntensity > 0.5 ? '#ff0000' : '#000000'}
          emissiveIntensity={flashIntensity}
        />
      </mesh>
      
      {/* 導火線 */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 火花 */}
      <pointLight 
        position={[0, 0.4, 0]} 
        color="#ff6600" 
        intensity={flashIntensity * 2} 
        distance={1} 
      />
    </group>
  );
};

// ブーメラン
interface BoomerangProps {
  startPosition: THREE.Vector3;
  targetDirection: THREE.Vector3;
  onReturn?: () => void;
}

const BOOMERANG_SPEED = 15;
const BOOMERANG_RANGE = 10;

export const Boomerang: React.FC<BoomerangProps> = ({
  startPosition,
  targetDirection,
  onReturn,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isReturning, setIsReturning] = useState(false);
  const progressRef = useRef(0);
  const rotationRef = useRef(0);
  
  const player = useGameStore((state) => state.player);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // 回転アニメーション
    rotationRef.current += delta * 20;
    meshRef.current.rotation.y = rotationRef.current;
    
    if (!isReturning) {
      // 前進
      progressRef.current += delta * BOOMERANG_SPEED / BOOMERANG_RANGE;
      
      if (progressRef.current >= 1) {
        setIsReturning(true);
      }
    } else {
      // 帰還
      progressRef.current -= delta * BOOMERANG_SPEED / BOOMERANG_RANGE * 1.2;
      
      if (progressRef.current <= 0) {
        onReturn?.();
      }
    }
    
    // 位置計算（放物線を描く）
    const targetPos = startPosition.clone().add(
      targetDirection.clone().normalize().multiplyScalar(BOOMERANG_RANGE)
    );
    
    const basePos = startPosition.clone().lerp(targetPos, Math.min(progressRef.current, 1));
    
    if (isReturning) {
      basePos.lerp(player.position, 1 - progressRef.current);
    }
    
    // 弧を描く動き
    const arcHeight = Math.sin(progressRef.current * Math.PI) * 2;
    basePos.y += arcHeight;
    
    meshRef.current.position.copy(basePos);
  });
  
  return (
    <mesh ref={meshRef}>
      {/* ブーメラン形状 */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.15]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.25, 0, 0.15]} rotation={[Math.PI / 2, 0, Math.PI / 3]}>
          <boxGeometry args={[0.35, 0.05, 0.15]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>
    </mesh>
  );
};

export default Arrow;
