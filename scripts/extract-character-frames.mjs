import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] ?? join(root, 'character-animation.mp4'));
const output = join(root, 'public/animations/character');
const fps = 12;
const width = 736;
// Boundaries selected after visual inspection; update these for a different clip.
const timeline = [
  ['idle', 6, true, 'Typing with headphones on.'],
  ['look-left', 7, false, 'Visitor-facing/slightly screen-left glance; no independent far-left turn exists.'],
  ['look-right', 12, false, 'Turns toward screen-right and the laptop.'],
  ['greeting', 22, false, 'Notices the visitor, removes headphones, briefly raises a hand; no separate wave cycle.'],
  ['point-down', 9, false, 'Points down and starts lowering her hand.'],
  ['return-to-work', 6, false, 'Resumes typing with headphones around her neck; crossfade to original idle.'],
];

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result.stdout;
}

const probe = JSON.parse(run('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
  'stream=width,height,r_frame_rate,nb_read_frames:format=duration,size', '-of', 'json', source,
]));
const stream = probe.streams[0];
const temp = mkdtempSync(join(tmpdir(), 'mekayla-frames-'));

try {
  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', source,
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', '76', '-compression_level', '6',
    join(temp, 'frame_%04d.webp'),
  ]);
  const extracted = readdirSync(temp).sort();
  const expected = timeline.reduce((total, [, count]) => total + count, 0);
  if (extracted.length !== expected) {
    throw new Error(`Expected ${expected} sampled frames, found ${extracted.length}. Inspect the new source and update the timeline first.`);
  }

  const animations = {};
  let cursor = 0;
  let totalBytes = 0;
  for (const [name, frameCount, loop, description] of timeline) {
    const directory = join(output, name);
    rmSync(directory, { force: true, recursive: true });
    mkdirSync(directory, { recursive: true });
    const frames = [];
    const sourceStart = cursor / fps;
    for (let index = 0; index < frameCount; index += 1) {
      const filename = `frame_${String(index + 1).padStart(4, '0')}.webp`;
      const target = join(directory, filename);
      copyFileSync(join(temp, extracted[cursor++]), target);
      totalBytes += statSync(target).size;
      frames.push(`animations/character/${name}/${filename}`);
    }
    animations[name] = {
      name, frames, frameCount, fps, loop, duration: frameCount / fps,
      // The supplied clip's frame 6 already faces the laptop; skip the
      // visitor-facing opening when entering this turn from working idle.
      ...(name === 'look-right' ? { entryFrames: { idle: 5 } } : {}),
      sourceStart, sourceEnd: cursor / fps, description,
    };
  }

  const manifest = {
    version: 1,
    source: {
      filename: 'character-animation.mp4',
      duration: Number(probe.format.duration),
      width: stream.width, height: stream.height,
      fps: stream.r_frame_rate, frameCount: Number(stream.nb_read_frames),
    },
    width, height: Math.round(width * stream.height / stream.width),
    poster: animations.idle.frames[0],
    totalFrames: cursor, totalBytes, animations,
  };
  writeFileSync(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Extracted ${cursor} WebP frames at ${fps} FPS, ${manifest.width} × ${manifest.height}; ${(totalBytes / 1024).toFixed(1)} KiB.`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
