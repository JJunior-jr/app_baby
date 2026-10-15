import React, { useState } from 'react';
import { TrendingUp, Moon, Baby, Shirt, Award, Calendar } from 'lucide-react';

export const InsightsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'semana' | 'mes'>('semana');

  return (
    <div className="flex-1 overflow-y-auto px-4.5 pt-2 pb-6 space-y-4 no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            Insights &amp; Padrões
          </h1>
          <p className="text-xs text-gray-300 mt-0.5">
            Análise comportamental e rotinas do John
          </p>
        </div>

        <div className="flex bg-white/10 backdrop-blur-[12px] p-0.5 rounded-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
          <button
            type="button"
            onClick={() => setTimeRange('semana')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeRange === 'semana'
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md border border-white/35'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('mes')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeRange === 'mes'
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-md border border-white/35'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Mês
          </button>
        </div>
      </header>

      {/* Highlights Grid - 3D Glass Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sleep stats */}
        <div className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-amber-500/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 space-y-2 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <div className="glass-reflection-line" />

          <div className="flex items-center space-x-2 text-amber-300 relative z-10">
            <Moon className="w-4 h-4 fill-current text-amber-400" />
            <span className="text-xs font-bold text-gray-200">Sono Diário</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight relative z-10">14h 20m</div>
          <span className="text-[10px] text-emerald-300 font-semibold block relative z-10">
            +45m vs. semana anterior
          </span>
        </div>

        {/* Feeding stats */}
        <div className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-purple-500/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 space-y-2 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <div className="glass-reflection-line" />

          <div className="flex items-center space-x-2 text-pink-300 relative z-10">
            <Baby className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-bold text-gray-200">Mamadas / dia</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight relative z-10">6 a 7x</div>
          <span className="text-[10px] text-purple-200 font-semibold block relative z-10">
            Média de 18min por mamada
          </span>
        </div>
      </div>

      {/* Sleep Bar Chart Representation - 3D Glass Panel with Liquid Mesh Bars */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 space-y-3 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Horas de Sono por Dia</span>
          </span>
          <span className="text-xs text-gray-300 font-medium">Meta: 14h</span>
        </div>

        <div className="flex items-end justify-between h-36 pt-4 px-2 relative z-10">
          {[
            { day: 'Sex', val: 13.5 },
            { day: 'Sáb', val: 14.2 },
            { day: 'Dom', val: 15.0 },
            { day: 'Seg', val: 13.8 },
            { day: 'Ter', val: 14.5 },
            { day: 'Qua', val: 14.2 },
          ].map((bar, i) => {
            const heightPercent = Math.round((bar.val / 16) * 100);
            return (
              <div key={bar.day} className="flex flex-col items-center space-y-2">
                <span className="text-[10px] text-gray-300">{bar.val}h</span>
                <div className="w-7 bg-white/10 border border-white/20 rounded-t-xl h-24 flex items-end overflow-hidden p-0.5 backdrop-blur-xs">
                  <div
                    className={`w-full rounded-t-lg transition-all shadow-[0_0_8px_rgba(168,85,247,0.6)] ${
                      i === 5
                        ? 'bg-gradient-to-t from-pink-500 via-purple-600 to-cyan-400'
                        : 'bg-gradient-to-t from-purple-800 to-indigo-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${i === 5 ? 'text-pink-300' : 'text-gray-300'}`}>
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Routine Score Card - 3D Glassmorphism */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-purple-500/15 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-1.5 text-amber-300">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold text-amber-200">Consistência da Rotina</span>
          </div>
          <div className="text-xl font-black text-white">88% de pontualidade</div>
          <p className="text-[11px] text-gray-300">
            O ritmo do sono e alimentação está se consolidando!
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/15 border-t border-l border-white/35 border-b border-r border-white/15 flex items-center justify-center text-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-md relative z-10">
          🌟
        </div>
      </section>

    </div>
  );
};
