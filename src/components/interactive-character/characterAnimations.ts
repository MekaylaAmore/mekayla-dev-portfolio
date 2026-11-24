export const animationNames = [
  'idle', 'look-left', 'look-right', 'greeting', 'point-down', 'return-to-work',
] as const;

export type CharacterAnimationName = typeof animationNames[number];

export interface CharacterAnimation {
  name: CharacterAnimationName;
  frames: string[];
  frameCount: number;
  fps: number;
  loop: boolean;
  duration: number;
  sourceStart?: number;
  sourceEnd?: number;
  entryFrames?: Partial<Record<CharacterAnimationName, number>>;
}

export interface CharacterManifest {
  width: number;
  height: number;
  poster: string;
  animations: Record<CharacterAnimationName, CharacterAnimation>;
}

export const characterAssetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const characterPoster = characterAssetUrl('animations/character/idle/frame_0001.webp');

export async function loadCharacterManifest(signal: AbortSignal): Promise<CharacterManifest> {
  const response = await fetch(characterAssetUrl('animations/character/manifest.json'), { signal });
  if (!response.ok) throw new Error(`Character manifest: HTTP ${response.status}`);
  const manifest: CharacterManifest = await response.json();

  if (!(manifest.width > 0 && manifest.height > 0) || typeof manifest.poster !== 'string') {
    throw new Error('Invalid character dimensions or poster');
  }
  for (const name of animationNames) {
    const animation = manifest.animations?.[name];
    if (!animation || animation.name !== name || !Array.isArray(animation.frames) ||
      animation.frames.length === 0 || animation.frames.length !== animation.frameCount ||
      !animation.frames.every(path => typeof path === 'string' && path.endsWith('.webp')) ||
      !(animation.fps > 0 && animation.fps <= 60) || typeof animation.loop !== 'boolean' ||
      !Number.isFinite(animation.duration) ||
      Math.abs(animation.duration - animation.frameCount / animation.fps) > 0.001) {
      throw new Error(`Invalid character animation: ${name}`);
    }
    if (animation.sourceStart !== undefined && (!Number.isFinite(animation.sourceStart) || animation.sourceStart < 0)) {
      throw new Error(`Invalid character source interval: ${name}`);
    }
    for (const [from, index] of Object.entries(animation.entryFrames ?? {})) {
      if (!animationNames.includes(from as CharacterAnimationName) ||
        !Number.isInteger(index) || index < 0 || index >= animation.frameCount) {
        throw new Error(`Invalid character entry frame: ${name}/${from}`);
      }
    }
  }
  return manifest;
}
