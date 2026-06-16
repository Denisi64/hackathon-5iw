import { CheckCircle2, CreditCard, ShieldCheck, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DocumentUpload } from '../components/domain/DocumentUpload'
import { GlossaryTooltip } from '../components/domain/GlossaryTooltip'
import { Button } from '../components/ui/Button'
import { StepProgress } from '../components/ui/StepProgress'
import { OFFERS } from '../utils/pricesData'
import { formatCurrency } from '../utils/format'

const STEPS = ['Profil', 'Offre', 'Justificatifs', 'Paiement', 'Confirmation']

export function SubscriptionScreen() {
  const [searchParams] = useSearchParams()
  const preselectedOffer = searchParams.get('forfait') ?? 'navigo_annual'
  const [step, setStep] = useState(1)
  const [offerId, setOfferId] = useState(preselectedOffer)
  const offer = useMemo(() => OFFERS.find((item) => item.id === offerId) ?? OFFERS[0], [offerId])

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
              Le <GlossaryTooltip term="holder">porteur</GlossaryTooltip> peut etre different du{' '}
              <GlossaryTooltip term="payer">payeur</GlossaryTooltip>.
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
              {OFFERS.slice(0, 6).map((item) => (
                <button
                  className={item.id === offerId ? 'offer-option offer-option--active' : 'offer-option'}
                  key={item.id}
                  onClick={() => setOfferId(item.id)}
                  type="button"
                >
                  <strong>{item.name}</strong>
                  <span>{item.monthlyPrice === null ? 'Selon dossier' : `${formatCurrency(item.monthlyPrice)} / mois`}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="tunnel-step">
            <h2>Justificatifs</h2>
            {offer.id.startsWith('solidarity') ? (
              <div className="api-check">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>Droits confirmes via verification CAF mockee</strong>
                  <p>Aucun document a uploader pour cette demo.</p>
                </div>
              </div>
            ) : offer.requiredDocuments.length > 0 ? (
              offer.requiredDocuments.map((documentType) => <DocumentUpload key={documentType} type={documentType} />)
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
                <strong>{offer.name}</strong>
                <p>{offer.monthlyPrice === null ? 'Montant confirme apres validation' : `${formatCurrency(offer.monthlyPrice)} par mois`}</p>
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
        <h2>{offer.name}</h2>
        <p>{offer.description}</p>
        <strong>{offer.yearlyPrice === null ? 'Selon dossier' : `${formatCurrency(offer.yearlyPrice)} / an`}</strong>
      </aside>
    </main>
  )
}
