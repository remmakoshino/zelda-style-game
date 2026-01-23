import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { getTimeEffects, getSunPosition, isDaytime } from '../../systems/TimeSystem';
import { GAME_CONFIG, GameState } from '../../data/gameConfig';

interface DayNightLightingProps {
  enableFog?: boolean;
}

export const DayNightLighting: React.FC<DayNightLightingProps> = ({ enableFog = true }) => {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemisphereRef = useRef<THREE.HemisphereLight>(null);
  
  const { world, advanceTime, gameState } = useGameStore();
  
  // 時間帯に基づく効果を取得
  const timeEffects = useMemo(() => {
    return getTimeEffects(world.timeOfDay);
  }, [world.timeOfDay]);
  
  // 太陽/月の位置
  const celestialPosition = useMemo(() => {
    return getSunPosition(world.timeOfDay);
  }, [world.timeOfDay]);
  
  // 昼間かどうか
  const isDay = useMemo(() => {
    return isDaytime(world.timeOfDay);
  }, [world.timeOfDay]);
  
  // フレームごとの更新
  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;
    
    // 時間を進める（1日 = GAME_CONFIG.world.dayDuration秒）
    const timeIncrement = delta / GAME_CONFIG.world.dayDuration;
    advanceTime(timeIncrement);
    
    // ライトの更新
    if (sunLightRef.current) {
      sunLightRef.current.intensity = isDay ? timeEffects.sunIntensity : 0;
      sunLightRef.current.color.set(timeEffects.sunColor);
      sunLightRef.current.position.set(
        celestialPosition.x,
        celestialPosition.y,
        celestialPosition.z
      );
    }
    
    if (moonLightRef.current) {
      moonLightRef.current.intensity = isDay ? 0 : timeEffects.sunIntensity * 0.5;
      moonLightRef.current.color.set('#aabbff');
      if (!isDay) {
        moonLightRef.current.position.set(
          celestialPosition.x,
          celestialPosition.y,
          celestialPosition.z
        );
      }
    }
    
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = timeEffects.ambientIntensity;
      ambientLightRef.current.color.set(timeEffects.ambientColor);
    }
    
    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = timeEffects.ambientIntensity * 0.5;
      hemisphereRef.current.color.set(timeEffects.skyColor);
      hemisphereRef.current.groundColor.set('#553322');
    }
    
    // 背景色（空）の更新
    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.set(timeEffects.skyColor);
    } else {
      state.scene.background = new THREE.Color(timeEffects.skyColor);
    }
    
    // フォグの更新
    if (enableFog) {
      if (!state.scene.fog) {
        state.scene.fog = new THREE.FogExp2(timeEffects.fogColor, timeEffects.fogDensity);
      } else if (state.scene.fog instanceof THREE.FogExp2) {
        state.scene.fog.color.set(timeEffects.fogColor);
        state.scene.fog.density = timeEffects.fogDensity;
      }
    }
  });
  
  return (
    <>
      {/* 太陽光 */}
      <directionalLight
        ref={sunLightRef}
        position={[celestialPosition.x, celestialPosition.y, celestialPosition.z]}
        intensity={isDay ? timeEffects.sunIntensity : 0}
        color={timeEffects.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      
      {/* 月光 */}
      <directionalLight
        ref={moonLightRef}
        position={[-celestialPosition.x, celestialPosition.y * 0.6, celestialPosition.z]}
        intensity={isDay ? 0 : timeEffects.sunIntensity * 0.3}
        color="#aabbff"
        castShadow={!isDay}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* 環境光 */}
      <ambientLight
        ref={ambientLightRef}
        intensity={timeEffects.ambientIntensity}
        color={timeEffects.ambientColor}
      />
      
      {/* 半球ライト（空と地面の反射光） */}
      <hemisphereLight
        ref={hemisphereRef}
        intensity={timeEffects.ambientIntensity * 0.5}
        color={timeEffects.skyColor}
        groundColor="#553322"
      />
      
      {/* 夜間の星空効果用ポイントライト（微量） */}
      {!isDay && (
        <>
          <pointLight
            position={[30, 40, 30]}
            intensity={0.1}
            color="#ffffff"
            distance={100}
          />
          <pointLight
            position={[-30, 40, -30]}
            intensity={0.1}
            color="#ffffff"
            distance={100}
          />
        </>
      )}
    </>
  );
};

export default DayNightLighting;
