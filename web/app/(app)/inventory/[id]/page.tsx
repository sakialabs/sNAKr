export default async function ItemDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Item Detail</h1>
        <p className="text-muted-foreground mb-8">
          View item history, predictions, and manage item details.
        </p>
        <p className="text-sm text-muted-foreground">Item ID: {id}</p>
        {/* Placeholder for item detail view with history and predictions */}
      </div>
    </main>
  )
}
