import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useInputManager } from '../../hooks/useInputManager';
import { GAME_CONFIG, GameState } from '../../data/gameConfig';

interface PlayerProps {
  initialPosition?: [number, number, number];
}

export const Player: React.FC<PlayerProps> = ({ initialPosition = [0, 1, 0] }) => {
  const meshRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const { camera } = useThree();
  
  const { getInputState, resetCameraRotation } = useInputManager();
  
  const {
    player,
    gameState,
    setPlayerPosition,
    setPlayerGrounded,
    setPlayerAttacking,
    setPlayerDefending,
    setPlayerRolling,
  } = useGameStore();
  
  // プレイヤーのマテリアル（ダメージ時の点滅用）
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: '#4a90d9' });
  }, []);
  
  const headMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: '#f5d0a9' });
  }, []);
  
  // 攻撃アニメーション用
  const swordRef = useRef<THREE.Mesh>(null);
  const attackTimeRef = useRef(0);
  
  // ローリング用
  const rollTimeRef = useRef(0);
  const rollDirectionRef = useRef(new THREE.Vector3());
  
  // 初期位置設定
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...initialPosition);
      setPlayerPosition(new THREE.Vector3(...initialPosition));
    }
  }, [initialPosition, setPlayerPosition]);
  
  // 無敵状態の点滅エフェクト
  useEffect(() => {
    if (player.isInvincible) {
      const interval = setInterval(() => {
        if (meshRef.current) {
          meshRef.current.visible = !meshRef.current.visible;
        }
      }, 100);
      
      return () => {
        clearInterval(interval);
        if (meshRef.current) {
          meshRef.current.visible = true;
        }
      };
    }
  }, [player.isInvincible]);
  
  useFrame((_, delta) => {
    if (!meshRef.current || gameState !== GameState.PLAYING) return;
    
    const input = getInputState();
    const config = GAME_CONFIG.player;
    const velocity = velocityRef.current;
    
    // ローリング中の処理
    if (player.isRolling) {
      rollTimeRef.current += delta;
      
      if (rollTimeRef.current >= config.rollDuration) {
        setPlayerRolling(false);
        rollTimeRef.current = 0;
      } else {
        // ローリング移動
        meshRef.current.position.add(
          rollDirectionRef.current.clone().multiplyScalar(config.rollSpeed * delta)
        );
        meshRef.current.rotation.x += delta * 10;
        setPlayerPosition(meshRef.current.position.clone());
        return;
      }
    }
    
    // 攻撃処理
    if (input.attack && !player.isAttacking && !player.isRolling) {
      setPlayerAttacking(true);
      attackTimeRef.current = 0;
    }
    
    if (player.isAttacking) {
      attackTimeRef.current += delta;
      
      // 剣を振るアニメーション
      if (swordRef.current) {
        const swingProgress = attackTimeRef.current / config.attackCooldown;
        swordRef.current.rotation.z = Math.sin(swingProgress * Math.PI) * 1.5;
      }
      
      if (attackTimeRef.current >= config.attackCooldown) {
        setPlayerAttacking(false);
        if (swordRef.current) {
          swordRef.current.rotation.z = 0;
        }
      }
    }
    
    // 防御処理
    setPlayerDefending(input.defend);
    
    // ローリング開始
    if (input.roll && player.isGrounded && !player.isRolling && !player.isAttacking) {
      setPlayerRolling(true);
      rollTimeRef.current = 0;
      
      // ローリング方向を決定
      const moveDir = new THREE.Vector3();
      if (input.moveForward || input.touchMoveY < -0.3) moveDir.z -= 1;
      if (input.moveBackward || input.touchMoveY > 0.3) moveDir.z += 1;
      if (input.moveLeft || input.touchMoveX < -0.3) moveDir.x -= 1;
      if (input.moveRight || input.touchMoveX > 0.3) moveDir.x += 1;
      
      if (moveDir.length() > 0) {
        moveDir.normalize();
        // カメラの向きに合わせて回転
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        rollDirectionRef.current.copy(moveDir);
      } else {
        // 入力がなければ前方にローリング
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(meshRef.current.quaternion);
        rollDirectionRef.current.copy(forward);
      }
    }
    
    // 移動入力
    const moveDirection = new THREE.Vector3();
    
    // キーボード入力
    if (input.moveForward) moveDirection.z -= 1;
    if (input.moveBackward) moveDirection.z += 1;
    if (input.moveLeft) moveDirection.x -= 1;
    if (input.moveRight) moveDirection.x += 1;
    
    // タッチ入力（バーチャルジョイスティック）
    if (Math.abs(input.touchMoveX) > 0.1 || Math.abs(input.touchMoveY) > 0.1) {
      moveDirection.x = input.touchMoveX;
      moveDirection.z = input.touchMoveY;
    }
    
    // 移動処理
    if (moveDirection.length() > 0 && !player.isAttacking) {
      moveDirection.normalize();
      
      // カメラの向きに合わせて移動方向を回転
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      
      const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
      moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      // 速度を適用
      velocity.x = moveDirection.x * config.moveSpeed;
      velocity.z = moveDirection.z * config.moveSpeed;
      
      // プレイヤーの向きを更新
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation,
        config.rotationSpeed * delta
      );
    } else {
      // 減速
      velocity.x *= 0.9;
      velocity.z *= 0.9;
    }
    
    // 重力
    velocity.y -= config.gravity * delta;
    
    // ジャンプ
    if (input.jump && player.isGrounded) {
      velocity.y = config.jumpForce;
      setPlayerGrounded(false);
    }
    
    // 位置更新
    meshRef.current.position.add(velocity.clone().multiplyScalar(delta));
    
    // 地面との衝突判定（簡易版）
    if (meshRef.current.position.y <= 1) {
      meshRef.current.position.y = 1;
      velocity.y = 0;
      setPlayerGrounded(true);
    }
    
    // 境界制限
    meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, -48, 48);
    meshRef.current.position.z = THREE.MathUtils.clamp(meshRef.current.position.z, -48, 48);
    
    // 状態を更新
    setPlayerPosition(meshRef.current.position.clone());
    
    // カメラ回転をリセット
    resetCameraRotation();
  });
  
  return (
    <group ref={meshRef}>
      {/* 体（胴体） */}
      <mesh position={[0, 0.2, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
      </mesh>
      
      {/* 頭 */}
      <mesh position={[0, 0.75, 0]} material={headMaterial} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
      </mesh>
      
      {/* 帽子（リンク風の緑帽子） */}
      <mesh position={[0, 0.92, -0.08]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.24, 0.45, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      
      {/* 右腕 */}
      <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 6, 12]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      
      {/* 左腕 */}
      <mesh position={[-0.35, 0.15, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 6, 12]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      
      {/* 右足 */}
      <mesh position={[0.15, -0.35, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 6, 12]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* 左足 */}
      <mesh position={[-0.15, -0.35, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 6, 12]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* 剣 */}
      <group position={[0.55, 0.1, 0]} rotation={[0, 0, -0.4]}>
        <mesh ref={swordRef} position={[0, 0.3, 0]} castShadow>
          {/* 刃 */}
          <boxGeometry args={[0.1, 0.8, 0.02]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} emissive="#4080ff" emissiveIntensity={0.1} />
        </mesh>
        {/* 柄 */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.06]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0, -0.32, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        {/* 柄頭（ポンメル） */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>
      
      {/* 攻撃範囲の可視化（攻撃中のみ表示） */}
      {player.isAttacking && (
        <mesh position={[1.5, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[GAME_CONFIG.player.attackRange, GAME_CONFIG.player.attackRange, 0.1, 32]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.3 + Math.sin(attackTimeRef.current * 20) * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* 攻撃エフェクト（斬撃の軌跡） */}
      {player.isAttacking && attackTimeRef.current < 0.2 && (
        <group position={[1.2, 0.3, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.2, 2.5]} />
            <meshBasicMaterial 
              color="#88ddff" 
              transparent 
              opacity={0.6 - attackTimeRef.current * 3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
      
      {/* 盾 */}
      {player.isDefending && (
        <mesh position={[-0.55, 0.15, 0.15]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.5]} />
          <meshStandardMaterial color="#1e4d8c" metalness={0.6} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default Player;
