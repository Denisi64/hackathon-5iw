import { lineColor } from '../../utils/idfmNetwork'

export interface LineBadgeProps {
  line: string
  size?: number
}

/** Pastille de ligne (couleur officielle IDFM). Métro = rond, RER/Transilien = arrondi. */
export function LineBadge({ line, size = 32 }: LineBadgeProps) {
  const label = /^M\d/.test(line) ? line.slice(1) : line
  const isMetro = /^M?\d+[Bb]?$/.test(line)
  const isRer = /^[A-E]$/.test(line)
  const bg = lineColor(line)
  const radius = isMetro ? size / 2 : isRer ? size * 0.2 : size * 0.28
  const width = isRer ? Math.round(size * 1.15) : size
  const fontSize = label.length > 3 ? size * 0.32 : label.length > 2 ? size * 0.38 : size * 0.48

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-black leading-none text-white"
      style={{ width, height: size, borderRadius: radius, backgroundColor: bg, fontSize }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}
