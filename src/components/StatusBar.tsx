import React from 'react';
import { Mail, Wifi, Bell } from 'lucide-react';

interface StatusBarProps {
  timeStr?: string;
  batteryLevel?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  timeStr = '23:08',
  batteryLevel = 68,
}) => {
  return (
    <header className="w-full pt-3 px-6 pb-2 flex justify-between items-center text-xs font-semibold text-gray-200 select-none tracking-tight z-30">
      {/* Left side: Time and app notification glyphs */}
      <div className="flex items-center space-x-2">
        <span className="font-bold text-[13.5px] text-white tracking-tight">{timeStr}</span>
        <div className="flex items-center space-x-1.5 opacity-80 text-[10px]">
          <Bell className="w-3 h-3 text-gray-300" />
          <Mail className="w-3 h-3 text-gray-300" />
          <span className="font-bold text-[9px] px-0.5 border border-gray-400 rounded-sm leading-none">M</span>
        </div>
      </div>

      {/* Right side: VoLTE, Wi-Fi, Cellular, Battery */}
      <div className="flex items-center space-x-2 text-[11px] opacity-90">
        <Wifi className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-[9px] font-bold border border-gray-400/80 px-1 py-0.2 rounded leading-none">
          VoLTE1
        </span>
        <div className="flex items-end space-x-[1.5px] h-3">
          <span className="w-[2px] h-1 bg-white rounded-xs"></span>
          <span className="w-[2px] h-1.5 bg-white rounded-xs"></span>
          <span className="w-[2px] h-2 bg-white rounded-xs"></span>
          <span className="w-[2px] h-2.5 bg-white rounded-xs"></span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[12px] font-medium">{batteryLevel}%</span>
          <div className="w-5 h-2.5 border border-gray-300 rounded-[2px] p-[1px] flex items-center relative">
            <div
              className="bg-gray-200 h-full rounded-[1px]"
              style={{ width: `${batteryLevel}%` }}
            ></div>
            <div className="absolute -right-1 top-0.5 w-[2px] h-1.5 bg-gray-300 rounded-r-xs"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
