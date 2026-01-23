import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { formatTime, getTimePeriod, TimePeriod, isDaytime } from '../../systems/TimeSystem';
import './TimeDisplay.css';

export const TimeDisplay: React.FC = () => {
  const { world } = useGameStore();
  
  const time = formatTime(world.timeOfDay);
  const period = getTimePeriod(world.timeOfDay);
  const isDay = isDaytime(world.timeOfDay);
  
  // 時間帯の日本語名
  const periodNames: Record<TimePeriod, string> = {
    [TimePeriod.DAWN]: '夜明け',
    [TimePeriod.MORNING]: '朝',
    [TimePeriod.NOON]: '昼',
    [TimePeriod.AFTERNOON]: '午後',
    [TimePeriod.DUSK]: '夕暮れ',
    [TimePeriod.NIGHT]: '夜',
  };
  
  // アイコン
  const getIcon = () => {
    if (period === TimePeriod.NIGHT) return '🌙';
    if (period === TimePeriod.DAWN || period === TimePeriod.DUSK) return '🌅';
    return '☀️';
  };
  
  return (
    <div className={`time-display ${isDay ? 'day' : 'night'}`}>
      <span className="time-icon">{getIcon()}</span>
      <div className="time-info">
        <span className="time-clock">{time}</span>
        <span className="time-period">{periodNames[period]}</span>
      </div>
    </div>
  );
};

export default TimeDisplay;
