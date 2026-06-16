interface StepProgressProps {
  currentStep: number
  labels: string[]
}

export function StepProgress({ currentStep, labels }: StepProgressProps) {
  return (
    <ol className="step-progress" aria-label="Progression de la souscription">
      {labels.map((label, index) => {
        const step = index + 1
        const status = step < currentStep ? 'complete' : step === currentStep ? 'current' : 'todo'
        return (
          <li className={`step-progress__item step-progress__item--${status}`} key={label}>
            <span aria-hidden="true">{step}</span>
            <strong>{label}</strong>
          </li>
        )
      })}
    </ol>
  )
}
