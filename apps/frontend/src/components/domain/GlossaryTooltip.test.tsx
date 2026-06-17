import { beforeAll, describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import i18n from '../../lib/i18n'
import { GlossaryTooltip } from './GlossaryTooltip'

beforeAll(async () => {
  await i18n.changeLanguage('fr')
})

describe('GlossaryTooltip', () => {
  it('renders the term label and hides the definition by default', () => {
    render(<GlossaryTooltip term="porteur" />)
    expect(screen.getByRole('button')).toHaveTextContent('porteur')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('reveals the definition on click', () => {
    render(<GlossaryTooltip term="porteur" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toHaveTextContent(/titre de transport/i)
  })
})
