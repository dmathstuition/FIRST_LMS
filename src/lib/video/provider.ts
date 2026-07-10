/**
 * Video hosting abstraction.
 *
 * Normalizes YouTube (private/unlisted), Vimeo, Bunny Stream, and Mux into a
 * single embed model so the course player (Phase 8) is provider-agnostic.
 * Direct-upload/signing for Mux & Bunny is added when their keys are present.
 */

export type VideoProviderName =
  | "youtube"
  | "vimeo"
  | "bunny"
  | "mux"
  | "url";

export interface VideoSource {
  provider: VideoProviderName;
  /** Provider-specific id (YouTube/Vimeo id, Mux playback id, Bunny guid) or a direct URL. */
  ref: string;
}

export interface EmbedOptions {
  autoplay?: boolean;
  /** Start position in seconds. */
  startAt?: number;
  /** Signed token for private Mux/Bunny playback (Phase 8+). */
  token?: string;
}

/** Build a canonical, sandbox-safe iframe/HLS URL for a given source. */
export function getEmbedUrl(source: VideoSource, opts: EmbedOptions = {}): string {
  const { provider, ref } = source;
  const params = new URLSearchParams();
  if (opts.autoplay) params.set("autoplay", "1");
  if (opts.startAt) params.set("start", String(Math.floor(opts.startAt)));

  switch (provider) {
    case "youtube":
      // Privacy-enhanced no-cookie domain; modestbranding + rel to keep it clean.
      params.set("modestbranding", "1");
      params.set("rel", "0");
      return `https://www.youtube-nocookie.com/embed/${ref}?${params.toString()}`;
    case "vimeo":
      params.set("dnt", "1");
      return `https://player.vimeo.com/video/${ref}?${params.toString()}`;
    case "bunny":
      // ref = "<libraryId>/<videoGuid>"
      return `https://iframe.mediadelivery.net/embed/${ref}?${params.toString()}`;
    case "mux":
      if (opts.token) params.set("token", opts.token);
      return `https://stream.mux.com/${ref}.m3u8?${params.toString()}`;
    case "url":
    default:
      return ref;
  }
}

/** Best-effort thumbnail URL for catalog cards. */
export function getThumbnailUrl(source: VideoSource): string | null {
  switch (source.provider) {
    case "youtube":
      return `https://img.youtube.com/vi/${source.ref}/hqdefault.jpg`;
    case "mux":
      return `https://image.mux.com/${source.ref}/thumbnail.jpg`;
    default:
      return null;
  }
}
