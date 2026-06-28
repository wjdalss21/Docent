import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildChatPrompt } from '@/lib/prompts'
import type { Attribute, Tone, Level } from '@/types'

export async function POST(request: NextRequest) {
  const { artworkTitle, artistName, description, attribute, tone, level, docentContent, question } =
    (await request.json()) as {
      artworkTitle: string
      artistName: string
      description: string
      attribute: Attribute
      tone: Tone
      level: Level
      docentContent: string
      question: string
    }

  const prompt = buildChatPrompt({
    title: artworkTitle,
    artistName,
    description,
    attribute,
    tone,
    level,
    docentContent,
    question,
  })

  const result = streamText({
    model: google('gemini-1.5-flash'),
    prompt,
  })

  return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
