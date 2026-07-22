import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  LineChart,
  Award,
  Timer,
  Gamepad2,
  Compass,
  Play,
  ArrowRight,
  GraduationCap,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-learning.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2 font-display font-extrabold text-xl text-foreground">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </span>
      EduUp
    </a>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#how" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
          <Button className="rounded-full bg-primary px-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-glow">
            Sign up
          </Button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-powered learning, built for students
          </div>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Learn faster with <span className="text-primary">AI feedback</span> that actually gets you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            EduUp turns every assignment into a coaching session. Pick a course, submit your work, and get instant, personalized guidance — plus badges for every milestone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="group rounded-full bg-primary px-7 py-6 text-base shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow">
              Get Started Free
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="group rounded-full border-border bg-background px-7 py-6 text-base transition-colors hover:bg-secondary">
              <Play className="mr-1 h-4 w-4 text-accent" />
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Free forever plan</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> No credit card</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
            <img src={heroImg} alt="Student learning with AI feedback" width={1200} height={1000} className="h-auto w-full" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:block">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><Award className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold">Badge earned!</div>
                <div className="text-xs text-muted-foreground">Algebra streak · 7 days</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:block">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Sparkles className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold">AI feedback ready</div>
                <div className="text-xs text-muted-foreground">Essay reviewed in 12s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Sparkles, title: "AI Assignment Review", desc: "Submit any assignment and get instant, human-quality feedback with actionable next steps." },
  { icon: LineChart, title: "Progress Tracking", desc: "Beautiful dashboards show your streaks, mastery, and where to focus next." },
  { icon: Award, title: "Achievement Badges", desc: "Earn collectible badges for milestones — from first submission to subject mastery." },
  { icon: Timer, title: "Study Timer & Breaks", desc: "Built-in Pomodoro-style sessions keep you focused and rested." },
  { icon: Gamepad2, title: "Educational Games", desc: "Reinforce concepts through quick, playful challenges you'll actually want to replay." },
  { icon: Compass, title: "Career Guidance Feed", desc: "A curated feed of internships, scholarships, and career tips tailored to your path." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-sm font-semibold uppercase tracking-widest text-accent">Features</div>
        <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Everything you need to learn well</h2>
        <p className="mt-4 text-lg text-muted-foreground">A complete toolkit designed around how students actually study — focused, feedback-driven, and rewarding.</p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Sign up free", desc: "Create your account in seconds and tell us what you're studying." },
  { n: "02", title: "Pick a course", desc: "Choose from hundreds of courses across subjects and skill levels." },
  { n: "03", title: "Learn & earn", desc: "Submit assignments, get AI feedback, track progress, and collect badges." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-accent">How it works</div>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Get moving in three steps</h2>
        </div>
        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-8 shadow-soft transition-transform hover:-translate-y-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-lg font-extrabold shadow-glow">
                {s.n}
              </div>
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "10,000+", l: "Active students" },
    { v: "500+", l: "Courses available" },
    { v: "1M+", l: "Assignments reviewed" },
    { v: "95%", l: "Satisfaction rate" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-10 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-4xl font-extrabold text-primary sm:text-5xl">{s.v}</div>
            <div className="mt-2 text-sm font-medium text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Amara O.", role: "Biology major", quote: "The AI feedback caught mistakes my professor didn't even mention. My essays leveled up in two weeks." },
  { name: "Kenji T.", role: "High school senior", quote: "Badges sound silly until you're chasing them. I studied more this month than the whole last semester." },
  { name: "Priya S.", role: "CS undergrad", quote: "Progress tracking finally shows me what I actually know vs. what I'm faking. Game-changer." },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-sm font-semibold uppercase tracking-widest text-accent">Loved by students</div>
        <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Real progress, real words</h2>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
            <blockquote className="text-lg leading-relaxed text-foreground">"{t.quote}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-glow sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <h2 className="relative mx-auto max-w-3xl text-4xl font-extrabold text-primary-foreground sm:text-5xl">
          Start learning smarter today.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
          Join thousands of students using EduUp to master new skills — free to start, forever.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="group rounded-full bg-accent px-8 py-6 text-base text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5">
            Get Started Free
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent px-8 py-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            Talk to us
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const linkGroups = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how" },
        { label: "Pricing", href: "#pricing" },
        { label: "Courses", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Community", href: "#" },
        { label: "Study Guides", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
  ];

  const socials = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Github, label: "GitHub", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
  ];

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              AI-powered learning for the next generation of students. Build skills, get feedback, and earn badges on your own schedule.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-soft"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {linkGroups.map((group) => (
            <div key={group.title}>
              <div className="text-sm font-semibold uppercase tracking-widest text-foreground">
                {group.title}
              </div>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduUp. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
