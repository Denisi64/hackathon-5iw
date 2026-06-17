/* Cinematic ambient background: radial base, noise, animated blobs, and grid.
   Lighter in light mode, more saturated in dark mode. */
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )

export function FloatingBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Layer 1 — Base radial gradient */}
      <div
        className="absolute inset-0
                   bg-[radial-gradient(ellipse_at_top,rgba(25,114,210,0.06)_0%,rgba(244,248,254,0)_55%)]
                   dark:bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]"
      />

      {/* Layer 2 — Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "160px 160px" }}
      />

      {/* Layer 3 — Animated ambient blobs */}
      <div
        className="absolute -top-[10%] left-1/2 -translate-x-1/2
                   h-[1400px] w-[900px] rounded-full
                   blur-[150px] opacity-[0.18] dark:opacity-[0.25]
                   bg-[radial-gradient(circle,rgba(25,114,210,1)_0%,rgba(25,114,210,0)_70%)]
                   dark:bg-[radial-gradient(circle,rgba(42,130,225,1)_0%,rgba(42,130,225,0)_70%)]
                   animate-blob-float"
      />
      <div
        className="absolute top-[15%] -left-[8%]
                   h-[800px] w-[600px] rounded-full
                   blur-[120px] opacity-[0.10] dark:opacity-[0.15]
                   bg-[radial-gradient(circle,rgba(228,47,105,1)_0%,rgba(228,47,105,0)_70%)]
                   animate-blob-float-alt"
      />
      <div
        className="absolute top-[10%] -right-[8%]
                   h-[700px] w-[500px] rounded-full
                   blur-[100px] opacity-[0.10] dark:opacity-[0.12]
                   bg-[radial-gradient(circle,rgba(79,51,139,1)_0%,rgba(79,51,139,0)_70%)]
                   animate-blob-float"
      />
      <div
        className="absolute bottom-[-10%] left-[30%]
                   h-[600px] w-[600px] rounded-full
                   blur-[110px] opacity-[0.08] dark:opacity-[0.10]
                   bg-[radial-gradient(circle,rgba(25,114,210,1)_0%,rgba(25,114,210,0)_70%)]
                   animate-blob-pulse"
      />

      {/* Layer 4 — Precision grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "var(--fg)",
        }}
      />
    </div>
  )
}
