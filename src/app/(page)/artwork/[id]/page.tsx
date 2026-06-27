export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>작품 상세: {params.id}</h1>
    </main>
  )
}
