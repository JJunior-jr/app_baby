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
          <p className="text-xs text-[#8c91af] mt-0.5">
            Análise comportamental e rotinas do John
          </p>
        </div>

        <div className="flex bg-[#16192d] p-0.5 rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => setTimeRange('semana')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeRange === 'semana' ? 'bg-[#7158e2] text-white' : 'text-gray-400'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('mes')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              timeRange === 'mes' ? 'bg-[#7158e2] text-white' : 'text-gray-400'
            }`}
          >
            Mês
          </button>
        </div>
      </header>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sleep stats */}
        <div className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <Moon className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold text-gray-300">Sono Diário</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">14h 20m</div>
          <span className="text-[10px] text-emerald-400 font-medium block">
            +45m vs. semana anterior
          </span>
        </div>

        {/* Feeding stats */}
        <div className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-[#9b87f5]">
            <Baby className="w-4 h-4" />
            <span className="text-xs font-bold text-gray-300">Mamadas / dia</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">6 a 7x</div>
          <span className="text-[10px] text-purple-300 font-medium block">
            Média de 18min por mamada
          </span>
        </div>
      </div>

      {/* Sleep Bar Chart Representation */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Horas de Sono por Dia</span>
          </span>
          <span className="text-xs text-gray-400">Meta: 14h</span>
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
                <span className="text-[10px] text-gray-400">{bar.val}h</span>
                <div className="w-7 bg-[#1e223b] rounded-t-xl h-24 flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      i === 5 ? 'bg-[#9a7ffc]' : 'bg-[#52449a]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${i === 5 ? 'text-[#9a7ffc]' : 'text-gray-400'}`}>
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Routine Score Card */}
      <section className="bg-gradient-to-br from-[#1c183b] to-[#151728] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-300">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold">Consistência da Rotina</span>
          </div>
          <div className="text-xl font-black text-white">88% de pontualidade</div>
          <p className="text-[11px] text-gray-400">
            O ritmo do sono e alimentação está se consolidando!
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#2b2554] border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
          🌟
        </div>
      </section>

    </div>
  );
};
