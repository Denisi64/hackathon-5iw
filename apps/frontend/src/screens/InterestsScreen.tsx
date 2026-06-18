import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { INTERESTS, toggleInterest } from '../data/interests'
import { getInterests, updateInterests } from '../services/interests'

export default function InterestsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Pré-remplit avec les intérêts déjà enregistrés (mode édition depuis l'espace client).
  useEffect(() => {
    let active = true
    getInterests().then((ids) => { if (active) setSelected(ids) }).catch(() => {})
    return () => { active = false }
  }, [])

  async function save() {
    setSaving(true)
    try { await updateInterests(selected) } catch { /* on continue quand même */ }
    finally { setSaving(false); navigate('/mon-espace', { replace: true }) }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 pb-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <Badge variant="info">{t('interests.optional')}</Badge>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">{t('interests.title')}</h1>
        <p className="max-w-xl text-fg-muted">{t('interests.subtitle')}</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2.5">
        {INTERESTS.map(({ id, icon: Icon }) => (
          <Chip key={id} active={selected.includes(id)} onClick={() => setSelected((s) => toggleInterest(s, id))}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(`interests.items.${id}`)}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={save} loading={saving} disabled={selected.length === 0}>
          {t('interests.validate')}
        </Button>
        <button
          type="button"
          onClick={() => navigate('/mon-espace', { replace: true })}
          className="text-sm text-fg-muted hover:text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-sm"
        >
          {t('interests.skip')} →
        </button>
      </div>
    </div>
  )
}
