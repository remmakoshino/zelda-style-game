// 昼夜システム
export interface TimeSystemConfig {
  // ゲーム内1日の長さ（秒）
  dayDuration: number;
  // 時間経過速度の倍率
  timeScale: number;
}

// 時間帯の定義
export const TimePeriod = {
  DAWN: 'dawn',       // 夜明け (5:00-7:00)
  MORNING: 'morning', // 朝 (7:00-12:00)
  NOON: 'noon',       // 昼 (12:00-14:00)
  AFTERNOON: 'afternoon', // 午後 (14:00-17:00)
  DUSK: 'dusk',       // 夕暮れ (17:00-19:00)
  NIGHT: 'night',     // 夜 (19:00-5:00)
} as const;

export type TimePeriod = typeof TimePeriod[keyof typeof TimePeriod];

// 時間に基づく効果
export interface TimeEffects {
  // ライティング
  sunIntensity: number;
  ambientIntensity: number;
  sunColor: string;
  ambientColor: string;
  skyColor: string;
  fogColor: string;
  fogDensity: number;
  
  // ゲームプレイ効果
  shopOpen: boolean;
  npcActive: boolean;
  strongerEnemies: boolean;
  ghostEnemiesSpawn: boolean;
  specialEventsActive: boolean;
}

// 時間を0-24時間に変換
export const timeOfDayToHours = (timeOfDay: number): number => {
  return (timeOfDay * 24) % 24;
};

// 時間帯を取得
export const getTimePeriod = (timeOfDay: number): TimePeriod => {
  const hours = timeOfDayToHours(timeOfDay);
  
  if (hours >= 5 && hours < 7) return TimePeriod.DAWN;
  if (hours >= 7 && hours < 12) return TimePeriod.MORNING;
  if (hours >= 12 && hours < 14) return TimePeriod.NOON;
  if (hours >= 14 && hours < 17) return TimePeriod.AFTERNOON;
  if (hours >= 17 && hours < 19) return TimePeriod.DUSK;
  return TimePeriod.NIGHT;
};

// 昼間かどうか
export const isDaytime = (timeOfDay: number): boolean => {
  const hours = timeOfDayToHours(timeOfDay);
  return hours >= 6 && hours < 20;
};

// 夜かどうか
export const isNighttime = (timeOfDay: number): boolean => {
  return !isDaytime(timeOfDay);
};

// 色を線形補間
const lerpColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// 数値を線形補間
const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

// 時間帯のプリセット
const TIME_PRESETS: Record<TimePeriod, TimeEffects> = {
  [TimePeriod.DAWN]: {
    sunIntensity: 0.4,
    ambientIntensity: 0.3,
    sunColor: '#ff9955',
    ambientColor: '#443355',
    skyColor: '#ff7755',
    fogColor: '#ffaa88',
    fogDensity: 0.015,
    shopOpen: false,
    npcActive: false,
    strongerEnemies: false,
    ghostEnemiesSpawn: false,
    specialEventsActive: false,
  },
  [TimePeriod.MORNING]: {
    sunIntensity: 0.8,
    ambientIntensity: 0.5,
    sunColor: '#ffffcc',
    ambientColor: '#aaccff',
    skyColor: '#87ceeb',
    fogColor: '#ccddff',
    fogDensity: 0.005,
    shopOpen: true,
    npcActive: true,
    strongerEnemies: false,
    ghostEnemiesSpawn: false,
    specialEventsActive: false,
  },
  [TimePeriod.NOON]: {
    sunIntensity: 1.0,
    ambientIntensity: 0.6,
    sunColor: '#ffffff',
    ambientColor: '#aaddff',
    skyColor: '#55aaff',
    fogColor: '#ddeeFF',
    fogDensity: 0.003,
    shopOpen: true,
    npcActive: true,
    strongerEnemies: false,
    ghostEnemiesSpawn: false,
    specialEventsActive: false,
  },
  [TimePeriod.AFTERNOON]: {
    sunIntensity: 0.9,
    ambientIntensity: 0.55,
    sunColor: '#ffeecc',
    ambientColor: '#bbddff',
    skyColor: '#66bbff',
    fogColor: '#ddeeff',
    fogDensity: 0.004,
    shopOpen: true,
    npcActive: true,
    strongerEnemies: false,
    ghostEnemiesSpawn: false,
    specialEventsActive: false,
  },
  [TimePeriod.DUSK]: {
    sunIntensity: 0.5,
    ambientIntensity: 0.35,
    sunColor: '#ff7733',
    ambientColor: '#554466',
    skyColor: '#ff6644',
    fogColor: '#ff8866',
    fogDensity: 0.01,
    shopOpen: true,
    npcActive: true,
    strongerEnemies: true,
    ghostEnemiesSpawn: false,
    specialEventsActive: false,
  },
  [TimePeriod.NIGHT]: {
    sunIntensity: 0.1,
    ambientIntensity: 0.15,
    sunColor: '#4466aa',
    ambientColor: '#112244',
    skyColor: '#0a1428',
    fogColor: '#111122',
    fogDensity: 0.02,
    shopOpen: false,
    npcActive: false,
    strongerEnemies: true,
    ghostEnemiesSpawn: true,
    specialEventsActive: true,
  },
};

// 時間帯の順序
const TIME_ORDER: TimePeriod[] = [
  TimePeriod.NIGHT,
  TimePeriod.DAWN,
  TimePeriod.MORNING,
  TimePeriod.NOON,
  TimePeriod.AFTERNOON,
  TimePeriod.DUSK,
];

// 時間帯の境界（24時間表記）
const TIME_BOUNDARIES = [
  { period: TimePeriod.NIGHT, start: 19, end: 5 },
  { period: TimePeriod.DAWN, start: 5, end: 7 },
  { period: TimePeriod.MORNING, start: 7, end: 12 },
  { period: TimePeriod.NOON, start: 12, end: 14 },
  { period: TimePeriod.AFTERNOON, start: 14, end: 17 },
  { period: TimePeriod.DUSK, start: 17, end: 19 },
];

// 時間に基づく効果を計算（滑らかな補間）
export const getTimeEffects = (timeOfDay: number): TimeEffects => {
  const hours = timeOfDayToHours(timeOfDay);
  const currentPeriod = getTimePeriod(timeOfDay);
  const currentPreset = TIME_PRESETS[currentPeriod];
  
  // 次の時間帯を取得
  const currentIndex = TIME_ORDER.indexOf(currentPeriod);
  const nextIndex = (currentIndex + 1) % TIME_ORDER.length;
  const nextPeriod = TIME_ORDER[nextIndex];
  const nextPreset = TIME_PRESETS[nextPeriod];
  
  // 現在の時間帯内での進行度を計算
  const boundary = TIME_BOUNDARIES.find(b => b.period === currentPeriod);
  if (!boundary) return currentPreset;
  
  let progress: number;
  if (boundary.start > boundary.end) {
    // 夜間（日をまたぐ）
    if (hours >= boundary.start) {
      progress = (hours - boundary.start) / (24 - boundary.start + boundary.end);
    } else {
      progress = (24 - boundary.start + hours) / (24 - boundary.start + boundary.end);
    }
  } else {
    progress = (hours - boundary.start) / (boundary.end - boundary.start);
  }
  
  // 滑らかな遷移（後半50%で次の時間帯へ）
  const transitionStart = 0.5;
  let blendFactor = 0;
  if (progress > transitionStart) {
    blendFactor = (progress - transitionStart) / (1 - transitionStart);
    // イージング
    blendFactor = blendFactor * blendFactor * (3 - 2 * blendFactor);
  }
  
  return {
    sunIntensity: lerp(currentPreset.sunIntensity, nextPreset.sunIntensity, blendFactor),
    ambientIntensity: lerp(currentPreset.ambientIntensity, nextPreset.ambientIntensity, blendFactor),
    sunColor: lerpColor(currentPreset.sunColor, nextPreset.sunColor, blendFactor),
    ambientColor: lerpColor(currentPreset.ambientColor, nextPreset.ambientColor, blendFactor),
    skyColor: lerpColor(currentPreset.skyColor, nextPreset.skyColor, blendFactor),
    fogColor: lerpColor(currentPreset.fogColor, nextPreset.fogColor, blendFactor),
    fogDensity: lerp(currentPreset.fogDensity, nextPreset.fogDensity, blendFactor),
    shopOpen: currentPreset.shopOpen,
    npcActive: currentPreset.npcActive,
    strongerEnemies: currentPreset.strongerEnemies,
    ghostEnemiesSpawn: currentPreset.ghostEnemiesSpawn,
    specialEventsActive: currentPreset.specialEventsActive,
  };
};

// 太陽の位置を計算
export const getSunPosition = (timeOfDay: number): { x: number; y: number; z: number } => {
  const hours = timeOfDayToHours(timeOfDay);
  // 6時が日の出、18時が日没と仮定
  const angle = ((hours - 6) / 12) * Math.PI; // 0-π
  
  // 夜間は地平線の下
  const isDay = hours >= 6 && hours < 18;
  
  if (isDay) {
    return {
      x: Math.cos(angle) * 50,
      y: Math.sin(angle) * 50,
      z: -30,
    };
  } else {
    // 夜間は反対側（月の位置）
    const nightAngle = ((hours - 18 + (hours < 6 ? 24 : 0)) / 12) * Math.PI;
    return {
      x: -Math.cos(nightAngle) * 50,
      y: Math.sin(nightAngle) * 30, // 月は低め
      z: -30,
    };
  }
};

// 時間を文字列に変換
export const formatTime = (timeOfDay: number): string => {
  const hours = timeOfDayToHours(timeOfDay);
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
