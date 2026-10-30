import React from 'react';
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
      className="relative w-full bg-[#1e293b] border border-[#334155] rounded-full p-1.5 flex items-center justify-between gap-1 select-none shadow-lg overflow-hidden touch-manipulation transition-colors duration-200"
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
            className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all duration-200 group z-10 touch-manipulation cursor-pointer active:scale-95 focus:outline-none hover:bg-white/10 ${
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[#858cae] hover:text-white'
            }`}
          >
            {/* Icon */}
            <div
              className={`relative z-10 w-9 h-6 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                isActive
                  ? 'text-[var(--color-accent)] scale-110'
                  : 'text-[#858cae] group-hover:text-white group-hover:scale-110'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Label */}
            <span
              className={`relative z-10 text-[10.5px] tracking-tight leading-none transition-all duration-200 ${
                isActive
                  ? 'font-extrabold text-[var(--color-accent)]'
                  : 'font-semibold text-[#858cae] group-hover:text-white'
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
