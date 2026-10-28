import React, { useState } from 'react';
import { TrendingUp, Moon, Baby, Award, Sparkles } from 'lucide-react';

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
            Análise comportamental e rotinas do bebê
          </p>
        </div>

        <div className="flex bg-[#1e293b] p-0.5 rounded-xl border border-[#334155]">
          <button
            type="button"
            onClick={() => setTimeRange('semana')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeRange === 'semana'
                ? 'bg-blue-600 text-white shadow-sm'
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
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Mês
          </button>
        </div>
      </header>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sleep stats */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-300">
            <Moon className="w-4 h-4 fill-current text-amber-400" />
            <span className="text-xs font-bold text-gray-200">Sono Diário</span>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">14h 20m</div>
          <span className="text-[10.5px] text-emerald-400 font-semibold block">
            +45m vs. semana anterior
          </span>
        </div>

        {/* Feeding stats */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-pink-300">
            <Baby className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-gray-200">Mamadas / dia</span>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">6 a 7x</div>
          <span className="text-[10.5px] text-purple-300 font-semibold block">
            Média de 18min por mamada
          </span>
        </div>
      </div>

      {/* Sleep Bar Chart Representation */}
      <section className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Horas de Sono por Dia</span>
          </span>
          <span className="text-xs text-gray-300 font-medium">Meta: 14h</span>
        </div>

        <div className="flex items-end justify-between h-36 pt-4 px-2">
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
                <span className="text-[10.5px] text-gray-300 font-mono font-semibold">{bar.val}h</span>
                <div className="w-7 bg-[#0f172a] border border-[#334155] rounded-t-xl h-24 flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      i === 5
                        ? 'bg-blue-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${i === 5 ? 'text-blue-400' : 'text-gray-300'}`}>
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Routine Score Card */}
      <section className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Consistência da Rotina</span>
          </div>
          <div className="text-xl font-black text-white font-mono tracking-tight">88% de pontualidade</div>
          <p className="text-[11px] text-gray-300">
            O ritmo do sono e alimentação está se consolidando!
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
      </section>
    </div>
  );
};
