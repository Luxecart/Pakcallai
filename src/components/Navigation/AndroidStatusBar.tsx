import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AndroidStatusBar: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('12:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-mono tracking-tight text-slate-400 select-none border-b border-slate-900/60 bg-[#070b14]/90 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-200">{time}</span>
        <span className="text-[10px] text-slate-500 font-sans">· {user?.carrier || 'Jazz'} 5G</span>
      </div>
      <div className="flex items-center gap-2">
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-300">92%</span>
          <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
        </div>
      </div>
    </div>
  );
};
