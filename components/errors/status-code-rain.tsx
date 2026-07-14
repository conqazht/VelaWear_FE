"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Bounds = {
  width: number;
  height: number;
};

type StatusDrop = {
  id: number;
  glyph: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  restFrames: number;
  settled: boolean;
};

type StatusCodeRainProps = {
  code: string;
  color?: string;
  compact?: boolean;
  hint?: string;
  hintTone?: "light" | "dark";
};

const GRAVITY = 0.78;
const AIR_RESISTANCE = 0.985;
const FLOOR_FRICTION = 0.9;
const BOUNCE_DAMPING = 0.68;
const DROP_RADIUS = 18;
const COLLISION_DISTANCE = DROP_RADIUS * 2 + 2;
const MAX_DROPS = 56;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function simulateDrops(drops: StatusDrop[], bounds: Bounds) {
  if (bounds.width === 0 || bounds.height === 0) return drops;

  return drops.map((drop, index) => {
    if (drop.settled) return drop;

    let velocityY = (drop.velocityY + GRAVITY) * AIR_RESISTANCE;
    let velocityX = drop.velocityX * AIR_RESISTANCE;
    let x = drop.x + velocityX;
    let y = drop.y + velocityY;
    let restFrames = drop.restFrames;
    let onSurface = false;

    if (x < DROP_RADIUS) {
      x = DROP_RADIUS;
      velocityX = Math.abs(velocityX) * BOUNCE_DAMPING;
    } else if (x > bounds.width - DROP_RADIUS) {
      x = bounds.width - DROP_RADIUS;
      velocityX = -Math.abs(velocityX) * BOUNCE_DAMPING;
    }

    for (let otherIndex = 0; otherIndex < drops.length; otherIndex += 1) {
      if (otherIndex === index) continue;

      const other = drops[otherIndex];
      const deltaX = other.x - x;
      const deltaY = other.y - y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance === 0 || distance >= COLLISION_DISTANCE || deltaY <= 0) continue;

      onSurface = true;
      const angle = Math.atan2(deltaY, deltaX);
      x = other.x - Math.cos(angle) * COLLISION_DISTANCE;
      y = other.y - Math.sin(angle) * COLLISION_DISTANCE;
      velocityY = velocityY > 0.7 ? -velocityY * BOUNCE_DAMPING : 0;
      velocityX *= 0.92;
      break;
    }

    if (y >= bounds.height - DROP_RADIUS) {
      onSurface = true;
      y = bounds.height - DROP_RADIUS;
      velocityY = velocityY > 0.9 ? -velocityY * BOUNCE_DAMPING : 0;
      velocityX *= FLOOR_FRICTION;
    }

    const nearlyStill = Math.abs(velocityX) < 0.08 && Math.abs(velocityY) < 0.08;
    restFrames = onSurface && nearlyStill ? restFrames + 1 : 0;

    return {
      ...drop,
      x: clamp(x, DROP_RADIUS, Math.max(DROP_RADIUS, bounds.width - DROP_RADIUS)),
      y: Math.min(y, Math.max(DROP_RADIUS, bounds.height - DROP_RADIUS)),
      velocityX: nearlyStill ? 0 : velocityX,
      velocityY: nearlyStill ? 0 : velocityY,
      rotation: drop.rotation + velocityX * 1.8,
      restFrames,
      settled: restFrames > 18,
    };
  });
}

export function StatusCodeRain({
  code,
  color = "#f7f4ef",
  compact = false,
  hint = "Click anywhere to drop the code",
  hintTone = "light",
}: StatusCodeRainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<Bounds>({ width: 0, height: 0 });
  const dropsRef = useRef<StatusDrop[]>([]);
  const nextDropId = useRef(0);
  const [drops, setDrops] = useState<StatusDrop[]>([]);
  const [animationRun, setAnimationRun] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const addDrop = useCallback((clientX: number, clientY: number, button: number) => {
    if (button !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const glyphs = Array.from(code).filter((character) => character.trim().length > 0);
    if (glyphs.length === 0) return;

    const rect = container.getBoundingClientRect();
    const newDrop: StatusDrop = {
      id: nextDropId.current,
      glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
      x: clientX - rect.left,
      y: clientY - rect.top,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: -1,
      rotation: 0,
      restFrames: 0,
      settled: false,
    };
    nextDropId.current += 1;

    const nextDrops = [...dropsRef.current.slice(-(MAX_DROPS - 1)), newDrop];
    dropsRef.current = nextDrops;
    setDrops(nextDrops);
    setShowHint(false);
    setAnimationRun((value) => value + 1);
  }, [code]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateBounds = () => {
      const nextBounds = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      boundsRef.current = nextBounds;

      if (dropsRef.current.length === 0) return;

      const resizedDrops = dropsRef.current.map((drop) => ({
        ...drop,
        x: clamp(drop.x, DROP_RADIUS, Math.max(DROP_RADIUS, nextBounds.width - DROP_RADIUS)),
        y: Math.min(drop.y, Math.max(DROP_RADIUS, nextBounds.height - DROP_RADIUS)),
        settled: false,
        restFrames: 0,
      }));
      dropsRef.current = resizedDrops;
      setDrops(resizedDrops);
      setAnimationRun((value) => value + 1);
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const surface = container?.parentElement;
    if (!surface) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("a, button, input, select, textarea, [role='button']")
      ) {
        return;
      }

      addDrop(event.clientX, event.clientY, event.button);
    };

    surface.addEventListener("pointerdown", handlePointerDown);
    return () => surface.removeEventListener("pointerdown", handlePointerDown);
  }, [addDrop]);

  useEffect(() => {
    if (animationRun === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animationFrame: number | null = null;
    let cancelled = false;

    const tick = () => {
      if (cancelled || document.hidden) {
        animationFrame = null;
        return;
      }

      const nextDrops = simulateDrops(dropsRef.current, boundsRef.current);
      dropsRef.current = nextDrops;
      setDrops(nextDrops);

      if (nextDrops.some((drop) => !drop.settled)) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        animationFrame = null;
      }
    };

    const resumeWhenVisible = () => {
      if (!document.hidden && animationFrame === null && dropsRef.current.some((drop) => !drop.settled)) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", resumeWhenVisible);
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", resumeWhenVisible);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, [animationRun]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      {drops.map((drop) => (
        <span
          key={drop.id}
          className={compact ? "absolute font-numeric text-2xl font-bold" : "absolute font-numeric text-4xl font-bold"}
          style={{
            color,
            left: drop.x,
            opacity: drop.settled ? 0.82 : 0.95,
            textShadow: `0 4px 18px ${color}24`,
            top: drop.y,
            transform: `translate(-50%, -50%) rotate(${drop.rotation}deg)`,
            willChange: "transform, left, top",
          }}
        >
          {drop.glyph}
        </span>
      ))}

      {showHint && hint ? (
        <span
          className={
            compact
              ? `absolute inset-x-0 bottom-4 text-center text-[11px] uppercase tracking-[0.24em] motion-safe:animate-pulse motion-reduce:hidden ${
                  hintTone === "dark" ? "text-[#1c1a18]/42" : "text-white/38"
                }`
              : `absolute inset-x-4 bottom-20 text-center text-[10px] uppercase tracking-[0.2em] motion-safe:animate-pulse motion-reduce:hidden sm:inset-x-0 sm:text-xs sm:tracking-[0.28em] ${
                  hintTone === "dark" ? "text-[#1c1a18]/46" : "text-white/42"
                }`
          }
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
