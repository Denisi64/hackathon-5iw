import { CheckCircle2, CreditCard, ShieldCheck, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DocumentUpload } from '../components/domain/DocumentUpload'
import { GlossaryTooltip } from '../components/domain/GlossaryTooltip'
import { Button } from '../components/ui/Button'
import { StepProgress } from '../components/ui/StepProgress'
import { FORFAITS } from '../utils/tarifsData'
import { formatCurrency } from '../utils/format'

const STEPS = ['Profil', 'Offre', 'Justificatifs', 'Paiement', 'Confirmation']

export function SubscriptionScreen() {
  const [searchParams] = useSearchParams()
  const preselectedForfait = searchParams.get('forfait') ?? 'navigo_annuel'
  const [step, setStep] = useState(1)
  const [forfaitId, setForfaitId] = useState(preselectedForfait)
  const forfait = useMemo(() => FORFAITS.find((item) => item.id === forfaitId) ?? FORFAITS[0], [forfaitId])

  return (
    <main className="screen">
      <section className="panel tunnel" aria-labelledby="subscription-title">
        <span className="eyebrow">Souscription</span>
        <h1 id="subscription-title">Un parcours en cinq etapes maximum.</h1>
        <StepProgress currentStep={step} labels={STEPS} />

        {step === 1 && (
          <div className="tunnel-step">
            <h2>Qui utilisera l'abonnement ?</h2>
            <p>
              Le <GlossaryTooltip term="porteur" /> peut etre different du <GlossaryTooltip term="payeur" />.
            </p>
            <div className="form-grid">
              <label className="text-field">
                Prenom du porteur
                <input defaultValue="Camille" />
              </label>
              <label className="text-field">
                Date de naissance
                <input defaultValue="2005-09-12" type="date" />
              </label>
              <label className="check-row">
                <input type="checkbox" />
                La personne qui paye est differente
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="tunnel-step">
            <h2>Offre recommandee</h2>
            <div className="offer-picker">
              {FORFAITS.slice(0, 6).map((item) => (
                <button
                  className={item.id === forfaitId ? 'offer-option offer-option--active' : 'offer-option'}
                  key={item.id}
                  onClick={() => setForfaitId(item.id)}
                  type="button"
                >
                  <strong>{item.nom}</strong>
                  <span>{item.prixMois === null ? 'Selon dossier' : `${formatCurrency(item.prixMois)} / mois`}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="tunnel-step">
            <h2>Justificatifs</h2>
            {forfait.id.startsWith('tst') ? (
              <div className="api-check">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>Droits confirmes via verification CAF mockee</strong>
                  <p>Aucun document a uploader pour cette demo.</p>
                </div>
              </div>
            ) : forfait.justificatifsRequis.length > 0 ? (
              forfait.justificatifsRequis.map((documentType) => <DocumentUpload key={documentType} type={documentType} />)
            ) : (
              <div className="api-check">
                <CheckCircle2 aria-hidden="true" />
                <div>
                  <strong>Aucun justificatif requis</strong>
                  <p>Vous pouvez passer directement au paiement.</p>
                </div>
              </div>
            )}
            <p className="privacy-note">
              Vos documents servent uniquement a verifier votre eligibilite. Ils sont chiffres et supprimes dans un
              delai d'un mois apres validation.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="tunnel-step">
            <h2>Paiement</h2>
            <div className="payment-box">
              <CreditCard aria-hidden="true" />
              <div>
                <strong>{forfait.nom}</strong>
                <p>{forfait.prixMois === null ? 'Montant confirme apres validation' : `${formatCurrency(forfait.prixMois)} par mois`}</p>
              </div>
            </div>
            <label className="check-row">
              <input type="checkbox" />
              J'accepte les conditions generales et le traitement des donnees necessaires.
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="tunnel-step confirmation">
            <CheckCircle2 aria-hidden="true" />
            <h2>Dossier envoye</h2>
            <p>Un email de confirmation vient d'etre prepare. Vous pouvez suivre le statut dans votre espace client.</p>
          </div>
        )}

        <div className="tunnel-actions">
          <Button disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} variant="secondary">
            Retour
          </Button>
          <Button onClick={() => setStep((current) => Math.min(5, current + 1))}>
            {step === 5 ? 'Termine' : 'Continuer'}
          </Button>
        </div>
      </section>
      <aside className="side-summary" aria-label="Resume">
        <UserRound aria-hidden="true" />
        <h2>{forfait.nom}</h2>
        <p>{forfait.description}</p>
        <strong>{forfait.prixAn === null ? 'Selon dossier' : `${formatCurrency(forfait.prixAn)} / an`}</strong>
      </aside>
    </main>
  )
}
