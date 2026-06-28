import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { buildChatSystemPrompt } from '@/lib/prompts'
import type { Attribute, Tone, Level } from '@/types'

const VALID_ATTRIBUTES = ['background', 'meaning', 'relation']
const VALID_TONES = ['formal', 'humorous', 'child', 'reflective']
const VALID_LEVELS = ['beginner', 'normal', 'expert']
const MAX_HISTORY = 20

export async function POST(request: NextRequest) {
  const { artworkTitle, artistName, description, attribute, tone, level, docentContent, chatHistory, question } =
    (await request.json()) as {
      artworkTitle: string
      artistName: string
      description: string
      attribute: Attribute
      tone: Tone
      level: Level
      docentContent: string
      chatHistory: { role: 'user' | 'assistant'; content: string }[]
      question: string
    }

  if (
    !VALID_ATTRIBUTES.includes(attribute) ||
    !VALID_TONES.includes(tone) ||
    !VALID_LEVELS.includes(level) ||
    !question?.trim() ||
    question.length > 500 ||
    (description?.length ?? 0) > 2000 ||
    (docentContent?.length ?? 0) > 3000
  ) {
    return new Response('잘못된 요청입니다.', { status: 400 })
  }

  const system = buildChatSystemPrompt({
    title: artworkTitle,
    artistName,
    description,
    attribute,
    tone,
    level,
    docentContent,
  })

  const recentHistory = (chatHistory ?? []).slice(-MAX_HISTORY)

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system,
    messages: [
      ...recentHistory.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user' as const, content: question },
    ],
  })

  return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
