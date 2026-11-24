/** Instance-owned decoded-frame cache. Only a small lookahead window is loaded. */
export class AnimationFrameCache {
  private images = new Map<string, HTMLImageElement>();
  private pending = new Map<string, Promise<void>>();
  private failed = new Set<string>();
  private retained = new Set<string>();
  private controller = new AbortController();

  constructor(private readonly maxFrames = 20) {}

  get(path: string): HTMLImageElement | undefined {
    const image = this.images.get(path);
    if (image) {
      this.images.delete(path);
      this.images.set(path, image);
    }
    return image;
  }

  async preload(paths: string[]): Promise<void> {
    // Late decodes from an interrupted sequence must not evict the current
    // lookahead window before the player gets its first chance to draw it.
    this.retained = new Set(paths.slice(0, this.maxFrames));
    await Promise.all(paths.map(path => this.load(path)));
  }

  private load(path: string): Promise<void> {
    if (this.images.has(path)) return Promise.resolve();
    if (this.failed.has(path)) return Promise.reject(new Error(`Character frame unavailable: ${path}`));
    const pending = this.pending.get(path);
    if (pending) return pending;
    if (this.controller.signal.aborted) return Promise.reject(new DOMException('Disposed', 'AbortError'));

    const promise = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      const signal = this.controller.signal;
      let finished = false;
      const finish = (error?: Error) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
        image.onload = null;
        image.onerror = null;
        this.pending.delete(path);
        if (error) {
          image.removeAttribute('src');
          if (error.name !== 'AbortError') this.failed.add(path);
          reject(error);
          return;
        }
        this.images.set(path, image);
        while (this.images.size > this.maxFrames) {
          const oldest = [...this.images.keys()].find(key => !this.retained.has(key));
          if (oldest) this.images.delete(oldest);
        }
        resolve();
      };
      const abort = () => finish(new DOMException('Disposed', 'AbortError'));
      const timeout = window.setTimeout(() => finish(new Error(`Character frame timed out: ${path}`)), 10000);
      signal.addEventListener('abort', abort, { once: true });
      image.onload = () => {
        image.decode().then(() => finish(), () => finish(new Error(`Cannot decode character frame: ${path}`)));
      };
      image.onerror = () => finish(new Error(`Cannot load character frame: ${path}`));
      image.src = path;
    });
    this.pending.set(path, promise);
    return promise;
  }

  dispose(): void {
    this.controller.abort();
    this.images.clear();
    this.pending.clear();
    this.failed.clear();
    this.retained.clear();
  }
}
