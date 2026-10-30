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
      role="tablist"
      aria-label="Navegação Principal"
      className="relative w-full bg-[#1e293b] border border-[#334155] rounded-full p-1.5 flex items-center justify-between gap-1 select-none shadow-lg overflow-hidden touch-manipulation transition-all duration-300"
      data-purpose="bottom-tab-navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            onClick={() => onTabChange(item.id)}
            className="relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all duration-150 group z-10 touch-manipulation cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {/* Translucent Liquid Glass Pill for Active Tab */}
            {isActive && (
              <motion.div
                layoutId="liquid-nav-indicator"
                transition={{
                  type: 'spring',
                  stiffness: 480,
                  damping: 30,
                  mass: 0.35,
                }}
                className="absolute inset-0 rounded-full backdrop-blur-md pointer-events-none overflow-hidden shadow-inner"
              >
                {/* Translucent Theme Accent Glass Fill (35% opacity) */}
                <div
                  className="absolute inset-0 rounded-full opacity-35"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                {/* Soft Liquid Top Highlight */}
                <div className="absolute top-0 inset-x-3 h-1/2 bg-white/20 rounded-t-full pointer-events-none" />
              </motion.div>
            )}

            {/* Icon with instant state and liquid bounce */}
            <div
              className={`relative z-10 w-9 h-6 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-150 ${
                isActive
                  ? 'text-white scale-110 -translate-y-0.5'
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
