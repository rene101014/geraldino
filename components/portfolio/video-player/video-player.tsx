"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/components/portfolio/video-player/use-video-player";
import type { VideoSource } from "@/lib/video/resolve-video-source";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function VideoPlayer({
  source,
  title,
  autoPlay = false,
  className,
}: {
  source: VideoSource;
  title: string;
  autoPlay?: boolean;
  className?: string;
}) {
  const {
    videoRef,
    playing,
    currentTime,
    duration,
    buffered,
    volume,
    muted,
    toggle,
    seek,
    seekBy,
    setVolume,
    toggleMute,
  } = useVideoPlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setControlsVisible(false), 2200);
    }
  }, [playing]);

  // Reinicia el temporizador de auto-ocultado cuando cambia el estado de
  // reproducción, sin forzar visible=true de forma síncrona en el efecto.
  useEffect(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setControlsVisible(false), 2200);
    }
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [playing]);

  const handleTogglePlay = useCallback(() => {
    toggle();
    showControls();
  }, [toggle, showControls]);

  useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "ArrowRight") {
        seekBy(5);
      } else if (e.key === "ArrowLeft") {
        seekBy(-5);
      } else if (e.key === "m") {
        toggleMute();
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    },
    [handleTogglePlay, seekBy, toggleMute, toggleFullscreen],
  );

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={showControls}
      role="region"
      aria-label={title}
      className={cn(
        "group/player relative aspect-video overflow-hidden rounded-xl bg-black outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={source.src}
        poster={source.poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={handleTogglePlay}
        className="size-full cursor-pointer object-contain"
      />

      {!playing ? (
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label="Reproducir"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-black transition-transform hover:scale-105">
            <Play className="ml-1 size-6" fill="currentColor" />
          </span>
        </button>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <Slider
          value={[currentTime]}
          max={duration || 0}
          step={0.1}
          onValueChange={([v]) => seek(v)}
          className="mb-3 [&_[data-slot=slider-track]]:h-1"
          aria-label="Progreso del video"
        />

        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleTogglePlay} aria-label={playing ? "Pausar" : "Reproducir"}>
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>

            <button type="button" onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
              {muted || volume === 0 ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={([v]) => setVolume(v)}
              className="w-20 [&_[data-slot=slider-track]]:h-1"
              aria-label="Volumen"
            />

            <span className="font-mono text-xs tabular-nums text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button type="button" onClick={toggleFullscreen} aria-label="Pantalla completa">
            {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </button>
        </div>
      </div>

      <span className="sr-only">{title}</span>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
        style={{
          width: duration ? `${(buffered / duration) * 100}%` : "0%",
        }}
      />
    </div>
  );
}
