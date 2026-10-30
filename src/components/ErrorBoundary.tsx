import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Baby John app:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080913] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold">Ops! Ocorreu um erro ao carregar o aplicativo.</h2>
            <p className="text-xs text-gray-300 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto text-left max-h-32">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  // ignore
                }
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Reiniciar Aplicativo (Limpar Cache)
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
