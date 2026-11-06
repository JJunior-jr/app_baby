# Opções de Menu de Navegação Glassy (Glassy Navigation Tabs V5)

Este documento descreve as 4 variações de barras de navegação flutuantes com estética Glassmorphism (vidro translúcido), seus elementos, animações e componentes React/Tailwind.

---

## 1. Opção 1: Curved Liquid Wave with Search (Barra Superior)

### Descrição
Uma barra flutuante de navegação expansiva com pesquisa no topo e indicador de fita líquida curva (*curved wave ribbon*) em tom ciano/turquesa que desliza e conecta a barra ao botão ativo.

### Elementos
- **Barra de Busca Superior**: Campo pílula `🔍 Search...`
- **Ícones**:
  - `Home` (Casa)
  - `Search` (Lupa)
  - `+ Create` (Ação central com círculo brilhante)
  - `Inbox` (Caixa de mensagem com ponto indicador vermelho `🔴`)
  - `Saved` (Marcador de salvos)

### Animação & Transição
- **Curved Gooey Wave**: Curva senoidal fluida de SVG com interpolação de caminho (`path morphing`) e física de mola que contorna o item ativo.
- **Aura Luminosa**: Brilho azul/turquesa reativo.

### Componentes & Bibliotecas
- React + Tailwind CSS (`backdrop-blur-md`, `bg-white/10`, `border-white/15`)
- Framer Motion / Motion (`motion.path`, `layoutId`)
- Lucide React Icons (`Home`, `Search`, `Plus`, `Inbox`, `Bookmark`)

---

## 2. Opção 2: Liquid Gooey Droplet Drop (Segunda Barra)

### Descrição
Uma cápsula minimalista contendo apenas ícones, onde o fundo ativo é uma gotícula de líquido (*gooey droplet*) que estica, deforma e contrai organicamente ao alternar entre os itens.

### Elementos
- **5 Ícones Flutuantes**:
  - `Home` (Casa)
  - `Likes` (Coração)
  - `+ Add` (Ação central em anel luminoso)
  - `Profile` (Usuário)
  - `Alerts` (Sino)

### Animação & Transição
- **Gotícula Elástica**: Animação com física de mola (`type: "spring", stiffness: 400, damping: 28`) e filtro de fusão líquida (`gooey filter`).
- Scale feedback ao ser pressionado (`active:scale-90`).

### Componentes & Bibliotecas
- React + Motion (`motion.div` com `layoutId="active-liquid-blob"`)
- Lucide React Icons
- Filtro SVG Gooey (`feGaussianBlur` + `feColorMatrix`)

---

## 3. Opção 3: Inverted Liquid Wave Cutout Dock (Terceira Barra — **Aplicada no App**)

### Descrição
Um dock de vidro escuro translúcido com um recorte curvo invertido (*inverted liquid wave cavity*). A onda de luz do topo arqueia-se suavemente ao redor do item selecionado, acompanhada por um brilho focal radial turquesa/púrpura.

### Elementos Mantidos do App
- **5 Abas Principais**:
  1. `Início` (`LayoutGrid`)
  2. `Diário` (`BookOpen`)
  3. `Rotinas` (`Clock`)
  4. `Insights` (`TrendingUp`)
  5. `Saúde` (`ShieldCheck`)

### Animação & Transição
- **Onda de Recorte Fluida**: Deslocamento da curva de cavidade através do indicador de posição com animação suave de mola (`layoutId="inverted-wave"`).
- **Glow Atmosférico**: Iluminação por trás do ícone selecionado com escala leve (`scale-110`) e cor de destaque da paleta ativa do app (`var(--color-accent)`).

### Componentes & Bibliotecas
- React + Motion (`motion.div`, `AnimatePresence`)
- Lucide React (`LayoutGrid`, `BookOpen`, `Clock`, `TrendingUp`, `ShieldCheck`)
- Tailwind CSS Glassmorphism (`backdrop-blur-xl`, `bg-[#1e293b]/80`, `border-[#334155]/60`)

---

## 4. Opção 4: Warm Gold Floating Pill Labeled (Barra Inferior)

### Descrição
Barra inferior estilizada em vidro temperado com reflexo champagne/dourado e pílula flutuante arredondada de fundo com borda superior reflexiva.

### Elementos
- **5 Abas Lançadas com Rotulagem**:
  - `Home`, `Likes`, `+ Add`, `Profile`, `Alerts`

### Animação & Transição
- **Pílula Deslizante Elevada**: Deslocamento horizontal da cápsula de seleção com borda superior iluminada e gradiente quente.

### Componentes & Bibliotecas
- React + Motion
- Tailwind CSS (`bg-amber-500/10`, `border-amber-300/30`, `text-amber-300`)
