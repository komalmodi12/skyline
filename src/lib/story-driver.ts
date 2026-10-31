// Scroll position ko 0 se 1 ke "progress" mein badalta hai, aur use smooth karta hai
// taaki tez scroll ya ulta scroll karne par koi jhatka na aaye.
// 3D scene aur text panels, dono isi progress se chalte hain, isliye hamesha sync rehte hain.

export interface StoryFrame {
  progress: number; // smooth kiya hua (0..1)
  target: number; // scroll ki asli jagah (0..1)
  dt: number; // pichhle frame se seconds
  now: number; // ms
}

type Listener = (frame: StoryFrame) => void;

export interface StoryDriver {
  subscribe: (fn: Listener) => () => void;
  // Jab tak hold hai, frames chalte rehte hain (jaise 3D ka halka ghoomna)
  hold: () => () => void;
  getProgress: () => number;
  destroy: () => void;
}

const SMOOTHING = 6; // zyada = tez follow karta hai
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function createStoryDriver(
  container: HTMLElement,
  stage: HTMLElement
): StoryDriver {
  const listeners = new Set<Listener>();
  let holds = 0;
  let target = 0;
  let current = 0;
  let last = 0;
  let raf = 0;
  let visible = true;
  let destroyed = false;
  let stickyTop = 0;
  let frame: StoryFrame = { progress: 0, target: 0, dt: 0, now: 0 };

  function readStickyTop() {
    stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
  }

  function measure() {
    const rect = container.getBoundingClientRect();
    const total = rect.height - stage.offsetHeight;
    target = total > 0 ? clamp01((stickyTop - rect.top) / total) : 0;
  }

  function schedule() {
    if (raf || destroyed || !visible || document.hidden) return;
    raf = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    raf = 0;
    if (destroyed) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;

    measure();
    const diff = target - current;
    current =
      Math.abs(diff) < 0.00005
        ? target
        : current + diff * (1 - Math.exp(-dt * SMOOTHING));

    frame = { progress: current, target, dt, now };
    listeners.forEach((fn) => fn(frame));

    if (current !== target || holds > 0) schedule();
    else last = 0; // thham gaye: agle jaagne par dt bada na ho
  }

  const onWake = () => schedule();
  const onResize = () => {
    readStickyTop();
    schedule();
  };

  readStickyTop();
  measure();
  current = target;
  frame = { progress: current, target, dt: 0, now: 0 };

  window.addEventListener("scroll", onWake, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onWake);

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    },
    { rootMargin: "100px" }
  );
  observer.observe(container);

  return {
    subscribe(fn) {
      listeners.add(fn);
      fn(frame); // turant ek baar, taaki reload par sahi jagah dikhe
      return () => {
        listeners.delete(fn);
      };
    },
    hold() {
      holds += 1;
      schedule();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        holds -= 1;
      };
    },
    getProgress: () => current,
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      listeners.clear();
      observer.disconnect();
      window.removeEventListener("scroll", onWake);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onWake);
    },
  };
}
