export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-16 py-48">
        <h1 className="text-4xl font-semibold text-foreground mb-24">
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted mb-24">
            Last updated: January 2025
          </p>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              What we collect
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr collects only what&apos;s necessary to provide the service:
            </p>
            <ul className="space-y-8 text-foreground">
              <li>• Email address (for authentication)</li>
              <li>• Household inventory data (items, states, events)</li>
              <li>• Receipt images and parsed data</li>
              <li>• Usage patterns (for predictions)</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              What we don&apos;t collect
            </h2>
            <ul className="space-y-8 text-foreground">
              <li>• Location data (GPS, IP geolocation)</li>
              <li>• Device identifiers (unless IoT explicitly linked)</li>
              <li>• Browsing history or external activity</li>
              <li>• Payment information (handled by payment processor)</li>
              <li>• Individual member behavior (household-scoped only)</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              How we use your data
            </h2>
            <ul className="space-y-8 text-foreground">
              <li>• Provide inventory tracking and predictions</li>
              <li>• Process receipts with OCR</li>
              <li>• Generate restock recommendations</li>
              <li>• Improve ML models (anonymized)</li>
              <li>• Send notifications (if enabled)</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Data security
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              Your data is protected with:
            </p>
            <ul className="space-y-8 text-foreground">
              <li>• Encryption at rest and in transit (TLS 1.3)</li>
              <li>• Row Level Security (RLS) for multi-tenant isolation</li>
              <li>• Secure authentication via Supabase</li>
              <li>• 90-day receipt retention (user-configurable)</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Your rights
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              You have the right to:
            </p>
            <ul className="space-y-8 text-foreground">
              <li>• Access your data (export as JSON)</li>
              <li>• Rectify incorrect data</li>
              <li>• Delete your account and all data</li>
              <li>• Opt out of notifications</li>
              <li>• Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Third-party services
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr uses these third-party services:
            </p>
            <ul className="space-y-8 text-foreground">
              <li>• Supabase (database, auth, storage)</li>
              <li>• Tesseract OCR (receipt processing)</li>
              <li>• Netlify (web hosting)</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-12">
              Each service has its own privacy policy. We do not share your data 
              beyond what&apos;s necessary to provide the service.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Household-safe design
            </h2>
            <p className="text-foreground leading-relaxed">
              sNAKr does not track individual member behavior. Events are household-scoped, 
              not user-scoped. No &ldquo;who used it&rdquo; tracking. No member rankings or comparisons.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Changes to this policy
            </h2>
            <p className="text-foreground leading-relaxed">
              We may update this policy from time to time. We&apos;ll notify you of significant 
              changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Contact us
            </h2>
            <p className="text-foreground leading-relaxed">
              Questions about privacy? Email us at{' '}
              <a href="mailto:privacy@snakr.app" className="text-primary hover:text-primary/80">
                privacy@snakr.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
