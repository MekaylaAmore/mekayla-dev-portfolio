import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { CharacterAnimationName } from '../components/interactive-character/characterAnimations';

export type CharacterZone = 'left' | 'centre' | 'right' | null;

export interface CharacterInteractionOptions {
  leftBoundary: number;
  rightBoundary: number;
  hysteresis: number;
  greetingDelayMs: number;
  greetingCooldownMs: number;
}

export interface CharacterPointerSnapshot {
  mouseX: number | null;
  normalizedX: number | null;
  zone: CharacterZone;
  pointerType: string | null;
  events: number;
}

const isGreeting = (name: CharacterAnimationName) =>
  name === 'greeting' || name === 'point-down' || name === 'return-to-work';

export function useCharacterMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function useCharacterInteraction(
  heroRef: RefObject<HTMLElement>, enabled: boolean, active: boolean, ready: boolean,
  options: Partial<CharacterInteractionOptions> = {},
) {
  const [animation, setAnimation] = useState<CharacterAnimationName>('idle');
  const [hasMouse, setHasMouse] = useState(false);
  const animationRef = useRef<CharacterAnimationName>('idle');
  const pointerRef = useRef<CharacterPointerSnapshot>({
    mouseX: null, normalizedX: null, zone: null, pointerType: null, events: 0,
  });
  const lastGreeting = useRef(-Infinity);
  const greetingTimer = useRef<number>();
  const pendingZone = useRef(false);
  const leftBoundary = options.leftBoundary ?? 0.35;
  const rightBoundary = options.rightBoundary ?? 0.65;
  const hysteresis = options.hysteresis ?? 0.01;
  const greetingDelayMs = options.greetingDelayMs ?? 180;
  const greetingCooldownMs = options.greetingCooldownMs ?? 6000;

  const clearGreeting = useCallback(() => {
    window.clearTimeout(greetingTimer.current);
    greetingTimer.current = undefined;
  }, []);

  const transition = useCallback((next: CharacterAnimationName) => {
    if (animationRef.current === next) return;
    animationRef.current = next;
    setAnimation(next);
  }, []);

  const onComplete = useCallback((completed: CharacterAnimationName) => {
    // Ignore completion callbacks from a sequence interrupted by a new look.
    if (animationRef.current !== completed) return;
    if (completed === 'greeting') transition('point-down');
    else if (completed === 'point-down') transition('return-to-work');
    else if (completed === 'return-to-work') {
      const zone = pointerRef.current.zone;
      transition(zone === 'left' ? 'look-left' : zone === 'right' ? 'look-right' : 'idle');
    }
    // Look sequences hold their final frame until the pointer leaves the zone.
  }, [transition]);

  useEffect(() => {
    if (!enabled) {
      clearGreeting();
      pointerRef.current.zone = null;
      pendingZone.current = false;
      transition('idle');
      return;
    }
    const hero = heroRef.current;
    if (!hero || !active) return;
    const applyZone = () => {
      clearGreeting();
      if (!ready) return;
      pendingZone.current = false;
      const zone = pointerRef.current.zone;
      if (zone === 'centre') {
        if (isGreeting(animationRef.current)) return;
        transition('idle');
        if (performance.now() - lastGreeting.current < greetingCooldownMs) return;
        // Only the centre has a dwell: crossing it on the way to a side should
        // not start a greeting. Direction changes themselves have no timer.
        pendingZone.current = true;
        greetingTimer.current = window.setTimeout(() => {
          greetingTimer.current = undefined;
          pendingZone.current = false;
          if (pointerRef.current.zone !== 'centre') return;
          lastGreeting.current = performance.now();
          transition('greeting');
        }, greetingDelayMs);
      } else transition(zone === 'left' ? 'look-left' : zone === 'right' ? 'look-right' : 'idle');
    };
    const onMove = (event: PointerEvent) => {
      const pointer = pointerRef.current;
      pointer.events += 1;
      if (event.pointerType !== 'mouse') {
        if (pointer.pointerType !== event.pointerType) setHasMouse(false);
        pointer.pointerType = event.pointerType;
        pointer.mouseX = null;
        pointer.normalizedX = null;
        pointer.zone = null;
        pendingZone.current = false;
        clearGreeting();
        transition('idle');
        return;
      }
      // Trust real mouse events, including mice attached to touch-primary
      // devices. Primary-pointer media queries cannot detect every input device.
      if (pointer.pointerType !== 'mouse') setHasMouse(true);
      pointer.pointerType = 'mouse';
      pointer.mouseX = event.clientX;
      const bounds = hero.getBoundingClientRect();
      if (bounds.width === 0) return;
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      pointer.normalizedX = x;
      let zone: CharacterZone;
      if (pointer.zone === 'left' && x < leftBoundary + hysteresis) zone = 'left';
      else if (pointer.zone === 'right' && x > rightBoundary - hysteresis) zone = 'right';
      else if (pointer.zone === 'centre' && x > leftBoundary - hysteresis && x < rightBoundary + hysteresis) zone = 'centre';
      else zone = x < leftBoundary ? 'left' : x > rightBoundary ? 'right' : 'centre';
      if (zone !== pointer.zone) {
        pointer.zone = zone;
        pendingZone.current = true;
        applyZone();
      }
    };
    const onLeave = () => {
      clearGreeting();
      pointerRef.current.zone = null;
      pointerRef.current.normalizedX = null;
      pendingZone.current = false;
      transition('idle');
    };

    // Replay unhandled input after decoding/pausing, but never greet again just
    // because visibility changed while the pointer stayed in the same zone.
    if (pendingZone.current) applyZone();
    // Capture also sees events over decorative descendants and children that
    // stop bubbling. No event is cancelled, so links and scrolling keep working.
    hero.addEventListener('pointermove', onMove, { passive: true, capture: true });
    hero.addEventListener('pointerdown', onMove, { passive: true, capture: true });
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      clearGreeting();
      hero.removeEventListener('pointermove', onMove, true);
      hero.removeEventListener('pointerdown', onMove, true);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, [heroRef, enabled, active, ready, leftBoundary, rightBoundary, hysteresis,
    greetingDelayMs, greetingCooldownMs, clearGreeting, transition]);

  return { animation, onComplete, hasMouse, pointerRef };
}
