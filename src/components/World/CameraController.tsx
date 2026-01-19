import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useInputManager } from '../../hooks/useInputManager';
import { GAME_CONFIG, GameState } from '../../data/gameConfig';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { getInputState, resetCameraRotation, isTouchDevice } = useInputManager();
  const { player, gameState } = useGameStore();
  
  const sphericalRef = useRef(new THREE.Spherical(
    GAME_CONFIG.camera.distance,
    Math.PI / 3, // 上からの角度
    0 // 水平角度
  ));
  
  const targetRef = useRef(new THREE.Vector3());
  const currentPositionRef = useRef(new THREE.Vector3());
  
  // マウスドラッグ用
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  // タッチカメラ操作用
  useEffect(() => {
    if (!isTouchDevice) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // カメラ回転領域かチェック（画面右半分）
        const touch = e.touches[0];
        if (touch.clientX > window.innerWidth * 0.5) {
          isDraggingRef.current = true;
          lastMouseRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMouseRef.current.x;
        const deltaY = touch.clientY - lastMouseRef.current.y;
        
        sphericalRef.current.theta -= deltaX * 0.01;
        sphericalRef.current.phi += deltaY * 0.01;
        
        // 角度制限
        sphericalRef.current.phi = THREE.MathUtils.clamp(
          sphericalRef.current.phi,
          0.3,
          Math.PI / 2 - 0.1
        );
        
        lastMouseRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };
    
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouchDevice]);
  
  // PC用マウス操作
  useEffect(() => {
    if (isTouchDevice) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - lastMouseRef.current.x;
        const deltaY = e.clientY - lastMouseRef.current.y;
        
        sphericalRef.current.theta -= deltaX * 0.005;
        sphericalRef.current.phi += deltaY * 0.005;
        
        // 角度制限
        sphericalRef.current.phi = THREE.MathUtils.clamp(
          sphericalRef.current.phi,
          0.3,
          Math.PI / 2 - 0.1
        );
        
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    const handleWheel = (e: WheelEvent) => {
      sphericalRef.current.radius += e.deltaY * 0.01;
      sphericalRef.current.radius = THREE.MathUtils.clamp(
        sphericalRef.current.radius,
        GAME_CONFIG.camera.minDistance,
        GAME_CONFIG.camera.maxDistance
      );
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isTouchDevice]);
  
  useFrame((_, delta) => {
    if (gameState !== GameState.PLAYING) return;
    
    const config = GAME_CONFIG.camera;
    const input = getInputState();
    
    // キーボードでのカメラ回転
    if (input.cameraRotateX !== 0 || input.cameraRotateY !== 0) {
      sphericalRef.current.theta -= input.cameraRotateX;
      sphericalRef.current.phi += input.cameraRotateY;
      
      sphericalRef.current.phi = THREE.MathUtils.clamp(
        sphericalRef.current.phi,
        0.3,
        Math.PI / 2 - 0.1
      );
      
      resetCameraRotation();
    }
    
    // ターゲット位置（プレイヤーの少し上）
    targetRef.current.copy(player.position);
    targetRef.current.y += config.height;
    
    // 球面座標からカメラ位置を計算
    const offset = new THREE.Vector3();
    offset.setFromSpherical(sphericalRef.current);
    
    // 目標カメラ位置
    const targetCameraPosition = targetRef.current.clone().add(offset);
    
    // スムーズに追従
    currentPositionRef.current.lerp(targetCameraPosition, config.followSpeed * delta);
    camera.position.copy(currentPositionRef.current);
    
    // カメラをプレイヤーに向ける
    camera.lookAt(targetRef.current);
  });
  
  return null;
};

export default CameraController;
