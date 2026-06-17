import { api } from './api'

export interface CheckoutSession {
  url: string
  sessionId: string
}

export const paymentsService = {
  createCheckout: (subscriptionId: string) =>
    api.post<CheckoutSession>('/payments/checkout', { subscriptionId }).then((r) => r.data),

  redirectToCheckout: async (subscriptionId: string) => {
    const { url } = await paymentsService.createCheckout(subscriptionId)
    window.location.href = url
  },
}
