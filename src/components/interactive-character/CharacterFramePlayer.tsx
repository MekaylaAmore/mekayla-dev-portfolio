import { memo, useEffect, useRef } from 'react';
import { AnimationFrameCache } from '../../utils/preloadAnimationFrames';
import { characterAssetUrl, type CharacterAnimation, type CharacterAnimationName } from './characterAnimations';

interface CharacterFramePlayerProps {
  animation: CharacterAnimation;
  width: number;
  height: number;
  paused: boolean;
  staticFrame: boolean;
  onComplete: (name: CharacterAnimationName) => void;
  onReady: () => void;
  onError: () => void;
  crossfadeMs?: number;
  loopStartHoldMs?: number;
}

/** Draws decoded frames imperatively: React renders only when the state changes. */
export const CharacterFramePlayer = memo(function CharacterFramePlayer({
  animation, width, height, paused, staticFrame, onComplete, onReady, onError, crossfadeMs = 160, loopStartHoldMs = 0,
}: CharacterFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<AnimationFrameCache | null>(null);
  const progressRef = useRef({ name: '', index: 0, elapsed: 0, completed: false });
  const drawnRef = useRef({ name: '', index: -1, sourceTime: null as number | null, completed: false });
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);
  const fadeRef = useRef({ active: false, elapsed: 0 });
  const readyRef = useRef(false);

  useEffect(() => {
    cacheRef.current = new AnimationFrameCache();
    return () => {
      cacheRef.current?.dispose();
      cacheRef.current = null;
      snapshotRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    const cache = cacheRef.current;
    if (!canvas || !cache) return;
    if (!context) {
      onError();
      return;
    }
    if (staticFrame) {
      canvas.style.opacity = '0';
      canvas.dataset.playback = 'static';
      return;
    }
    if (paused) {
      canvas.dataset.playback = 'paused';
      return;
    }

    if (progressRef.current.name !== animation.name) {
      const drawn = drawnRef.current;
      const resumeVisiblePose = drawn.name === animation.name;
      const entry = animation.entryFrames?.[drawn.name as CharacterAnimationName] ?? 0;
      progressRef.current = {
        name: animation.name,
        index: resumeVisiblePose ? drawn.index : entry,
        elapsed: 0,
        completed: resumeVisiblePose && drawn.completed,
      };
    }
    const progress = progressRef.current;
    const frames = animation.frames.map(characterAssetUrl);
    let stopped = false;
    let request = 0;
    let lastTime: number | null = null;
    let preloadedIndex = -1;
    const frameTime = 1000 / animation.fps;
    const loopHold = Number.isFinite(loopStartHoldMs) ? Math.max(0, Math.min(5000, loopStartHoldMs)) : 0;
    const fadeTime = Number.isFinite(crossfadeMs) ? Math.max(120, Math.min(200, crossfadeMs)) : 160;
    canvas.dataset.requestedAnimation = animation.name;
    canvas.dataset.entryFrame = String(progress.index);
    canvas.dataset.crossfadeMs = String(fadeTime);
    canvas.dataset.loopHoldMs = String(loopHold);
    canvas.dataset.playback = 'loading';

    const preload = (index: number) => {
      if (preloadedIndex === index) return;
      preloadedIndex = index;
      // Idle loads first. Other sequences are requested only when played,
      // in six-frame windows instead of decoding the whole clip at once.
      const upcoming = frames.slice(index, index + 6);
      if (animation.loop && upcoming.length < 6) upcoming.push(...frames.slice(0, 6 - upcoming.length));
      void cache.preload(upcoming).catch(error => {
        if (!stopped && error.name !== 'AbortError') {
          stopped = true;
          cancelAnimationFrame(request);
          canvas.dataset.playback = 'error';
          onError();
        }
      });
    };

    const tick = (now: number) => {
      if (stopped) return;
      preload(progress.index);
      const image = cache.get(frames[progress.index]);
      if (image) {
        const drawn = drawnRef.current;
        const changed = drawn.name !== animation.name || drawn.index !== progress.index;
        const sourceTime = animation.sourceStart === undefined ? null : animation.sourceStart + progress.index / animation.fps;
        const adjacent = sourceTime !== null && drawn.sourceTime !== null && !fadeRef.current.active &&
          Math.abs(sourceTime - drawn.sourceTime - 1 / animation.fps) < 0.001;
        let startedFade = false;
        if (changed && (drawn.name !== animation.name || (progress.index === 0 && drawn.index > 0)) && drawn.index >= 0) {
          if (adjacent) {
            // Adjacent samples already contain the real turn/hand movement.
            // Blending these would ghost the face and hide those source frames.
            fadeRef.current.active = false;
            canvas.dataset.transition = 'continuous';
          } else {
            const snapshot = snapshotRef.current ?? document.createElement('canvas');
            snapshot.width = width;
            snapshot.height = height;
            snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
            snapshotRef.current = snapshot;
            fadeRef.current = { active: true, elapsed: 0 };
            startedFade = true;
          }
        }
        const blending = fadeRef.current.active;
        const delta = lastTime === null ? 0 : Math.min(now - lastTime, 100);
        if (blending && !startedFade) fadeRef.current.elapsed += delta;
        if (changed || blending || canvas.style.opacity !== '1') {
          context.globalAlpha = 1;
          context.drawImage(image, 0, 0, width, height);
          if (blending && snapshotRef.current) {
            const fraction = Math.min(1, fadeRef.current.elapsed / fadeTime);
            // Smoothstep eases both ends, including when reversing mid-fade.
            const eased = fraction * fraction * (3 - 2 * fraction);
            if (fraction < 1) {
              context.globalAlpha = 1 - eased;
              context.drawImage(snapshotRef.current, 0, 0);
              context.globalAlpha = 1;
              canvas.dataset.transition = 'crossfade';
            } else {
              fadeRef.current.active = false;
              canvas.dataset.transition = 'none';
            }
          }
          drawnRef.current = { name: animation.name, index: progress.index, sourceTime, completed: progress.completed };
          canvas.style.opacity = '1';
          // Report the actual drawn sequence, not just the requested sequence.
          canvas.dataset.animation = animation.name;
          canvas.dataset.frame = String(progress.index);
          if (!readyRef.current && animation.name === 'idle') {
            readyRef.current = true;
            onReady();
          }
        }
        canvas.dataset.playback = progress.completed ? 'held' : 'playing';
        if (!progress.completed && !blending) {
          // Hold the destination sample during the blend, then play every
          // remaining source frame instead of skipping the start of the turn.
          progress.elapsed += delta;
          // Rest on the neutral working frame between idle loops. The canvas
          // stays visible without redrawing or rerendering during this dwell.
          const duration = frameTime + (animation.loop && progress.index === 0 ? loopHold : 0);
          if (progress.elapsed >= duration) {
            progress.elapsed -= duration;
            if (progress.index < frames.length - 1) progress.index += 1;
            else if (animation.loop) progress.index = 0;
            else {
              progress.completed = true;
              drawnRef.current.completed = true;
              canvas.dataset.playback = 'held';
              onComplete(animation.name);
            }
          }
        }
      }
      lastTime = now;
      if (!progress.completed || fadeRef.current.active) request = requestAnimationFrame(tick);
    };

    preload(progress.index);
    request = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(request);
    };
  }, [animation, width, height, paused, staticFrame, onComplete, onReady, onError, crossfadeMs, loopStartHoldMs]);

  return <canvas ref={canvasRef} className="character-canvas" width={width} height={height} aria-hidden="true" />;
});
