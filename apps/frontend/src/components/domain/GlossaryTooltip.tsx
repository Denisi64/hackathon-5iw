import type { ReactNode } from 'react'
import { GLOSSAIRE } from '../../utils/glossaire'

interface GlossaryTooltipProps {
  term: string
  children?: ReactNode
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const definition = children ?? GLOSSAIRE[term]
  return (
    <span className="glossary">
      <button className="glossary__term" type="button" aria-describedby={`glossary-${term}`}>
        {term}
      </button>
      <span className="glossary__bubble" id={`glossary-${term}`} role="tooltip">
        {definition}
      </span>
    </span>
  )
}
