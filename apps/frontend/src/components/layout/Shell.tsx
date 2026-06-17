import { type ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { FloatingBlobs } from '../ui/FloatingBlobs'
import { VoiceAssistant } from '../domain/VoiceAssistant'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen pt-3">
      <FloatingBlobs />
      <Header />
      <main className="mx-auto mt-10 w-[min(100%-1.5rem,1200px)]">{children}</main>
      <Footer />
      <VoiceAssistant />
    </div>
  )
}
