import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QrConfirmClient from './QrConfirmClient'
import type { Artwork } from '@/types'

export default async function QrConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select('*, artists(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') notFound()
    throw new Error(error.message)
  }
  if (!artwork) notFound()

  return <QrConfirmClient artwork={artwork as Artwork} />
}
