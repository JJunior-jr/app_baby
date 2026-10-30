import React, { useState } from 'react';
import { X, Terminal, Server, Box, Copy, Check, ExternalLink } from 'lucide-react';

interface DockerVpsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerVpsGuideModal: React.FC<DockerVpsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'docker' | 'fastapi' | 'routes'>('docker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  # 1. Backend Python FastAPI com Autenticação JWT
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: baby_john_fastapi
    restart: always
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=sua_chave_secreta_super_segura_jwt_2026
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=10080
      - DATABASE_URL=sqlite:///./baby_john.db
    volumes:
      - ./backend/data:/app/data

  # 2. Frontend React / Vite Mobile App
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: baby_john_frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
`;

  const fastapiMainCode = `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from routers import activities, auth

app = FastAPI(
    title="Baby John - Diário do Bebê API",
    description="Backend FastAPI com autenticação JWT e agendamentos diários",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(activities.router, prefix="/api/activities", tags=["Atividades & Agendamentos"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "baby-john-fastapi"}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-[440px] landscape:max-w-xl max-h-[92vh] rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-200 transition-colors"
        style={{
          backgroundColor: 'var(--color-dominant)',
          borderColor: 'var(--color-border)',
        }}
      >
        
        {/* Navigation Header */}
        <header
          className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
              }}
            >
              <Box className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                Docker VPS & FastAPI
              </h1>
              <p className="text-[10px] text-gray-400">Guia de deploy e estrutura backend do projeto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </header>

        {/* Tab Switcher */}
        <div
          className="flex px-5 pt-3 border-b border-white/5 space-x-2 text-xs font-semibold shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`pb-2.5 px-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'docker'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Docker & VPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fastapi')}
            className={`pb-2.5 px-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'fastapi'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Python FastAPI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routes')}
            className={`pb-2.5 px-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'routes'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Rotas da API
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {activeTab === 'docker' && (
            <div className="space-y-4 text-xs">
              <section
                className="p-3.5 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Como rodar na sua VPS (Ubuntu / Debian):</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-[11.5px] leading-relaxed">
                  <li>Instale o Docker e Docker Compose na VPS:</li>
                  <div className="bg-[#090a10] p-2.5 rounded-xl font-mono text-[10.5px] text-emerald-300 select-all my-1.5 flex justify-between items-center border border-white/5">
                    <code>sudo apt update &amp;&amp; sudo apt install docker-compose-plugin -y</code>
                    <button
                      type="button"
                      onClick={() => handleCopy('sudo apt update && sudo apt install docker-compose-plugin -y', 'apt')}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      {copiedKey === 'apt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <li>Copie os arquivos do projeto e inicie em background:</li>
                  <div className="bg-[#090a10] p-2.5 rounded-xl font-mono text-[10.5px] text-emerald-300 select-all my-1.5 flex justify-between items-center border border-white/5">
                    <code>docker compose up -d --build</code>
                    <button
                      type="button"
                      onClick={() => handleCopy('docker compose up -d --build', 'up')}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      {copiedKey === 'up' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </ol>
              </section>

              {/* docker-compose preview */}
              <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-300 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>docker-compose.yml</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(dockerComposeCode, 'compose')}
                    className="text-emerald-400 text-[11px] flex items-center space-x-1 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'compose' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'compose' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="bg-[#090a10] p-3 rounded-xl border border-white/10 text-[10.5px] font-mono text-gray-300 max-h-56 overflow-y-auto">
                  <pre>{dockerComposeCode}</pre>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'fastapi' && (
            <div className="space-y-3.5 text-xs">
              <section
                className="p-3.5 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="font-bold text-white block">Arquivos Python inclusos no projeto:</span>
                <p className="text-gray-300 text-[11.5px] leading-relaxed">
                  Criamos a pasta <code className="bg-[#090a10] px-1.5 py-0.5 rounded text-purple-300 font-mono">/backend</code> com:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                  <li><code>main.py</code>: Entrypoint FastAPI com CORS e routers</li>
                  <li><code>auth.py</code>: Geração e validação de JWT (OAuth2PasswordBearer)</li>
                  <li><code>routers/activities.py</code>: Endpoints de atividades e agendamento</li>
                  <li><code>schemas.py</code>: Modelos Pydantic para validação de dados</li>
                  <li><code>Dockerfile</code>: Imagem oficial Python 3.11-slim</li>
                  <li><code>requirements.txt</code>: fastapi, uvicorn, python-jose, passlib, pydantic</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-300">backend/main.py</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(fastapiMainCode, 'fastapi')}
                    className="text-emerald-400 text-[11px] flex items-center space-x-1 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'fastapi' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="bg-[#090a10] p-3 rounded-xl border border-white/10 text-[10.5px] font-mono text-emerald-200 max-h-48 overflow-y-auto">
                  <pre>{fastapiMainCode}</pre>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-white block">Rotas Principais com Proteção JWT:</span>
              
              <section className="space-y-2 text-[11px]">
                {/* Route 1 */}
                <div
                  className="p-3 rounded-xl border space-y-1"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <code className="text-white font-mono">/api/auth/token</code>
                  </div>
                  <p className="text-gray-400">Autentica e retorna o JWT Bearer token para o app.</p>
                </div>

                {/* Route 2 */}
                <div
                  className="p-3 rounded-xl border space-y-1"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <code className="text-white font-mono">/api/activities?date=2026-08-19</code>
                  </div>
                  <p className="text-gray-400">Lista atividades do bebê por data e filtro (protegido com JWT).</p>
                </div>

                {/* Route 3 */}
                <div
                  className="p-3 rounded-xl border space-y-1"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <code className="text-white font-mono">/api/activities</code>
                  </div>
                  <p className="text-gray-400">Registra sono, amamentação, fralda ou atividade personalizada.</p>
                </div>

                {/* Route 4 */}
                <div
                  className="p-3 rounded-xl border space-y-1"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px]">
                      DELETE
                    </span>
                    <code className="text-white font-mono">/api/activities/&#123;id&#125;</code>
                  </div>
                  <p className="text-gray-400">Exclui um registro do diário diário.</p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className="p-4 pt-3 pb-5 border-t border-white/5 shrink-0"
          style={{ backgroundColor: 'var(--color-dominant)' }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
            }}
            className="w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center transition cursor-pointer active:scale-[0.99]"
          >
            Entendido & Concluído
          </button>
        </footer>

      </div>
    </div>
  );
};
