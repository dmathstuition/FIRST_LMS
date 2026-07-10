"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  PictureInPicture2,
  Gauge,
  RotateCcw,
  RotateCw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getEmbedUrl, type VideoSource } from "@/lib/video/provider";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmt(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Video player. For direct-file sources (provider "url"/"mux") it renders a
 * native <video> with a custom control bar — play/pause, seek, ±10s, volume,
 * speed, picture-in-picture, and fullscreen. For YouTube/Vimeo/Bunny it renders
 * a responsive privacy-friendly iframe (their own player handles controls).
 * Calls `onEnded` so the parent can auto-advance / mark complete.
 */
export function VideoPlayer({
  source,
  onEnded,
}: {
  source: VideoSource;
  onEnded?: () => void;
}) {
  const isEmbed = ["youtube", "vimeo", "bunny"].includes(source.provider);

  if (isEmbed) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={getEmbedUrl(source)}
          title="Lesson video"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <NativeVideo src={source.ref} onEnded={onEnded} />;
}

function NativeVideo({
  src,
  onEnded,
}: {
  src: string;
  onEnded?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [speedOpen, setSpeedOpen] = React.useState(false);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function seek(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(duration, Math.max(0, v.currentTime + delta));
  }

  function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  }

  function changeSpeed(rate: number) {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setSpeed(rate);
    setSpeedOpen(false);
  }

  async function togglePiP() {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
      }
    } catch {
      /* PiP not available — ignore */
    }
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full"
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

      {/* Center play button when paused */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-lg">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}

      {/* Control bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {/* Seek */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={current}
          onChange={onScrub}
          aria-label="Seek"
          className="mb-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${
              duration ? (current / duration) * 100 : 0
            }%, rgba(255,255,255,0.3) 0%)`,
          }}
        />
        <div className="flex items-center gap-3 text-white">
          <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button type="button" onClick={() => seek(-10)} aria-label="Back 10 seconds">
            <RotateCcw className="size-5" />
          </button>
          <button type="button" onClick={() => seek(10)} aria-label="Forward 10 seconds">
            <RotateCw className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current;
              if (v) {
                v.muted = !v.muted;
                setMuted(v.muted);
              }
            }}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>

          <span className="text-xs tabular-nums">
            {fmt(current)} / {fmt(duration)}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Speed */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpeedOpen((o) => !o)}
                className="flex items-center gap-1 text-xs font-medium"
                aria-label="Playback speed"
              >
                <Gauge className="size-5" /> {speed}×
              </button>
              {speedOpen && (
                <div className="absolute bottom-8 right-0 overflow-hidden rounded-lg bg-black/90 text-xs">
                  {SPEEDS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => changeSpeed(r)}
                      className={cn(
                        "block w-16 px-3 py-1.5 text-left hover:bg-white/10",
                        r === speed && "text-primary",
                      )}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={togglePiP} aria-label="Picture in picture">
              <PictureInPicture2 className="size-5" />
            </button>
            <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen">
              <Maximize className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
