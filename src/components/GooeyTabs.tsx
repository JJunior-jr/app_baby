import React from 'react';
import { motion } from 'motion/react';

export interface GooeyTabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface GooeyTabsProps {
  tabs: GooeyTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId: string;
  variant?: 'light' | 'dark' | 'primary';
  className?: string;
  activeColor?: string;
  activeTextColor?: string;
}

export const GooeyTabs: React.FC<GooeyTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  layoutId,
  variant = 'dark',
  className = '',
  activeColor,
  activeTextColor,
}) => {
  return (
    <div className={`relative select-none ${className}`}>
      {/* SVG Gooey Filter definition (only rendered once per app, but safe in any component) */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id={`gooey-filter-${layoutId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Outer Tab Track Container */}
      <div
        className={`relative grid p-1 rounded-2xl border transition-colors duration-200 overflow-hidden ${
          variant === 'light'
            ? 'bg-[#f4ebd9]/90 border-[#e3d3bd] text-[#4a3b32]'
            : variant === 'primary'
            ? 'bg-[#131527] border-gray-800 text-gray-300'
            : 'bg-[#0e101f] border-gray-800 text-gray-400'
        }`}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Liquid Gooey Morphing Layer */}
        <div
          className="absolute inset-1 pointer-events-none"
          style={{
            filter: `url(#gooey-filter-${layoutId})`,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            if (!isActive) return null;

            return (
              <motion.div
                key={tab.id}
                layoutId={`gooey-pill-${layoutId}`}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 25,
                  mass: 0.45,
                }}
                className={`absolute inset-0 rounded-xl pointer-events-none shadow-md ${
                  variant === 'light'
                    ? 'border-2 border-black/80 bg-[#c49272]'
                    : variant === 'primary'
                    ? 'bg-purple-600 shadow-[0_4px_16px_rgba(147,51,234,0.45)]'
                    : 'bg-purple-600 shadow-[0_4px_14px_rgba(147,51,234,0.4)]'
                }`}
                style={
                  activeColor
                    ? {
                        backgroundColor: activeColor,
                        color: activeTextColor || '#ffffff',
                      }
                    : undefined
                }
              >
                {/* Molten liquid sheen highlight */}
                <div className="absolute top-0 inset-x-2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* Tab Buttons (Rendered crisply above the gooey backdrop) */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative z-10 py-2 px-1.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer text-xs active:scale-95 group focus:outline-hidden ${
                isActive
                  ? variant === 'light'
                    ? 'text-white font-extrabold'
                    : 'text-white font-extrabold'
                  : variant === 'light'
                  ? 'text-[#6c5a4d] hover:text-[#2d2219]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* Subtle hover droplet feedback */}
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />

              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'group-hover:scale-105'
                  }`}
                />
              )}

              <span className="truncate">{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border transition-colors ${
                    isActive
                      ? 'bg-black/30 text-white border-white/20'
                      : 'bg-white/10 text-gray-400 border-white/10 group-hover:text-gray-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
