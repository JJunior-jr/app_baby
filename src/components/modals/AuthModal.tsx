import React, { useState } from 'react';
import { X, Shield, Key, User, LogOut, CheckCircle2, Copy, Check } from 'lucide-react';
import { authService, parseJwt } from '../../services/auth';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'status' | 'login' | 'register'>('status');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [babyName, setBabyName] = useState('John');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentToken = authService.getToken();
  const parsedToken = currentToken ? parseJwt(currentToken) : null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const { user } = authService.login(email, password);
    onUserChange(user);
    setMode('status');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    const { user } = authService.register(name, email, babyName);
    onUserChange(user);
    setMode('status');
  };

  const handleLogout = () => {
    authService.logout();
    onUserChange(null);
    setMode('login');
  };

  const copyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[430px] landscape:max-w-lg h-auto max-h-[90vh] bg-[#0d0f1e] rounded-3xl flex flex-col justify-between overflow-y-auto shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
        
        {/* Navigation Header */}
        <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#9a7ffc]" />
            <h1 className="text-base font-bold text-white tracking-tight">Autenticação JWT</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 text-gray-300 hover:text-white transition"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4.5 no-scrollbar">
          {mode === 'status' && (
            <>
              {/* Authenticated Banner */}
              <div className="bg-[#171a2d] border border-[#272a44] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#232042] border border-purple-500/20 flex items-center justify-center text-[#8e79fd]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-white">{currentUser?.name || 'Papai'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-gray-400 block">{currentUser?.email || 'jacsonsajr.study@gmail.com'}</span>
                    <span className="text-[11px] text-[#9a7ffc] font-medium mt-0.5 block">
                      Bebê: {currentUser?.babyName || 'John'} · Role: {currentUser?.role || 'admin_parent'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="p-2 text-gray-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* JWT Token Card */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-[#9a7ffc]" />
                    <span>Token JWT Ativo (Bearer)</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="text-xs text-[#9a7ffc] hover:underline flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="bg-[#121422] p-3 rounded-xl border border-gray-800 text-[11px] font-mono text-purple-200/90 break-all select-all max-h-24 overflow-y-auto">
                  {currentToken || 'Nenhum token ativo'}
                </div>
              </section>

              {/* Decoded Claims Preview */}
              {parsedToken && (
                <section className="space-y-2">
                  <span className="text-xs font-bold text-gray-300">Payload Decodificado (Claims):</span>
                  <div className="bg-[#121422] p-3 rounded-xl border border-gray-800 text-xs font-mono text-emerald-300/90">
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[11px]">
                      {JSON.stringify(parsedToken.payload, null, 2)}
                    </pre>
                  </div>
                </section>
              )}

              {/* FastAPI Protected Endpoints Info */}
              <div className="bg-[#171a2d]/80 border border-[#2b2e4c] rounded-2xl p-3.5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                <span className="font-bold text-white block">Proteção de Rotas com FastAPI:</span>
                <p className="text-[11px] text-gray-400">
                  Todas as requisições de atividades e agendamentos incluem automaticamente o header{' '}
                  <code className="bg-[#121422] px-1 py-0.5 rounded text-purple-300 font-mono text-[10px]">
                    Authorization: Bearer &lt;token&gt;
                  </code>
                  , garantindo isolamento total por usuário e bebê.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-3 rounded-xl bg-[#1b1e33] hover:bg-[#252a46] text-xs font-semibold text-gray-200 transition"
                >
                  Trocar de Conta
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="flex-1 py-3 rounded-xl bg-[#9a7ffc] hover:bg-[#886cf2] text-xs font-bold text-[#131127] transition"
                >
                  Novo Cadastro
                </button>
              </div>
            </>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-[#9a7ffc]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-[#9a7ffc]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] font-bold text-sm rounded-2xl transition shadow-md shadow-purple-900/30"
              >
                Entrar e Gerar JWT
              </button>

              <button
                type="button"
                onClick={() => setMode('status')}
                className="w-full py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Papai ou Mamãe"
                  className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-[#9a7ffc]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nome do Bebê</label>
                <input
                  type="text"
                  required
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Ex: John"
                  className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-[#9a7ffc]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-[#181a2b] border border-[#272a44] rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-[#9a7ffc]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#9a7ffc] hover:bg-[#886cf2] text-[#131127] font-bold text-sm rounded-2xl transition shadow-md shadow-purple-900/30"
              >
                Cadastrar e Obter JWT
              </button>

              <button
                type="button"
                onClick={() => setMode('status')}
                className="w-full py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <footer className="p-4 bg-[#0d0f1e] border-t border-white/5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#878ca5] hover:text-white transition"
          >
            Fechar janela
          </button>
        </footer>

      </div>
    </div>
  );
};
