export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-16 py-48">
        <h1 className="text-4xl font-semibold text-foreground mb-24">
          Terms of Service
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted mb-24">
            Last updated: January 2025
          </p>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Acceptance of terms
            </h2>
            <p className="text-foreground leading-relaxed">
              By using sNAKr, you agree to these terms. If you don&apos;t agree, don&apos;t use the service.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              What sNAKr does
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr helps you track household inventory, process receipts, and get restock recommendations. 
              We provide the tools. You provide the data. We help you stay stocked.
            </p>
            <p className="text-foreground leading-relaxed">
              sNAKr is provided &ldquo;as is&rdquo; without warranties. We&apos;ll do our best to keep it running smoothly, 
              but we can&apos;t guarantee 100% uptime or perfect predictions.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Your responsibilities
            </h2>
            <ul className="space-y-8 text-foreground">
              <li>• Keep your account secure</li>
              <li>• Don&apos;t share your password</li>
              <li>• Don&apos;t abuse the service (spam, hacking, etc.)</li>
              <li>• Don&apos;t upload illegal or harmful content</li>
              <li>• Be respectful to other household members</li>
            </ul>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Your data
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              You own your data. We store it securely and use it to provide the service. 
              You can export or delete your data at any time.
            </p>
            <p className="text-foreground leading-relaxed">
              See our <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a> for details.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Household accounts
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              Households are shared spaces. All members can view and update inventory. 
              Admins can invite/remove members and delete the household.
            </p>
            <p className="text-foreground leading-relaxed">
              Be respectful. sNAKr is designed to be household-safe (no blame features), 
              but you&apos;re responsible for how you use it with your household.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Receipt processing
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              We use OCR to parse receipts. Accuracy varies by receipt quality and store format. 
              You&apos;re responsible for reviewing and confirming parsed items before applying to inventory.
            </p>
            <p className="text-foreground leading-relaxed">
              Receipts are stored for 90 days by default. You can delete them manually at any time.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Predictions and recommendations
            </h2>
            <p className="text-foreground leading-relaxed">
              sNAKr provides restock predictions based on usage patterns. These are suggestions, 
              not guarantees. You&apos;re responsible for your own shopping decisions.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Nimbly integration (future)
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr may integrate with Nimbly for shopping optimization. This is optional. 
              You must explicitly approve any handoff to Nimbly. No automatic purchases.
            </p>
            <p className="text-foreground leading-relaxed">
              sNAKr remains fully functional without Nimbly.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Termination
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              You can delete your account at any time. We may terminate accounts that violate these terms.
            </p>
            <p className="text-foreground leading-relaxed">
              If we terminate your account, we&apos;ll notify you and provide a reasonable opportunity 
              to export your data.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Changes to these terms
            </h2>
            <p className="text-foreground leading-relaxed">
              We may update these terms from time to time. We&apos;ll notify you of significant changes 
              via email or in-app notification. Continued use after changes means you accept the new terms.
            </p>
          </section>

          <section className="mb-32">
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Limitation of liability
            </h2>
            <p className="text-foreground leading-relaxed">
              sNAKr is provided &ldquo;as is&rdquo; without warranties. We&apos;re not liable for any damages 
              arising from use of the service. This includes but is not limited to: data loss, 
              incorrect predictions, or missed restocks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Contact us
            </h2>
            <p className="text-foreground leading-relaxed">
              Questions about these terms? Email us at{' '}
              <a href="mailto:legal@snakr.app" className="text-primary hover:text-primary/80">
                legal@snakr.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
