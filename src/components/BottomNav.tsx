import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, BookOpen, Clock, TrendingUp, ShieldCheck } from 'lucide-react';

export type TabType = 'inicio' | 'diario' | 'rotinas' | 'insights' | 'saude';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Início', icon: LayoutGrid },
  { id: 'diario', label: 'Diário', icon: BookOpen },
  { id: 'rotinas', label: 'Rotinas', icon: Clock },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'saude', label: 'Saúde', icon: ShieldCheck },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      className="relative w-full backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-full p-1.5 flex items-center justify-between gap-1 select-none shadow-[0_16px_45px_rgba(0,0,0,0.55),inset_0_1.5px_2px_rgba(255,255,255,0.45)] overflow-hidden touch-manipulation transition-all duration-300"
      data-purpose="bottom-tab-navigation"
    >
      {/* Specular Diagonal Reflection Sheen */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent rounded-t-full pointer-events-none" />
      <div className="glass-reflection-line" />

      {/* Liquid Top Rim Light Line */}
      <div className="absolute top-0 inset-x-5 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className="relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all duration-150 group z-10 touch-manipulation cursor-pointer active:scale-92 active:translate-y-0.5 focus:outline-hidden"
          >
            {/* Liquid Morphing Pill for Active Tab with Mesh Gradient & 3D Glass Highlights */}
            {isActive && (
              <motion.div
                layoutId="liquid-nav-indicator"
                transition={{
                  type: 'spring',
                  stiffness: 650,
                  damping: 35,
                  mass: 0.35,
                }}
                className="absolute inset-0 rounded-full border-t border-l border-white/60 border-b border-r border-white/25 shadow-[0_8px_24px_rgba(139,92,246,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-2px_4px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden pointer-events-none bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600"
              >
                {/* Liquid convex lens reflection arc */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/50 via-white/15 to-transparent rounded-t-full pointer-events-none" />
                {/* Internal optical color dodge point of light */}
                <div className="absolute -top-1 left-2 w-4 h-4 rounded-full bg-cyan-300 opacity-80 blur-xs mix-blend-color-dodge pointer-events-none" />
                {/* Bottom caustic refraction glow */}
                <div className="absolute -bottom-1 inset-x-2 h-2.5 rounded-full bg-purple-400 blur-xs pointer-events-none opacity-90" />
              </motion.div>
            )}

            {/* Icon with instant state and liquid bounce */}
            <div
              className={`relative z-10 w-9 h-6 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-150 ${
                isActive
                  ? 'text-white scale-110 -translate-y-0.5 drop-shadow-[0_2px_10px_rgba(192,132,252,0.9)]'
                  : 'text-[#858cae] group-hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Label with crisp immediate contrast */}
            <span
              className={`relative z-10 text-[10.5px] tracking-tight leading-none transition-all duration-150 ${
                isActive
                  ? 'font-extrabold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] scale-105'
                  : 'font-semibold text-[#858cae] group-hover:text-gray-300'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

