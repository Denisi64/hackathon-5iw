import { api } from './api'

export interface Document {
  id: string
  subscriptionId: string
  type: string
  minioKey: string
  status: 'uploaded' | 'validating' | 'valid' | 'rejected'
  aiConfidence: number | null
  aiExtractedData: string | null
  validatedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface VerifyResult {
  id: string
  status: Document['status']
  aiConfidence: number | null
  aiExtractedData: string | null
}

export const documentsService = {
  upload: (subscriptionId: string, type: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('subscriptionId', subscriptionId)
    form.append('type', type)
    return api.post<Document>('/documents', form).then((r) => r.data)
  },

  verify: (subscriptionId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('subscriptionId', subscriptionId)
    return api.post<VerifyResult>('/documents/verify', form).then((r) => r.data)
  },

  findBySubscription: (subscriptionId: string) =>
    api.get<Document[]>(`/documents/subscription/${subscriptionId}`).then((r) => r.data),
}
