import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-green-ink bg-green-tint px-3 py-1.5 rounded-pill">
            🇮🇳 Jan Darpan
          </span>
          <h1 className="mt-4 text-3xl font-extrabold font-display">Welcome back</h1>
          <p className="mt-2 text-ink-soft text-sm">
            Sign in to report issues, track your civic points, and follow your area&apos;s progress.
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "shadow-lg border border-line rounded-lg bg-bg-raised",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border border-line rounded-sm hover:bg-line-soft transition font-body",
              formButtonPrimary:
                "bg-saffron hover:opacity-90 rounded-pill font-semibold text-sm normal-case",
              formFieldInput: "rounded-sm border-line focus:border-green",
              footerActionLink: "text-green-ink hover:text-green",
              dividerLine: "bg-line",
              dividerText: "text-ink-faint",
            },
          }}
        />
      </div>
    </section>
  );
}
