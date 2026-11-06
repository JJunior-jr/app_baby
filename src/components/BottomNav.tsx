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
      className="relative w-full h-[66px] bg-[#12141a]/90 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between p-1.5 select-none shadow-2xl overflow-hidden touch-manipulation transition-all duration-300"
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
            className="relative flex-1 h-full flex flex-col items-center justify-center z-10 touch-manipulation cursor-pointer group focus:outline-none rounded-full"
          >
            {/* Animated Spotlight / Beam Light Indicator matching image_25a0125b.png */}
            {isActive && (
              <motion.div
                layoutId="spotlight-active-indicator"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  mass: 0.8,
                }}
                className="absolute inset-0 z-0 flex flex-col items-center justify-start overflow-hidden rounded-full pointer-events-none"
              >
                {/* Top Edge Glowing Cyan Pill Bar */}
                <div className="w-10 h-[3.5px] rounded-full bg-cyan-300 shadow-[0_0_14px_#22d3ee,0_0_6px_#22d3ee]" />

                {/* Volumetric Spotlight Beam (Trapezoidal Light Cone) */}
                <div
                  className="w-full flex-1 opacity-90"
                  style={{
                    clipPath: 'polygon(25% 0%, 75% 0%, 98% 100%, 2% 100%)',
                    background:
                      'linear-gradient(to bottom, rgba(34, 211, 238, 0.38) 0%, rgba(34, 211, 238, 0.12) 55%, rgba(34, 211, 238, 0) 100%)',
                  }}
                />
              </motion.div>
            )}

            {/* Icon */}
            <div
              className={`relative z-10 transition-all duration-300 flex items-center justify-center mb-0.5 ${
                isActive
                  ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] -translate-y-0.5'
                  : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Label */}
            <span
              className={`relative z-10 text-[10.5px] tracking-tight leading-none transition-all duration-200 ${
                isActive
                  ? 'font-bold text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                  : 'font-medium text-slate-400 group-hover:text-slate-200'
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


