import { create } from 'zustand'
import type { Attribute, Tone, Level } from '@/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface DocentStore {
  attribute: Attribute | null
  tone: Tone | null
  level: Level
  chatHistory: ChatMessage[]
  setAttribute: (attr: Attribute) => void
  setTone: (tone: Tone) => void
  setLevel: (level: Level) => void
  addChat: (msg: ChatMessage) => void
  resetChat: () => void
  resetSession: () => void
}

export const useDocentStore = create<DocentStore>((set) => ({
  attribute: null,
  tone: null,
  level: 'normal',
  chatHistory: [],
  setAttribute: (attr) => set({ attribute: attr, chatHistory: [] }),
  setTone: (tone) => set({ tone }),
  setLevel: (level) => set({ level }),
  addChat: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  resetChat: () => set({ chatHistory: [] }),
  resetSession: () => set({ attribute: null, chatHistory: [] }),
}))
