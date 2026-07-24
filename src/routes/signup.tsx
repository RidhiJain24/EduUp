import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — EduUp" },
      { name: "description", content: "Create your free EduUp account and start learning with AI-powered feedback." },
      { property: "og:title", content: "Sign up — EduUp" },
      { property: "og:description", content: "Create your free EduUp account and start learning with AI-powered feedback." },
    ],
  }),
  component: SignupPage,
});

function BrandLink() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </span>
      EduUp
    </Link>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.4-4.8 9.4-8.7 0-.6-.06-1-.16-1.5H12z"/>
    </svg>
  );
}

function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
      <header className="relative z-10 px-4 py-6 sm:px-8">
        <BrandLink />
      </header>
      <main className="relative z-10 flex items-center justify-center px-4 pb-16 pt-4 sm:pt-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-glow sm:p-10">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>

            <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" type="text" placeholder="Alex Johnson" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="you@school.edu" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" className="h-11 rounded-xl" />
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox id="terms" className="mt-0.5" />
                <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="font-medium text-primary hover:underline">Terms</a>
                  {" "}&{" "}
                  <a href="#" className="font-medium text-primary hover:underline">Privacy Policy</a>
                </Label>
              </div>
              <Button type="submit" className="h-11 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-glow">
                Sign up
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="h-11 w-full gap-3 rounded-full border-border bg-background text-base font-medium hover:bg-secondary">
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
