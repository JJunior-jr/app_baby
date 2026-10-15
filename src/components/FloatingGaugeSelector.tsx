import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripVertical, RotateCcw, Move } from 'lucide-react';

export type GaugeMode = 'sono' | 'amamentacao' | 'fralda';

interface FloatingGaugeSelectorProps {
  currentMode: GaugeMode;
  onSelectMode: (mode: GaugeMode) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const STORAGE_KEY = 'baby_gauge_floating_pos_v1';
const DEFAULT_POS = { x: 16, y: 12 };

export const FloatingGaugeSelector: React.FC<FloatingGaugeSelectorProps> = ({
  currentMode,
  onSelectMode,
  containerRef,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_POS;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    hasMoved: false,
  });

  // Clamp position to stay within container / screen boundaries
  const clampPosition = useCallback(
    (x: number, y: number) => {
      let maxX = window.innerWidth - 120;
      let maxY = window.innerHeight - 180;
      const minX = 8;
      const minY = 8;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const elemRect = elementRef.current?.getBoundingClientRect();
        const elemWidth = elemRect?.width || 100;
        const elemHeight = elemRect?.height || 140;

        maxX = Math.max(minX, rect.width - elemWidth - 8);
        maxY = Math.max(minY, rect.height - elemHeight - 8);
      }

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    },
    [containerRef]
  );

  // Validate on mount & resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Do not trigger drag if user clicked directly on the reset button
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-ignore="true"]')) {
      return;
    }

    setIsInteracting(true);

    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      hasMoved: false,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (e.buttons === 0 && e.pointerType === 'mouse') {
      if (isDragging) setIsDragging(false);
      return;
    }

    const deltaX = e.clientX - info.startX;
    const deltaY = e.clientY - info.startY;

    if (!info.hasMoved && Math.hypot(deltaX, deltaY) > 5) {
      info.hasMoved = true;
      setIsDragging(true);
      setIsInteracting(true);
    }

    if (info.hasMoved) {
      const newPos = clampPosition(info.initialPosX + deltaX, info.initialPosY + deltaY);
      setPosition(newPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (info.hasMoved) {
      // Persist new position
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch {
        // Ignore
      }
    }

    // Delay resetting isDragging and isInteracting so click events occurring immediately are blocked
    setTimeout(() => {
      setIsDragging(false);
      setIsInteracting(false);
      info.hasMoved = false;
    }, 150);
  };

  const handleModeClick = (mode: GaugeMode) => {
    if (dragInfoRef.current.hasMoved || isDragging) {
      return; // Ignora clique se estava arrastando
    }
    onSelectMode(mode);
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(DEFAULT_POS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const isMoved = Math.abs(position.x - DEFAULT_POS.x) > 10 || Math.abs(position.y - DEFAULT_POS.y) > 10;
  const showMoveLabel = isHovered || isInteracting || isDragging;

  return (
    <div
      ref={elementRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging) setIsInteracting(false);
      }}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsInteracting(false), 200);
      }}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`group absolute top-0 left-0 z-30 flex flex-col rounded-2xl p-1.5 backdrop-blur-[12px] bg-gradient-to-br from-white/20 via-white/10 to-white/5 border-t border-l border-white/40 border-b border-r border-white/15 shadow-[0_14px_36px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.45)] transition-all select-none overflow-hidden ${
        isDragging
          ? 'cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.6)] scale-[1.03] ring-2 ring-purple-400/50 opacity-95'
          : 'cursor-grab hover:shadow-[0_18px_45px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Specular Diagonal Reflection Sheen */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-t-2xl pointer-events-none" />
      <div className="glass-reflection-line" />
      {/* Floating Hover / Touch Tooltip "Mover" */}
      <div
        className={`absolute pointer-events-none transition-all duration-200 z-50 whitespace-nowrap ${
          position.y < 35
            ? 'left-full ml-2 top-0.5'
            : '-top-7 left-1/2 -translate-x-1/2'
        } ${
          showMoveLabel
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-900/95 text-white text-[10px] font-semibold shadow-xl border border-white/15">
          <Move className="w-2.5 h-2.5 text-purple-300 animate-pulse" />
          <span>Mover</span>
        </div>
      </div>

      {/* Drag Grip Handle Header */}
      <div className="flex items-center justify-between px-1.5 py-0.5 text-gray-400 text-[10px] font-semibold border-b border-white/[0.06] mb-1">
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-purple-300 transition-colors" />
          {/* Word 'Mover' smoothly appears on hover or touch */}
          <span
            className={`text-[9px] tracking-wider uppercase font-bold text-gray-300 transition-all duration-200 overflow-hidden ${
              showMoveLabel
                ? 'max-w-[50px] opacity-100'
                : 'max-w-0 opacity-0 pointer-events-none'
            }`}
          >
            Mover
          </span>
        </div>
        {isMoved && (
          <button
            type="button"
            data-drag-ignore="true"
            onClick={handleResetPosition}
            title="Redefinir posição para o canto esquerdo"
            className="p-0.5 hover:text-white text-gray-400 rounded transition hover:bg-white/10 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Vertical Option Buttons: Sono, Peito, Fralda */}
      <div className="flex flex-col space-y-1">
        {/* Sono */}
        <button
          type="button"
          onClick={() => handleModeClick('sono')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'sono'
              ? 'font-extrabold shadow-xs cursor-default'
              : 'font-bold text-gray-300 hover:text-white hover:bg-white/[0.06]'
          }`}
          style={
            currentMode === 'sono'
              ? {
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }
              : {}
          }
        >
          <span>🌙</span>
          <span>Sono</span>
        </button>

        {/* Peito */}
        <button
          type="button"
          onClick={() => handleModeClick('amamentacao')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'amamentacao'
              ? 'font-extrabold shadow-xs cursor-default'
              : 'font-bold text-gray-300 hover:text-pink-300 hover:bg-white/[0.06]'
          }`}
          style={
            currentMode === 'amamentacao'
              ? {
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }
              : {}
          }
        >
          <span>🤱</span>
          <span>Peito</span>
        </button>

        {/* Fralda */}
        <button
          type="button"
          onClick={() => handleModeClick('fralda')}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'fralda'
              ? 'font-extrabold shadow-xs cursor-default'
              : 'font-bold text-gray-300 hover:text-teal-300 hover:bg-white/[0.06]'
          }`}
          style={
            currentMode === 'fralda'
              ? {
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                }
              : {}
          }
        >
          <span>🧷</span>
          <span>Fralda</span>
        </button>
      </div>
    </div>
  );
};
