import React from 'react';
import { ShieldCheck, Calendar, Pill, Activity, CheckCircle2, ChevronRight, Plus } from 'lucide-react';

export const HealthScreen: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-4.5 pt-2 pb-6 space-y-4 no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            Saúde &amp; Pediatria
          </h1>
          <p className="text-xs text-[#8c91af] mt-0.5">
            Acompanhamento clínico do John
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Saúde em dia</span>
        </span>
      </header>

      {/* Biometric Stats Card */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Última Medição (4 Meses)</span>
          </span>
          <span className="text-xs text-gray-400">10 de Agosto</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-[#1c1f36] p-3 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-400 block font-medium">Peso</span>
            <span className="text-lg font-black text-white block mt-0.5">6.85 kg</span>
            <span className="text-[9.5px] text-emerald-400">Percentil 50</span>
          </div>

          <div className="bg-[#1c1f36] p-3 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-400 block font-medium">Altura</span>
            <span className="text-lg font-black text-white block mt-0.5">64.0 cm</span>
            <span className="text-[9.5px] text-emerald-400">Percentil 55</span>
          </div>

          <div className="bg-[#1c1f36] p-3 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-400 block font-medium">Perímetro C.</span>
            <span className="text-lg font-black text-white block mt-0.5">41.5 cm</span>
            <span className="text-[9.5px] text-emerald-400">Percentil 50</span>
          </div>
        </div>
      </section>

      {/* Pediatric Appointment */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-[#282752] text-[#9a7ffc] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">
              Próxima Consulta
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">
              Dra. Helena (Pediatra)
            </span>
            <span className="text-xs text-purple-300">05 de Setembro · 14:30</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </section>

      {/* Vaccines Check */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vacinas do Calendário</span>
          </span>
          <span className="text-xs text-emerald-400 font-bold">4 meses aplicadas</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { name: 'Pentavalente (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'VIP - Poliomielite (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Pneumocócica 10V (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Rotavírus Humano (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Meningocócica C (Próxima)', status: 'Agendada para 5 meses', ok: false },
          ].map((vac) => (
            <div
              key={vac.name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1d33] border border-gray-800"
            >
              <div>
                <span className="font-semibold text-white block">{vac.name}</span>
                <span className="text-[10px] text-gray-400">{vac.status}</span>
              </div>
              {vac.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 text-[10px] font-bold">
                  Previsto
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Daily Supplement */}
      <section className="bg-[#151728] border border-[#262a44] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Vitamina D (Colecalciferol)</span>
            <span className="text-[11px] text-gray-400">2 gotas diárias pela manhã · Administrado hoje</span>
          </div>
        </div>
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      </section>

    </div>
  );
};
