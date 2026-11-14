import React from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft, Calendar, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/config";

interface LegalPageLayoutProps {
  title: string;
  badge?: string;
  lastUpdated: string;
  description?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  badge = "Policy Document",
  lastUpdated,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background flex flex-col">
      {/* Ambient background glows matching EduUp brand */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 px-4 py-3.5 sm:px-6 sm:py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <GraduationCap className="h-5 w-5" />
            </span>
            EduUp
          </Link>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-border/80 text-foreground hover:bg-muted font-semibold gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header */}
        <div className="border-b border-border/60 pb-8 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="h-3.5 w-3.5 text-accent" />
            {badge}
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-accent" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Prose Content */}
        <div className="space-y-8 text-foreground/90 leading-relaxed text-sm sm:text-base">
          {children}
        </div>

        {/* Contact & Help Banner */}
        <div className="mt-14 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Questions or concerns?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We're happy to answer questions or help process data requests.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return to EduUp Home
          </Link>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-8 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} EduUp. Open student-built computer science learning platform.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies & Storage</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
