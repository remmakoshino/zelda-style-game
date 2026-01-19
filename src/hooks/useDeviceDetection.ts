import { useState, useEffect, useCallback } from 'react';
import { DeviceType } from '../data/gameConfig';

export interface DeviceInfo {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());
  
  function getDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    let deviceType: DeviceType;
    if (width < 768) {
      deviceType = DeviceType.MOBILE;
    } else if (width < 1024) {
      deviceType = DeviceType.TABLET;
    } else {
      deviceType = DeviceType.DESKTOP;
    }
    
    return {
      deviceType,
      isTouchDevice,
      orientation: width > height ? 'landscape' : 'portrait',
      screenWidth: width,
      screenHeight: height,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    };
  }
  
  const handleResize = useCallback(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);
  
  const handleOrientationChange = useCallback(() => {
    // 少し遅延を入れて正確なサイズを取得
    setTimeout(() => {
      setDeviceInfo(getDeviceInfo());
    }, 100);
  }, []);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [handleResize, handleOrientationChange]);
  
  return deviceInfo;
};

// レスポンシブなサイズ計算ユーティリティ
export const getResponsiveSize = (
  base: number,
  deviceType: DeviceType,
  multipliers: { mobile?: number; tablet?: number; desktop?: number } = {}
): number => {
  const { mobile = 0.6, tablet = 0.8, desktop = 1 } = multipliers;
  
  switch (deviceType) {
    case DeviceType.MOBILE:
      return base * mobile;
    case DeviceType.TABLET:
      return base * tablet;
    case DeviceType.DESKTOP:
    default:
      return base * desktop;
  }
};

// フォントサイズ計算
export const getResponsiveFontSize = (
  base: number,
  deviceType: DeviceType
): string => {
  const size = getResponsiveSize(base, deviceType, {
    mobile: 0.75,
    tablet: 0.875,
    desktop: 1,
  });
  return `${size}px`;
};
