/**
 * Next.js configuration for DMATHS Learning Hub.
 * - Enables strict React mode for surfacing potential problems early.
 * - Configures remote image patterns for Supabase Storage and common video CDNs.
 * - Applies security headers globally (defense-in-depth alongside RLS + CSP).
 */

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` is retained for script/style because Next.js App Router
 * emits inline hydration bootstrap scripts and Framer Motion writes inline
 * style attributes; without per-request nonces those need to be allowed. The
 * policy still blocks the high-value attacks: no external script origins, no
 * plugins/objects, no framing of the site (clickjacking), and locked-down
 * base-uri/form-action. `connect-src`/`frame-src` are scoped to Supabase and
 * the supported video providers. `'unsafe-eval'` is dev-only (React Refresh).
 */
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co`,
  `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com`,
  `media-src 'self' https: blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Allow remote images from Supabase Storage and the video/CDN providers we support.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
