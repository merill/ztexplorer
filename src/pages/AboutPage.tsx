import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground">
          Learn more about this site, how it works, and who built it.
        </p>
      </div>

      {/* What is this? */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">What is this?</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Microsoft's{' '}
              <a
                href="https://zerotrust.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Zero Trust Workshop
              </a>{' '}
              is a wealth of knowledge on implementing Zero Trust using the Microsoft
              Security stack. It's designed to be used when running a series of
              workshops with a customer, walking through each pillar of the Zero Trust
              framework.
            </p>
            <p>
              As a side effect of being a workshop tool, the depth of guidance it
              contains isn't always in an easily digestible form for someone who simply
              wants to learn. This site reorganizes that knowledge into an interactive
              knowledge tree that you can explore at your own pace — spanning identity,
              devices, data, network, infrastructure, security operations, and AI.
            </p>
            <p>
              Whether you're a security architect, IT admin, or just curious about how
              Microsoft approaches Zero Trust, this site aims to make the concepts
              approachable and the guidance easy to navigate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How it's built */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">How it's built</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              The site is a React app that pulls its data directly from the upstream
              Zero Trust Workshop sources. No content is manually copied or maintained
              here — everything stays in sync automatically.
            </p>
            <p>
              A daily automated sync runs via GitHub Actions every morning at 6 AM UTC.
              It fetches the latest pillar data from{' '}
              <a
                href="https://zerotrust.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                zerotrust.microsoft.com
              </a>
              , and pulls the workshop documentation (Markdown) from the{' '}
              <a
                href="https://github.com/microsoft/zerotrustassessment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                microsoft/zerotrustassessment
              </a>{' '}
              GitHub repository. When changes are detected upstream, they're committed
              to this site's repository automatically — keeping the content fresh
              without any manual intervention.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Who built this? */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">Who built this?</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              This is a personal project by{' '}
              <a
                href="https://merill.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Merill Fernando
              </a>
              , a Product Manager at Microsoft. To learn more about Merill and his
              other projects, visit{' '}
              <a
                href="https://merill.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                merill.net
                <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground italic">
        This site is not a Microsoft product and is not affiliated with or endorsed by
        Microsoft.
      </p>
    </div>
  );
}
