import { memo, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useCharacterInteraction, useCharacterMediaQuery, type CharacterInteractionOptions } from '../../hooks/useCharacterInteraction';
import { CharacterFramePlayer } from './CharacterFramePlayer';
import { CharacterDebugOverlay } from './CharacterDebugOverlay';
import { characterAssetUrl, characterPoster, loadCharacterManifest, type CharacterManifest } from './characterAnimations';

interface InteractiveCharacterProps {
  heroRef: RefObject<HTMLElement>;
  interactionOptions?: Partial<CharacterInteractionOptions>;
  crossfadeMs?: number;
}

export const InteractiveCharacter = memo(function InteractiveCharacter({ heroRef, interactionOptions, crossfadeMs }: InteractiveCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<CharacterManifest | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const reducedMotion = useCharacterMediaQuery('(prefers-reduced-motion: reduce)');
  const mobileViewport = useCharacterMediaQuery('(max-width: 767px)');
  const active = inView && visible;
  const { animation, onComplete, hasMouse, pointerRef } = useCharacterInteraction(
    heroRef, !mobileViewport && !reducedMotion && !failed, active, ready, interactionOptions,
  );
  const onError = useCallback(() => setFailed(true), []);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const controller = new AbortController();
    void loadCharacterManifest(controller.signal).then(setManifest).catch(error => {
      if (error.name !== 'AbortError') setFailed(true);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    observer.observe(container);
    const onVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="interactive-character"
      aria-hidden="true"
      data-character-state={animation}
      data-character-mode={reducedMotion ? 'static' : failed ? 'fallback' : !mobileViewport && hasMouse ? 'interactive' : 'idle'}
      style={{ aspectRatio: manifest ? `${manifest.width} / ${manifest.height}` : '736 / 312' }}
    >
      <img
        className="character-poster"
        src={manifest ? characterAssetUrl(manifest.poster) : characterPoster}
        width={manifest?.width ?? 736}
        height={manifest?.height ?? 312}
        alt=""
        decoding="async"
        draggable={false}
        onError={event => { event.currentTarget.style.visibility = 'hidden'; }}
      />
      {manifest && !failed && (
        <CharacterFramePlayer
          animation={manifest.animations[animation]}
          width={manifest.width}
          height={manifest.height}
          paused={!active}
          staticFrame={reducedMotion}
          onComplete={onComplete}
          onReady={onReady}
          onError={onError}
          crossfadeMs={crossfadeMs}
          loopStartHoldMs={animation === 'idle' ? mobileViewport ? 2200 : 1400 : 0}
        />
      )}
      {import.meta.env.DEV && new URLSearchParams(window.location.search).has('characterDebug') && (
        <CharacterDebugOverlay characterRef={containerRef} pointerRef={pointerRef} ready={ready} active={active} />
      )}
    </div>
  );
});
