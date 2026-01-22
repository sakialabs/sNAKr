import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-16">
      <div className="text-center">
        <div className="text-8xl mb-16">🦝</div>
        <h1 className="text-4xl font-semibold text-foreground mb-12">
          404
        </h1>
        <p className="text-xl text-muted mb-24">
          This page wandered off somewhere
        </p>
        <Link 
          href="/"
          className="inline-block bg-primary text-primary-foreground px-24 py-12 rounded-button hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
