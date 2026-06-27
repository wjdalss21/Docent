import { create } from 'zustand'
import type { Attribute, Tone } from '@/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface DocentStore {
  attribute: Attribute | null
  tone: Tone
  chatHistory: ChatMessage[]
  setAttribute: (attr: Attribute) => void
  setTone: (tone: Tone) => void
  addChat: (msg: ChatMessage) => void
  resetChat: () => void
}

export const useDocentStore = create<DocentStore>((set) => ({
  attribute: null,
  tone: 'formal',
  chatHistory: [],
  setAttribute: (attr) => set({ attribute: attr }),
  setTone: (tone) => set({ tone }),
  addChat: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  resetChat: () => set({ chatHistory: [] }),
}))
