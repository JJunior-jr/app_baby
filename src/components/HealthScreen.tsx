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
          <p className="text-xs text-gray-300 mt-0.5">
            Acompanhamento clínico do John
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Saúde em dia</span>
        </div>
      </header>

      {/* Biometric Stats Card - 3D Glassmorphism */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 space-y-3 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-pink-300" />
            <span>Última Medição (4 Meses)</span>
          </span>
          <span className="text-xs text-gray-300">10 de Agosto</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1 relative z-10">
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <span className="text-[10px] text-gray-300 block font-medium">Peso</span>
            <span className="text-lg font-black text-white block mt-0.5">6.85 kg</span>
            <span className="text-[9.5px] text-emerald-300 font-semibold">Percentil 50</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <span className="text-[10px] text-gray-300 block font-medium">Altura</span>
            <span className="text-lg font-black text-white block mt-0.5">64.0 cm</span>
            <span className="text-[9.5px] text-emerald-300 font-semibold">Percentil 55</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <span className="text-[10px] text-gray-300 block font-medium">Perímetro C.</span>
            <span className="text-lg font-black text-white block mt-0.5">41.5 cm</span>
            <span className="text-[9.5px] text-emerald-300 font-semibold">Percentil 50</span>
          </div>
        </div>
      </section>

      {/* Pediatric Appointment - 3D Glassmorphism */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/15 border-t border-l border-white/35 border-b border-r border-white/15 text-purple-200 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <Calendar className="w-5 h-5 text-pink-300" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-gray-300 uppercase tracking-wider block">
              Próxima Consulta
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">
              Dra. Helena (Pediatra)
            </span>
            <span className="text-xs text-purple-300 font-medium">05 de Setembro · 14:30</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 relative z-10" />
      </section>

      {/* Vaccines Check - 3D Glassmorphism */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 space-y-3 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vacinas do Calendário</span>
          </span>
          <span className="text-xs text-emerald-300 font-bold">4 meses aplicadas</span>
        </div>

        <div className="space-y-2 text-xs relative z-10">
          {[
            { name: 'Pentavalente (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'VIP - Poliomielite (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Pneumocócica 10V (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Rotavírus Humano (2ª dose)', status: 'Aplicada em 10/08', ok: true },
            { name: 'Meningocócica C (Próxima)', status: 'Agendada para 5 meses', ok: false },
          ].map((vac) => (
            <div
              key={vac.name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            >
              <div>
                <span className="font-semibold text-white block">{vac.name}</span>
                <span className="text-[10px] text-gray-300">{vac.status}</span>
              </div>
              {vac.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/25 border border-purple-400/40 text-purple-200 text-[10px] font-bold">
                  Previsto
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Daily Supplement - 3D Glassmorphism */}
      <section className="backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 rounded-2xl p-4 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
        <div className="glass-reflection-line" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border-t border-l border-white/35 border-b border-r border-white/15 text-amber-300 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Vitamina D (Colecalciferol)</span>
            <span className="text-[11px] text-gray-300">2 gotas diárias pela manhã · Administrado hoje</span>
          </div>
        </div>
        <CheckCircle2 className="w-5 h-5 text-emerald-400 relative z-10" />
      </section>

    </div>
  );
};
