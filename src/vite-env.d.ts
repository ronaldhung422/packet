/// <reference types="vite/client" />

interface Window {
  deferredPrompt?: Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
  MSStream?: unknown
}
