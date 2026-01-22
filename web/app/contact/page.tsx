import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-16 py-48">
        <h1 className="text-4xl font-semibold text-foreground mb-24">
          Get in touch
        </h1>
        
        <div className="grid md:grid-cols-2 gap-32">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Support
            </h2>
            <p className="text-foreground leading-relaxed mb-16">
              Need help? Have questions? We&apos;re here for you.
            </p>
            
            <div className="space-y-12">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Email</h3>
                <a 
                  href="mailto:support@snakr.app" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  support@snakr.app
                </a>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-4">Discord</h3>
                <a 
                  href="https://discord.gg/snakr" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join our community
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Contribute
            </h2>
            <p className="text-foreground leading-relaxed mb-16">
              sNAKr is open source. Contributions welcome!
            </p>
            
            <div className="space-y-12">
              <div>
                <h3 className="font-semibold text-foreground mb-4">GitHub</h3>
                <a 
                  href="https://github.com/snakr/snakr" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View repository
                </a>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-4">Issues</h3>
                <a 
                  href="https://github.com/snakr/snakr/issues" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report bugs or request features
                </a>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-4">Contributing</h3>
                <a 
                  href="https://github.com/snakr/snakr/blob/main/CONTRIBUTING.md" 
                  className="text-primary hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read contribution guidelines
                </a>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-48 pt-32 border-t border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-12">
            Legal
          </h2>
          <div className="flex gap-24">
            <Link 
              href="/privacy" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
