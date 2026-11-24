# Interactive portfolio character

## Final presentation polish

The character remains a three-zone, frame-based enhancement to the existing
portfolio. It uses the same 62 Hailuo WebP frames, manifest, reusable React
components, and 160 ms transition strategy. No assets were regenerated and no
animation libraries were added.

- Idle uses a short working loop, with a 1.4-second rest on its neutral first
  frame between loops. On mobile the rest is 2.2 seconds. No canvas redraw or
  React frame-state update is needed during that rest.
- Left plays the visitor-facing glance once and holds it. This is explicitly
  a forward-facing fallback, not a true far-left rotation.
- Right plays the existing right-facing sequence and holds its final pose.
- Centre plays greeting, headphone removal, pointing, and return-to-work once;
  remaining in the centre does not restart it. Side changes still take priority.
- Exit blends back to laptop idle. Reduced motion displays the static poster.
- Below 768px, cursor interactions are disabled even if a mouse is connected;
  mobile stays in idle and retains normal scrolling. Desktop/hybrid mouse input
  continues to work above that breakpoint.

The final visual review checked the following viewports. All have readable hero
text, the full character/laptop scene, no horizontal overflow, and unobstructed
hero buttons with one-line labels and touch targets above 44px high:

| Viewport | Character size | Review result |
| --- | --- | --- |
| 320 × 740 | 272 × 115px | Smaller heading fits the available width; both primary buttons are visible |
| 390 × 844 | 342 × 145px | Balanced idle-only mobile view with normal scrolling |
| 768 × 1024 | 576 × 244px | Navigation spacing corrected; Hire Me stays on one line |
| 1024 × 768 | 384 × 163px | Compact character and spacing keep both primary buttons above the fold |
| 1440 × 1000 | 576 × 244px | Existing desktop composition preserved |

Sizing changes are limited to the hero's content width, a 320px heading adjustment,
and a smaller character on short desktop screens. Navigation labels, links,
typography family, colours, and Framer Motion effects are preserved. The only
navigation changes are responsive spacing and preventing the logo/Hire Me from
shrinking or wrapping. All portfolio sections, copy, Supabase handlers, project
content, and contact functionality are unchanged.

Files modified for the final polish:

- `src/components/interactive-character/InteractiveCharacter.tsx`: mobile
  interaction gate and quieter idle timing.
- `src/components/interactive-character/CharacterFramePlayer.tsx`: configurable
  rest on the first frame of a looping sequence.
- `src/App.tsx`: responsive navigation spacing and a constrained hero wrapper.
- `src/index.css`: short-screen character sizing and small-phone heading fit.
- `scripts/test-character-browser.mjs`: idle cadence, five-size layout checks,
  mobile mouse suppression, and explicit pause checks.
- `docs/interactive-character.md`: final behavior and verification report.

`npm run build`, `npm run lint`, `npm run typecheck`, and all 16 browser regression
groups pass in development and production. The browser checks verify the actual
rendered pose, repeated/rapid interactions, centre greeting, lazy loading, mobile
scrolling, reduced motion, and document/offscreen pauses. Visibility events are
simulated in automation. Production excludes the debug overlay.

Performance remains bounded: six idle frames load first; other sequences load on
interaction in six-frame windows; the decoded-image cache retains at most 20
images. The animation payload remains 502,755 bytes (about 491 KiB). Playback
pauses offscreen or when the document is hidden, and timers, listeners, observers,
requests, and frame references retain their cleanup paths. No CPU or battery
benchmark is claimed.

Remaining limitations come from the source: there is no genuine far-left turn,
continuous cursor/eye tracking, or headphones-on reset. Brief blended silhouettes
can occur across unrelated poses. The existing stable transitions are retained
rather than fabricating missing movements. Live Supabase submissions were not
tested because this workspace has no configured database credentials.

## Source inspection and animation timeline

Inspected `character-animation.mp4` with FFprobe and a timestamped contact sheet
before extracting production assets. The supplied Hailuo clip is 5.166667 seconds,
2944 × 1248, 24 FPS, and 124 frames (2,847,552 bytes).

| Source interval (seconds) | Observed action | Sequence | Extracted frames |
| --- | --- | --- | --- |
| 0.000–0.500 | Working at the laptop, with headphones on | `idle` | 6 |
| 0.500–1.083 | Turns toward the visitor, slightly toward screen-left | `look-left` | 7 |
| 1.083–2.083 | Turns back toward screen-right/the laptop | `look-right` | 12 |
| 2.083–3.917 | Notices the visitor, smiles, removes headphones, briefly raises a hand | `greeting` | 22 |
| 3.917–4.667 | Points downward, then lowers her hand | `point-down` | 9 |
| 4.667–5.167 | Returns to typing, headphones still around her neck | `return-to-work` | 6 |

The left zone uses the available visitor-facing glance. The source does **not**
contain an independent far-left head turn, so this is an explicitly documented
fallback, not full left/right tracking. The brief hand raise is retained within
the greeting; no separate waving animation is advertised or synthesized.
Headphones are not put back on in the source. A short crossfade back to the
initial idle pose conceals the cut but does not invent that missing movement.
The idle loop also uses a short crossfade at its boundary.

## Implementation

The character sits above the existing centered hero text. The original dark/pink
palette, fonts, text, navigation, sections, buttons, orbiting rings, entrance
animations, and scroll animations remain. The existing scroll indicator is moved
below the social links and made non-interactive so it cannot overlap a button.

The hero's horizontal position is normalized using
`(event.clientX - rect.left) / rect.width`, clamped to 0–1. The default zones are
left 0–0.35, centre 0.35–0.65, and right 0.65–1, with 1% boundary hysteresis.
Side-zone changes are immediate and hold their final frame. Leaving restores
idle. Staying in the centre plays `greeting` → `point-down` → `return-to-work` →
`idle`. A side-zone request interrupts any temporary sequence immediately and
cannot be blocked by the greeting cooldown. Staying in one zone does not restart
playback. Only the centre has a 180 ms dwell to avoid greetings while crossing
between sides; greetings have a six-second cooldown. Crossfades default to 160 ms
and are used only where the source frames do not already join continuously.

These settings are configurable through the optional `interactionOptions` prop
on `InteractiveCharacter`: `leftBoundary`, `rightBoundary`, `hysteresis`,
`greetingDelayMs`, and `greetingCooldownMs`. The existing hero uses the defaults.
The separate `crossfadeMs` prop configures blends within 120–200 ms.
Pointer movement is observed on the hero in the capture phase, including over
decorative descendants and children that stop bubbling. Listeners are passive
and never prevent links, clicks, or scrolling.

The reusable canvas player advances with `requestAnimationFrame`; it does not
store frame numbers in React state. It keeps the previous drawing visible until
the next frame is decoded. A poster remains underneath the canvas during initial
loading. Invalid manifests, failed frames, decode failures, and frame requests
that exceed ten seconds fall back to the poster. Playback retries require a page
reload after a failure.

Only the six idle frames are requested initially. Interaction frames load when
their sequence starts, using a six-frame lookahead. An instance-owned LRU cache
retains at most 20 decoded images (about 17.5 MiB of raw RGBA pixels, excluding
in-flight decodes, the poster, and canvases). It releases references and aborts
pending work on unmount. Timers, observers, event listeners, and animation requests
have cleanup functions. Playback pauses offscreen and while the document is hidden.

## Directional transition refinement

The existing reusable player, zones, hysteresis, greeting priority, and portfolio
layout remain in place. The source WebP files were inspected again frame by frame:
`look-left` frames 4–7 turn toward the visitor, and `look-right` frames 1–6 turn
from the visitor toward screen-right, with frames 7–12 holding that direction.
There is still no true far-left pose.

The refinement addresses three visible discontinuities:

1. The right sequence opens facing the visitor, while laptop idle already faces
   toward the laptop. The manifest now specifies `entryFrames: { "idle": 5 }`
   for `look-right`: entering from idle starts at the existing sixth frame
   (zero-based index 5, about 1.50 seconds in the source), then continues through
   the remaining right-facing frames. Entering from the visitor-facing fallback
   still starts at frame 1 and uses the real forward-to-right turn.
2. Blending while advancing the destination clip obscured its first source
   frames. The player now captures the currently visible canvas, eases a short
   blend into a held destination sample, and advances the source frames only
   after the blend completes. Reversing during a blend captures that visible
   composite instead of jumping back to an unrelated starting pose. Fade
   progress survives a visibility pause.
3. Greeting, pointing, and return-to-work are consecutive parts of the same
   source clip. `sourceStart` and the last actually drawn sample identify
   consecutive frames, so these joins use their existing continuous movement
   without a crossfade. A completed visitor-facing glance also joins directly
   into the right turn when the corresponding samples are adjacent.

If an opposite-direction request has not drawn yet and the cursor returns to
the visible sequence, the player resumes that actual frame. An already held pose
stays held. It is not reset to the beginning just because an intervening request
started decoding. Mouse exit still requests idle immediately and blends back
to laptop work. Direction changes continue to interrupt greetings.

The extended rapid-switch test also exposed a cache hazard: late image decodes
from an interrupted sequence could evict the current first frame after it had
been preloaded. The cache now protects the active lookahead window against those
late decodes, while still retaining at most 20 images. A controlled race check
reproduced the missing active frame before the fix and retained it afterward,
with the same cache size. No animation libraries were added.

The debug overlay now reports the transition strategy (`crossfade`, `continuous`,
or `none`) and configured fade duration. The existing browser suite additionally
checks reversals before decoding completes, 55 ms alternating side requests,
no blank canvas during the rapid sequence, exact final-pose pixels after settling,
the held entry sample during blending, the idle-to-right entry frame, and the
continuous greeting-to-pointing join. Source contact sheets and recorded real
canvas frames were visually reviewed with `?characterDebug=1` enabled.

Build, lint, and TypeScript checks pass. All 13 extended browser regression
groups pass against both the development server and production build, with no
uncaught exceptions. The active-frame cache race check also passes while keeping
the 20-image limit. The production build excludes the debugging overlay.

Changed files for this refinement:

- `CharacterFramePlayer.tsx`: transition timing, continuity, visible-pose resume.
- `InteractiveCharacter.tsx`: configurable `crossfadeMs` prop.
- `characterAnimations.ts`: optional source interval and entry-frame types and
  validation.
- `CharacterDebugOverlay.tsx`: transition diagnostics.
- `src/utils/preloadAnimationFrames.ts`: retain the current lookahead window.
- `public/animations/character/manifest.json`: right-turn entry metadata only.
- `scripts/extract-character-frames.mjs`: preserve that metadata on regeneration.
- `scripts/test-character-browser.mjs`: extend the existing browser regressions.
- `docs/interactive-character.md`: behavior, verification, and asset limitations.

`src/App.tsx`, `src/index.css`, `useCharacterInteraction.ts`, and all 62 WebP files
are unchanged by this refinement. The 35%/65% zones, 1% hysteresis, passive pointer
tracking, Supabase, navigation, content, contact functionality, and unrelated
animations are preserved.

These changes improve continuity between the supplied poses; they do not create
a real left-facing turn. A matching screen-left turn/hold/return and a smooth
right-to-neutral return remain missing. The available right-to-visitor change
must bridge a source cut with a short crossfade; rapid reversals can still show
brief blended silhouettes because the body and head positions differ between
the recorded poses. Eliminating that source mismatch requires matching transition
footage, not rotating or distorting the scene.

Touch-only devices get idle playback and normal scrolling. Actual mouse events
are accepted even on a touch-primary/hybrid device; touch events themselves never
trigger a look or greeting. Reduced motion shows only the poster. The character
is decorative, has no tab stops, and cannot intercept clicks. Width/height and the
original aspect ratio reserve its space before loading.

## Mouse-tracking diagnosis and fix

Two failures were reproduced in the previous implementation before editing:

1. Real mouse `pointermove` events reached the hero, but the compound media query
   `(hover: hover) and (pointer: fine)` returned false. That condition prevented
   the interaction hook from attaching listeners, leaving every state at idle.
   The earlier browser harness forced a fine mouse capability and missed this
   failure. The fix trusts `event.pointerType === 'mouse'` rather than assuming
   that the primary input device describes every available device.
2. Moving left during a greeting updated the stored zone to left, then the
   greeting lock discarded the state change. After the sequence returned to
   idle, further movement in the same zone was ignored because that zone was
   already stored. This was reproduced with a mouse-capable browser. Side looks
   now take priority immediately; stale completion callbacks cannot replace a
   newer look. The current zone also determines the appropriate resting state.

The existing event target, coordinate calculation, and pointer-transparent
decorative layers were working. No portfolio overlay needed removal. The 140 ms
delay previously applied to all zone changes was removed from directional looks.
Mouse input received before the first idle decode is retained and applied when
the player is ready. Only unhandled input is replayed after pausing; resuming
visibility cannot repeat a completed greeting without another zone entry.

The frame player's `data-animation` previously changed as soon as a sequence was
requested, before any new pixels were drawn. It now describes the actual drawn
sequence; `data-requested-animation` records the pending request separately.
Playback, frame paths, and extracted assets were preserved.

### Supported movements

| Requested state | Actual asset support |
| --- | --- |
| Idle | Six frames of laptop work with subtle typing/blink motion |
| Look left | Seven frames turning toward the visitor; forward/slightly screen-left fallback, **not** a separate far-left pose |
| Look right | Twelve frames turning toward screen-right/the laptop, with a distinct held side-facing pose |
| Forward facing | Present in the left-zone glance and greeting |
| Greeting | Smiling/visitor attention and headphone removal; brief hand raise, no separate wave cycle |
| Point down | Nine frames of pointing down and lowering the hand |
| Return to work | Six frames of typing with headphones around the neck |

The actual final look frames were visually inspected. They are different images,
and browser-rendered pixels were compared against each exact WebP after real
pointer movement. Both comparisons had zero mismatched pixel channels. Their
rendered facial regions differ by an average of 30.8 levels per RGBA channel
(0–255), so the test checks a visible pose change, not only React state labels.

The existing assets are sufficient for the forward-glance/right-turn interaction.
A true far-left response requires additional footage. Generate a neutral-to-
screen-left turn, a held left pose, and a return to neutral, with the same camera,
character, laptop position, lighting, headphones, and background. A longer looping
idle and a headphones-from-neck-to-ears reset would improve continuity. A matching
right-to-neutral clip would also improve reversals. Do not rotate the image to
fake these actions. Arbitrary continuous eye tracking requires additional eye/pose
data or a rig; a few discrete video sequences cannot supply it.

### Development overlay and manual checks

Run `npm run dev` and append `?characterDebug=1` to the printed URL. The optional
overlay displays mouse X, normalized X, zone, pointer type/event count, requested
state, actually drawn sequence, one-based frame number, playback status, and
readiness/visibility. It also calls out the missing far-left/continuous poses.
It uses refs and updates its text without rerendering React on pointer movement.
It is rendered outside clipped hero layers and never intercepts pointer events.
Vite's `import.meta.env.DEV` gate excludes it from production, even when the query
parameter is present.

Move over the left 35% of the hero, then the right 35%: the visitor-facing and
side-facing poses should differ. Stay in the centre for the greeting and pointing,
then repeat while moving to a side during the greeting. The side must react
immediately and remain selected. While holding a side, move within that zone:
the final frame should stay held. Moving out of the hero returns to idle. Mobile
touch stays in idle; reduced motion shows a static poster.

### Files changed for this fix

- `src/hooks/useCharacterInteraction.ts`: pointer-type detection, configurable
  zones, immediate side transitions, greeting arbitration, retained early input.
- `src/components/interactive-character/InteractiveCharacter.tsx`: remove the
  primary-pointer gate and connect options/debugging.
- `src/components/interactive-character/CharacterFramePlayer.tsx`: report the
  actual drawn sequence separately from the requested sequence.
- `src/components/interactive-character/CharacterDebugOverlay.tsx`: new optional
  development-only diagnostics.
- `scripts/test-character-browser.mjs`: new repeatable real-pointer regression
  suite with source-pixel comparisons.
- `package.json`: adds `test:character` without adding dependencies.
- `docs/interactive-character.md`: diagnosis, support report, configuration,
  verification, and manual testing instructions.

`src/App.tsx` and `src/index.css` are byte-for-byte unchanged by this fix. Supabase,
navigation, portfolio content, contact handling, project sections, unrelated
animations, and all animation assets were left unchanged.

## Assets

All 62 production frames come from the supplied MP4, sampled at 12 FPS and scaled
to **736 × 312**, preserving its aspect ratio. WebP quality is 76. Frames use
`frame_0001.webp` naming inside each sequence directory; each sampled frame is
stored once. The original background and Hailuo watermark remain.

- WebP frames: **496,832 bytes** (485.2 KiB).
- JSON manifest: **5,923 bytes**.
- Total animation payload: **502,755 bytes** (491.0 KiB).

`public/animations/character/manifest.json` records each animation's name, paths,
count, FPS, looping flag, playback duration, source interval, and limitations.
Optional `entryFrames` maps a previous animation name to a zero-based starting
index. Source intervals identify consecutive frames within the shared original
clip; omit them when replacing a sequence with unrelated footage so that it
crossfades instead of claiming a continuous source join.
`idle` loops; all other sequences play once. The original MP4 stays local and is
excluded through `.gitignore`. No dependencies or paid services were added.

## Files

| File or directory | Purpose |
| --- | --- |
| `src/components/interactive-character/InteractiveCharacter.tsx` | Responsive decorative wrapper, manifest loading, media queries, visibility |
| `src/components/interactive-character/CharacterFramePlayer.tsx` | Canvas playback, continuity, pausing, completion callbacks |
| `src/components/interactive-character/characterAnimations.ts` | Animation types, manifest validation, base-aware asset paths |
| `src/hooks/useCharacterInteraction.ts` | Configurable cursor zones, input detection, state priority, hysteresis, greeting dwell/cooldown |
| `src/components/interactive-character/CharacterDebugOverlay.tsx` | Optional development-only pointer/frame diagnostics |
| `src/utils/preloadAnimationFrames.ts` | Bounded decoded-image cache and asynchronous loading |
| `public/animations/character/` | Six sequences and machine-readable manifest |
| `scripts/extract-character-frames.mjs` | Repeatable FFprobe/FFmpeg extraction and manifest generation |
| `scripts/test-character-browser.mjs` | Real-pointer regressions and exact rendered-pose verification |
| `src/App.tsx` | Hero integration only; Supabase and other sections unchanged |
| `src/index.css` | Scoped hero spacing and character sizing |
| `package.json` | Adds `character:extract` and `test:character`; dependencies unchanged |
| `.gitignore` | Excludes the local source MP4 |
| `README.md` | Links to this guide |
| `docs/interactive-character.md` | Source timeline, implementation, verification, replacement guide |

## Verification

The existing build, lint, and typecheck passed before implementation. After the
change, all three commands passed again with exit code 0:

```sh
npm run build
npm run lint
npm run typecheck
```

Vite still reports the pre-existing outdated Browserslist database advisory. No
dependency updates were made to suppress it.

Chrome 156 browser checks covered:

- Idle requests only its six frames before any interaction.
- Left/right sequences reach and hold their actual final frames.
- Same-zone movement and boundary jitter do not restart playback.
- Pointer exit returns a look to idle.
- Greeting, pointing, return-to-work, and idle run in order.
- The greeting cooldown and leaving during a greeting behave correctly.
- Offscreen playback pauses and resumes.
- The visibility handler pauses/resumes under a simulated `document.hidden`
  change and `visibilitychange` event; native OS tab switching was not automated.
- Reduced-motion mode loads only the poster WebP and remains static.
- Keyboard focus still reaches existing links; the character adds no tab stops.
- Widths of 320, 390, 768, 1024, and 1440 pixels have no horizontal overflow.
- Mobile remains in idle and a touch swipe scrolls the page.
- A before/after DOM comparison preserves all text, eight sections, and 37 links.
- Invalid JSON and corrupt WebP responses fall back without uncaught exceptions.
- An intentionally delayed first greeting frame retains the previous drawing,
  then continues when decoding succeeds.
- Normal production checks have no uncaught exceptions or failed animation asset
  responses. Asset totals, uniqueness, counts, and output dimensions were checked.

Interaction checks used the Vite development server; reduced-motion, mobile,
responsive, and failure cases also ran against the production build. Screenshots
were visually inspected. Browser automation used local Chrome DevTools Protocol
with no new test dependency. A development reload exceeded the initial eight-second
test timeout; the remaining checks passed against the production build.

For the mouse-tracking fix, the persistent Chrome suite additionally verifies
the two reproduced failures, exact canvas pixels for both poses, delayed-frame
diagnostics, quick centre crossings, greeting interruption/cooldown, same-zone
holding, completed greetings after visibility resume, capture-phase tracking,
early input before idle decoding, touch-only idle/scrolling, reduced motion, and
the debug overlay's development/production gate. It does not force fine-pointer
capabilities. Visibility changes in the regression are simulated with
`document.hidden`/`visibilitychange`, not native OS tab switching.

The fixed implementation passes build, lint, and TypeScript checks, plus all 11
browser regression groups against both development and production builds. The
production JavaScript contains none of the overlay's diagnostic strings. Actual
rendered forward/right poses and the development overlay were visually inspected.

With Node 22+, Chrome installed, and the dev or preview server running:

```sh
# Defaults to http://127.0.0.1:5173/ and google-chrome.
npm run test:character

# Override the server, Chrome binary, or optional rendered-pose artifacts.
CHARACTER_TEST_URL=http://127.0.0.1:5174/ \
  CHARACTER_TEST_ARTIFACTS=/tmp/character-poses npm run test:character
```

Set `CHROME_BIN` if Chrome uses a different executable name. The script owns and
cleans up its temporary browser profile and Chrome process. It adds no testing
package. Run the same command against `npm run preview` to verify production;
`?characterDebug=1` must still produce no debug overlay there.

Supabase initialization, queries, review submission handlers, and all other
section code are unchanged. Live database submissions were not exercised; this
workspace has no configured `.env` file. This is not a claim of live database
verification or testing every unrelated feature.

## Replacing the animation

To regenerate the current assets with FFmpeg and FFprobe installed:

```sh
npm run character:extract
```

For a different source, first inspect its frames and update the `timeline` frame
counts/descriptions in `scripts/extract-character-frames.mjs`, then run:

```sh
npm run character:extract -- /absolute/path/to/new-source.mp4
npm run build
npm run lint
npm run typecheck
```

Alternatively, replace the WebP files and edit `manifest.json` directly, retaining
the six animation keys and the documented field types. Each sequence may have a
different frame count/FPS; the player reads these from the manifest. Paths are
relative to Vite's base URL. The manifest's poster must refer to a valid frame.
Keep the original aspect ratio for the initial reserved placeholder to stay the
same size before the manifest loads. No React component rewrite is needed.

For a future asset improvement, use footage with a longer natural idle, a distinct
left turn, and an actual headphones-on return. Those source movements would remove
the present fallback/crossfade limitations. Verify the new timeline, interactions,
and total payload after replacing assets; the current ~491 KiB payload does not
warrant a separate video delivery service.
