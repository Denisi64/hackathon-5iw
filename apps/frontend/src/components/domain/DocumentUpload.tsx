import { FileCheck2, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { JUSTIFICATIFS_LABELS } from '../../utils/tarifsData'

interface DocumentUploadProps {
  type: string
}

export function DocumentUpload({ type }: DocumentUploadProps) {
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid'>('idle')

  function handleChange() {
    setStatus('validating')
    window.setTimeout(() => setStatus('valid'), 650)
  }

  return (
    <label className={`document-upload document-upload--${status}`}>
      <input type="file" onChange={handleChange} aria-label={JUSTIFICATIFS_LABELS[type] ?? type} />
      {status === 'valid' ? <FileCheck2 aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
      <span>{JUSTIFICATIFS_LABELS[type] ?? type}</span>
      <strong>{status === 'idle' ? 'Ajouter' : status === 'validating' ? 'Verification IA' : 'Confiance 92%'}</strong>
    </label>
  )
}
