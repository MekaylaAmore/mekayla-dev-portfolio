// Requires Node 22+, local Chrome, and a running Vite dev/preview server.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const target = new URL(process.env.CHARACTER_TEST_URL ?? 'http://127.0.0.1:5173/');
target.searchParams.set('characterDebug', '1');
const artifacts = process.env.CHARACTER_TEST_ARTIFACTS;
const profile = await mkdtemp(join(tmpdir(), 'mekayla-character-test-'));
const chrome = spawn(process.env.CHROME_BIN ?? 'google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank',
], { stdio: 'ignore' });
let launchError;
chrome.on('error', error => { launchError = error; });
let socket;
let currentState;

async function waitFor(check, label, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (launchError) throw launchError;
    const value = await check();
    if (value) return value;
    await delay(25);
  }
  throw new Error(`Timed out: ${label}. ${currentState ? JSON.stringify(await currentState()) : ''}`);
}

try {
  const port = await waitFor(async () => {
    try { return (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; }
    catch { return null; }
  }, 'Chrome startup');
  const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json());
  socket = new WebSocket(targets.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++nextId, { resolve, reject });
    socket.send(JSON.stringify({ id: nextId, method, params }));
  });
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const handler = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handler?.reject(new Error(JSON.stringify(message.error)));
      else handler?.resolve(message.result);
    } else listeners.get(message.method)?.(message.params);
  };
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  currentState = () => evaluate(`(() => {
    const character = document.querySelector('.interactive-character');
    const canvas = character?.querySelector('canvas');
    return { state: character?.dataset.characterState, mode: character?.dataset.characterMode,
      playing: canvas?.dataset.animation, frame: canvas?.dataset.frame,
      playback: canvas?.dataset.playback };
  })()`);
  const expectState = (name, playback) => waitFor(async () => {
    const value = await currentState();
    // React can commit the request before the player's passive effect runs.
    // A previously held frame must not count as the new sequence completing.
    return value.state === name && (!playback || (value.playback === playback &&
      (playback === 'static' || value.playing === name)));
  }, `${name}/${playback ?? 'any frame'}`);
  const move = (x, y = 300) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  const exceptions = [];
  const frameRequests = [];
  listeners.set('Runtime.exceptionThrown', event => exceptions.push(event));
  listeners.set('Network.requestWillBeSent', event => {
    if (event.request.url.includes('/animations/character/') && event.request.url.endsWith('.webp')) frameRequests.push(event.request.url);
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: target.href });
  await expectState('idle', 'playing');
  const isDevelopment = await evaluate(`!!document.querySelector('script[src*="/@vite/client"]')`);
  assert.equal(await evaluate(`!!document.querySelector('[data-character-debug]')`), isDevelopment);
  console.log(`PASS debug overlay ${isDevelopment ? 'enabled in development' : 'absent in production'}`);

  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.loopHoldMs`), '1400');
  await waitFor(async () => (await currentState()).frame !== '0', 'idle movement after its neutral hold');
  await waitFor(async () => (await currentState()).frame === '0', 'idle loop returns to working pose');
  await delay(400); assert.equal((await currentState()).frame, '0');
  assert.equal(new Set(frameRequests).size, 6);
  assert(frameRequests.every(url => url.includes('/idle/')));
  console.log('PASS idle rests between short working loops and initially requests only its six frames');

  // Reproduce the missed environment: primary input is touch, but a mouse is also used.
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  assert.equal(await evaluate(`matchMedia('(hover: hover) and (pointer: fine)').matches`), false);
  let heldRequests = [];
  listeners.set('Fetch.requestPaused', event => { heldRequests.push(event.requestId); });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/look-left/frame_0001.webp' }] });
  await move(100);
  await expectState('look-left');
  await waitFor(() => heldRequests.length > 0, 'delayed look frame');
  assert.equal((await currentState()).playing, 'idle');
  if (isDevelopment) {
    await delay(150);
    const debug = await evaluate(`document.querySelector('[data-character-debug]').textContent`);
    assert(debug.includes('Requested: look-left') && debug.includes('Playing: idle') && debug.includes('Mouse X: 100'));
  }
  await Promise.all(heldRequests.map(requestId => send('Fetch.continueRequest', { requestId })));
  await send('Fetch.disable');
  await expectState('look-left', 'held');
  console.log('PASS actual mouse input works when primary-pointer media queries are false; debug distinguishes requested/drawn frames');

  const manifest = await fetch(new URL('animations/character/manifest.json', target)).then(response => response.json());
  async function verifyDrawnPose(name) {
    const sequence = manifest.animations[name];
    const expected = new URL(sequence.frames.at(-1), target).href;
    const comparison = await evaluate(`(async () => {
      const canvas = document.querySelector('.character-canvas');
      const reference = document.createElement('canvas');
      reference.width = canvas.width; reference.height = canvas.height;
      const image = new Image(); image.src = ${JSON.stringify(expected)}; await image.decode();
      reference.getContext('2d', {alpha: false}).drawImage(image, 0, 0);
      const actual = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      const expected = reference.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let different = 0;
      for (let i = 0; i < actual.length; i++) if (actual[i] !== expected[i]) different++;
      const face = canvas.getContext('2d').getImageData(270, 20, 180, 170).data;
      let faceDifference = 0;
      if (${JSON.stringify(name)} === 'look-left') window.__characterTestLeftFace = [...face];
      else for (let i = 0; i < face.length; i++) faceDifference += Math.abs(face[i] - window.__characterTestLeftFace[i]);
      return { different, faceDifference: faceDifference / face.length, png: ${!!artifacts} ? canvas.toDataURL('image/png').split(',')[1] : null };
    })()`);
    assert.equal(comparison.different, 0, `${name} must draw its real final asset, not just change state`);
    if (name === 'look-right') assert(comparison.faceDifference > 5, 'Actual rendered face poses must visibly differ');
    if (artifacts) {
      await mkdir(artifacts, { recursive: true });
      await writeFile(join(artifacts, `${name}.png`), Buffer.from(comparison.png, 'base64'));
    }
    return comparison.faceDifference;
  }
  await verifyDrawnPose('look-left');
  const held = await currentState();
  await move(150); await delay(400);
  assert.deepEqual(await currentState(), held);

  // Retarget while the opposite direction is still decoding. Returning to the
  // visible held pose must resume that exact frame rather than restart it.
  heldRequests = [];
  listeners.set('Fetch.requestPaused', event => { heldRequests.push(event.requestId); });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/look-right/*.webp' }] });
  await move(1300); await expectState('look-right');
  await waitFor(() => heldRequests.length > 0, 'opposite direction decode');
  await move(100); await expectState('look-left', 'held');
  assert.equal((await currentState()).frame, held.frame);
  await Promise.all(heldRequests.map(requestId => send('Fetch.continueRequest', { requestId })));
  await send('Fetch.disable'); await delay(200);
  assert.equal((await currentState()).playing, 'look-left');
  await verifyDrawnPose('look-left');
  console.log('PASS returning before opposite frames decode preserves the visible held pose; late loads cannot overwrite it');

  await move(1300); await expectState('look-right', 'held');
  const faceDifference = await verifyDrawnPose('look-right');
  console.log(`PASS left/right canvas pixels match source assets; face difference ${faceDifference.toFixed(1)}; same-zone playback does not restart`);

  // Record real canvas samples while rapidly changing requested direction.
  await evaluate(`window.__characterRapid = []; (() => {
    let previous;
    const sample = () => {
      const canvas = document.querySelector('.character-canvas');
      const pixels = canvas.getContext('2d').getImageData(270, 20, 180, 170).data;
      let difference = 0;
      if (previous) for (let i = 0; i < pixels.length; i++) difference += Math.abs(pixels[i] - previous[i]);
      window.__characterRapid.push({frame: canvas.dataset.frame, playing: canvas.dataset.animation,
        transition: canvas.dataset.transition, visible: canvas.style.opacity === '1',
        nonblank: pixels.some((value, index) => index % 4 !== 3 && value > 0),
        difference: difference / pixels.length});
      previous = pixels;
      if (window.__characterRapid.length < 90) window.__characterRapidRequest = requestAnimationFrame(sample);
    }; sample();
  })()`);
  await move(100); await waitFor(async () => (await currentState()).playing === 'look-left', 'left blend');
  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.transition`), 'crossfade');
  const firstBlendFrame = (await currentState()).frame;
  await delay(60); assert.equal((await currentState()).frame, firstBlendFrame);
  for (let index = 0; index < 8; index++) { await move(index % 2 === 0 ? 1300 : 100); await delay(55); }
  await expectState('look-left', 'held');
  const rapid = await evaluate(`cancelAnimationFrame(window.__characterRapidRequest); window.__characterRapid`);
  assert(rapid.length > 5 && rapid.every(sample => sample.visible && sample.nonblank));
  await verifyDrawnPose('look-left');
  await move(1300); await expectState('look-right', 'held');
  await verifyDrawnPose('look-right');
  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.transition`), 'continuous');
  if (artifacts) await writeFile(join(artifacts, 'rapid-transitions.json'), JSON.stringify(rapid, null, 2));
  console.log('PASS rapid reversals stay visible, settle on the actual requested pose, and hold the entry frame during a crossfade');

  await move(720); await delay(40); await move(100);
  await expectState('look-left', 'held');
  console.log('PASS crossing the centre quickly does not start a greeting');
  await move(720); await expectState('greeting');
  const greetingStarted = Date.now();
  await delay(200); await move(100); await expectState('look-left', 'held');
  await delay(3000);
  assert.equal((await currentState()).state, 'look-left');
  await move(1300); await expectState('look-right');
  await move(720); await delay(250); assert.equal((await currentState()).state, 'idle');
  await move(100); await expectState('look-left');
  console.log('PASS greeting interruption cannot lose a side request; stale completions and greeting cooldown do not block looks');

  await delay(Math.max(0, 6100 - (Date.now() - greetingStarted)));
  await move(720); await expectState('greeting');
  await expectState('point-down');
  await waitFor(async () => (await currentState()).playing === 'point-down', 'actual pointing frame');
  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.transition`), 'continuous');
  await expectState('return-to-work'); await expectState('idle', 'playing');
  await delay(300); assert.equal((await currentState()).state, 'idle');
  console.log('PASS staying in the centre completes greeting → pointing → return-to-work → idle without repetition');
  await delay(3000);
  await evaluate(`Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));`);
  await waitFor(async () => (await currentState()).playback === 'paused', 'hidden document pause');
  const hiddenFrame = (await currentState()).frame;
  await delay(300); assert.equal((await currentState()).frame, hiddenFrame);
  await evaluate(`delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));`);
  await expectState('idle', 'playing');
  await delay(300);
  assert.equal((await currentState()).state, 'idle');
  console.log('PASS resuming visibility does not repeat a completed greeting in the same zone');

  // Capture listener must survive a child stopping event propagation.
  const title = await evaluate(`(() => {
    const title = document.querySelector('.portfolio-hero h1');
    title.addEventListener('pointermove', event => event.stopPropagation(), {once: true});
    const rect = title.getBoundingClientRect(); return {x: rect.left + 5, y: rect.top + 10};
  })()`);
  await move(title.x, title.y); await expectState('look-left');
  await move(100, 10); await expectState('idle', 'playing');
  console.log('PASS tracking works over descendants that stop bubbling; leaving the hero restores idle');

  await evaluate(`document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,2200)`);
  await waitFor(async () => (await currentState()).playback === 'paused', 'offscreen character pause');
  const pausedFrame = (await currentState()).frame;
  await delay(300); assert.equal((await currentState()).frame, pausedFrame);
  await evaluate('window.scrollTo(0,0)'); await expectState('idle', 'playing');
  console.log('PASS offscreen playback pauses without advancing frames and resumes in view');

  // Remember mouse input received while the initial idle frame is still loading.
  heldRequests = [];
  listeners.set('Fetch.requestPaused', event => { heldRequests.push(event.requestId); });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/idle/frame_0001.webp' }] });
  await send('Page.reload', { ignoreCache: true });
  await waitFor(() => heldRequests.length > 0, 'initial idle request');
  // The poster request can precede React mounting. Wait until the player and
  // hero listeners are active, while the first idle frame is still blocked.
  await waitFor(async () => (await currentState()).playback === 'loading', 'idle player awaiting decoding');
  await move(1300); await delay(100);
  await Promise.all(heldRequests.map(requestId => send('Fetch.continueRequest', { requestId })));
  await send('Fetch.disable');
  await expectState('look-right', 'held');
  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.entryFrame`), String(manifest.animations['look-right'].entryFrames.idle));
  console.log('PASS a pointer observed before idle decoding is replayed when the player becomes ready');

  await send('Emulation.setEmulatedMedia', { features: [{name: 'prefers-reduced-motion', value: 'reduce'}] });
  await expectState('idle', 'static');
  if (isDevelopment) {
    await waitFor(async () => (await evaluate(`document.querySelector('[data-character-debug]').textContent`)).includes('Playing: poster'), 'static poster diagnostics');
  }
  await send('Emulation.setEmulatedMedia', { features: [] });
  await expectState('idle', 'playing');

  for (const [width, height] of [[320,740], [390,844], [768,1024], [1024,768], [1440,1000]]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: width < 768});
    await evaluate('window.scrollTo(0,0)'); await delay(200);
    const layout = await evaluate(`(() => {
      const character = document.querySelector('.interactive-character').getBoundingClientRect();
      const title = document.querySelector('.portfolio-hero h1');
      const links = [...document.querySelectorAll('nav a')].filter(a => a.getClientRects().length > 0).map(a => a.getBoundingClientRect().toJSON());
      const buttons = [...document.querySelectorAll('.portfolio-hero a')].slice(0,2).map(a => {
        const rect = a.getBoundingClientRect();
        const text = [...a.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        const lines = text.flatMap(node => {const range = document.createRange();range.selectNodeContents(node);return [...range.getClientRects()];});
        return {bottom: rect.bottom, height: rect.height, reachable: a.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)), textLines: lines.length};
      });
      return {viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, character: character.toJSON(),
        titleFits: title.scrollWidth <= title.clientWidth+1, buttons, links,
        objectFit: getComputedStyle(document.querySelector('.character-canvas')).objectFit};
    })()`);
    assert(layout.scrollWidth <= layout.viewport && layout.titleFits, `No horizontal overflow at ${width}px`);
    assert(layout.character.left >= 0 && layout.character.right <= width);
    assert.equal(layout.objectFit, 'contain');
    assert(Math.abs(layout.character.width/layout.character.height-736/312) < 0.01);
    assert(layout.buttons.every(button => button.reachable && button.height >= 44 && button.bottom <= height && button.textLines === 1), `Hero buttons accessible at ${width}px`);
    for (let index=1; index<layout.links.length; index++) assert(layout.links[index-1].right <= layout.links[index].left, `Navigation overlap at ${width}px`);
  }
  console.log('PASS 320/390/768/1024/1440px layouts preserve the whole scene, readable text, non-overlapping navigation, and accessible hero buttons');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.reload', { ignoreCache: true }); await expectState('idle', 'playing');
  const mobileRequestStart = frameRequests.length;
  for (const x of [30,195,360]) { await move(x,200); await delay(220); }
  assert.equal((await currentState()).state, 'idle'); assert.equal((await currentState()).mode, 'idle');
  assert.equal(await evaluate(`document.querySelector('.character-canvas').dataset.loopHoldMs`), '2200');
  assert(frameRequests.slice(mobileRequestStart).every(url => url.includes('/idle/')));
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{x: 195, y: 200}] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal((await currentState()).state, 'idle'); assert.equal((await currentState()).mode, 'idle');
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{x: 195, y: 650}] });
  for (let y = 625; y >= 250; y -= 25) {
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{x: 195, y}] }); await delay(15);
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await waitFor(() => evaluate('scrollY > 0'), 'mobile scrolling');
  console.log('PASS touch-only mobile remains idle and scrolls normally');

  await send('Emulation.setEmulatedMedia', { features: [{name: 'prefers-reduced-motion', value: 'reduce'}] });
  await send('Page.reload', { ignoreCache: true }); await expectState('idle', 'static');
  await move(30, 200); await delay(250);
  assert.equal((await currentState()).mode, 'static');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.character-canvas')).opacity`), '0');
  assert.deepEqual(exceptions, []);
  console.log('PASS reduced motion remains static; no uncaught browser exceptions');
} finally {
  socket?.close();
  const exited = new Promise(resolve => chrome.once('exit', resolve));
  if (chrome.exitCode === null && !launchError) {
    chrome.kill('SIGTERM');
    await Promise.race([exited, delay(3000)]);
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
