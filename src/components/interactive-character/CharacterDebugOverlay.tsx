import { useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { CharacterPointerSnapshot } from '../../hooks/useCharacterInteraction';

interface CharacterDebugOverlayProps {
  characterRef: RefObject<HTMLDivElement>;
  pointerRef: RefObject<CharacterPointerSnapshot>;
  ready: boolean;
  active: boolean;
}

/** Mounted only with Vite DEV and ?characterDebug. Never intercepts input. */
export function CharacterDebugOverlay({ characterRef, pointerRef, ready, active }: CharacterDebugOverlayProps) {
  const textRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    let request = 0;
    let previousTime = -Infinity;
    const update = (now: number) => {
      if (now - previousTime >= 100 && textRef.current) {
        previousTime = now;
        const pointer = pointerRef.current;
        const character = characterRef.current;
        const canvas = character?.querySelector('canvas');
        const drawnCanvas = canvas?.style.opacity === '1' ? canvas : null;
        textRef.current.textContent = [
          'Character pointer debug',
          `Mouse X: ${pointer?.mouseX?.toFixed(0) ?? 'no mouse event'}`,
          `Normalized X: ${pointer?.normalizedX?.toFixed(3) ?? 'outside'}`,
          `Zone: ${pointer?.zone ?? 'outside'}`,
          `Input: ${pointer?.pointerType ?? 'none'} (${pointer?.events ?? 0} events)`,
          `Requested: ${character?.dataset.characterState ?? 'idle'}`,
          `Playing: ${drawnCanvas?.dataset.animation ?? 'poster'}`,
          `Frame: ${drawnCanvas?.dataset.frame === undefined ? 'poster' : Number(drawnCanvas.dataset.frame) + 1}`,
          `Playback: ${canvas?.dataset.playback ?? character?.dataset.characterMode}`,
          `Transition: ${canvas?.dataset.transition ?? 'none'} (${canvas?.dataset.crossfadeMs ?? 160} ms)`,
          `Ready: ${ready}; active: ${active}`,
          'Assets: visitor-facing glance / right turn.',
          'No distinct far-left pose or continuous eye tracking.',
        ].join('\n');
      }
      request = requestAnimationFrame(update);
    };
    request = requestAnimationFrame(update);
    return () => cancelAnimationFrame(request);
  }, [characterRef, pointerRef, ready, active]);

  return createPortal(
    <pre
      ref={textRef}
      data-character-debug="true"
      aria-hidden="true"
      style={{
        position: 'fixed', right: 12, bottom: 12, zIndex: 10000, margin: 0,
        padding: 12, maxWidth: 'calc(100vw - 24px)', borderRadius: 8,
        background: 'rgba(10, 10, 10, 0.95)', border: '1px solid #ff1493',
        color: '#ffb9df', font: '12px/1.6 monospace', textAlign: 'left',
        whiteSpace: 'pre-wrap', pointerEvents: 'none',
      }}
    />,
    document.body,
  );
}
