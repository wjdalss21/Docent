import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArtworkDetailClient from './ArtworkDetailClient'
import type { Artwork } from '@/types'

export default async function ArtworkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams

  if (from === 'qr') {
    redirect(`/artwork/${id}/qr`)
  }

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*, artists(*)')
    .eq('id', id)
    .single()

  if (!artwork) notFound()

  return <ArtworkDetailClient artwork={artwork as Artwork} />
}
