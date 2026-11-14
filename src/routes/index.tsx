import { createFileRoute, Link } from "@tanstack/react-router";
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
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImg from "@/assets/hero-learning.jpg";
import { DEMO_VIDEO_URL } from "@/lib/config";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo() {
  return (
    <a
      href="#top"
      className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </span>
      EduUp
    </a>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: "About", href: "#top" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/90 shadow-xs backdrop-blur-xl"
          : "border-b border-transparent bg-background/80 backdrop-blur-xl"
      } px-4 py-3.5 sm:px-6 sm:py-4`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base lg:text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className="text-base lg:text-lg font-medium text-foreground hover:bg-muted"
          >
            <Link to="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-primary px-6 text-base lg:text-lg font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground md:hidden transition-colors hover:bg-muted cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-border bg-card/98 p-5 shadow-xl backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-xl px-4 py-2.5 text-base font-medium text-card-foreground transition-colors hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-center text-base font-medium text-card-foreground hover:bg-muted"
              >
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button
                asChild
                className="w-full rounded-full bg-primary py-2.5 text-base font-semibold text-primary-foreground shadow-soft"
              >
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ onWatchDemo }: { onWatchDemo: () => void }) {
  return (
    <section id="top" className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 py-12 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-28">
        <div className="animate-fade-in text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-powered learning, built for students
          </div>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-6xl xl:text-7xl">
            Learn faster with <span className="text-primary">AI feedback</span> that actually gets you.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            EduUp turns every assignment into a coaching session. Pick a course, submit your work, and get instant, personalized guidance — plus badges for every milestone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="group w-full sm:w-auto justify-center rounded-full bg-primary px-7 py-6 text-base shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow cursor-pointer"
            >
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={onWatchDemo}
              className="group w-full sm:w-auto justify-center rounded-full border-border bg-background px-7 py-6 text-base transition-colors hover:bg-secondary cursor-pointer"
            >
              <Play className="mr-1.5 h-4 w-4 text-accent fill-accent/20" />
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent shrink-0" /> Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent shrink-0" /> No credit card
            </div>
          </div>
        </div>

        {/* Hero Image & Floating Cards */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
            <img
              src={heroImg}
              alt="Student learning with AI feedback"
              width={1200}
              height={1000}
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Floating badge bottom-left */}
          <div className="absolute bottom-3 left-3 sm:-bottom-5 sm:-left-4 lg:-bottom-6 lg:-left-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-3 sm:p-4 shadow-soft max-w-[calc(100%-1.5rem)] sm:max-w-xs transition-transform hover:scale-105">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-accent/15 text-accent shrink-0">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate">Badge earned!</div>
                <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Algebra streak · 7 days</div>
              </div>
            </div>
          </div>

          {/* Floating badge top-right */}
          <div className="absolute right-3 top-3 sm:-right-3 sm:top-6 lg:-right-4 lg:top-8 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-3 sm:p-4 shadow-soft max-w-[calc(100%-1.5rem)] sm:max-w-xs transition-transform hover:scale-105">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-primary/15 text-primary shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate">AI feedback ready</div>
                <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Essay reviewed in 12s</div>
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
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">Features</div>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">Everything you need to learn well</h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground">A complete toolkit designed around how students actually study — focused, feedback-driven, and rewarding.</p>
      </div>
      <div className="mt-12 sm:mt-16 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg sm:text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">{f.desc}</p>
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
    <section id="how" className="bg-secondary/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">How it works</div>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">Get moving in three steps</h2>
        </div>
        <div className="relative mt-12 sm:mt-16 grid gap-6 sm:gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft transition-transform hover:-translate-y-1">
              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-base sm:text-lg font-extrabold shadow-glow">
                {s.n}
              </div>
              <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">{s.desc}</p>
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
        {stats.map((s) => (
          <div key={s.l} className="text-center p-2">
            <div className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-primary">{s.v}</div>
            <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  { name: "Rohan M.", role: "CS undergrad", quote: "The AI feedback caught bugs in my code logic my TA didn't even mention. My DSA submissions improved fast." },
  { name: "Ananya K.", role: "B.Tech CSE student", quote: "Badges sound silly until you're chasing them. I solved more problems this month than the whole last semester." },
  { name: "Dev P.", role: "Final year CS student", quote: "Finding good DSA playlists used to take forever. Now I just search the topic and start solving." },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">Loved by students</div>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">Real progress, real words</h2>
      </div>
      <div className="mt-12 sm:mt-16 grid gap-5 sm:gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
            <blockquote className="text-base sm:text-lg leading-relaxed text-foreground">"{t.quote}"</blockquote>
            <figcaption className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-primary">
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
    <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-5 py-10 sm:px-12 sm:py-16 md:px-16 md:py-20 text-center shadow-glow">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <h2 className="relative mx-auto max-w-3xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground">
          Start learning smarter today.
        </h2>
        <p className="relative mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-primary-foreground/85">
          Join thousands of students using EduUp to master new skills — free to start, forever.
        </p>
        <div className="relative mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
          <Button
            asChild
            size="lg"
            className="group w-full sm:w-auto justify-center rounded-full bg-accent px-8 py-6 text-base text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto justify-center rounded-full border-white/30 bg-transparent px-8 py-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground cursor-pointer"
          >
            <a href="#faq">Learn more</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Is EduUp really free?", a: "Yes — EduUp is completely free for students. All core features, including AI feedback, progress tracking, and badges, are available at no cost." },
  { q: "How does AI assignment review work?", a: "Submit your assignment and our AI reviews it in seconds, offering human-quality feedback, highlighting mistakes, and suggesting clear next steps to improve." },
  { q: "What subjects/courses are available?", a: "We cover core computer science courses including Data Structures, Algorithms, Operating Systems, Computer Networks, and DBMS." },
  { q: "Do I need to install anything?", a: "No installation required. EduUp runs entirely in your browser on any device — desktop, tablet, or phone." },
  { q: "How do badges and streaks work?", a: "You earn badges for milestones like your first submission, subject mastery, and study streaks. Streaks grow each day you complete at least one focused session." },
  { q: "Is my data safe?", a: "Absolutely. Your assignments and progress data are encrypted in transit and at rest, and we never share personal information with third parties." },
];

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-accent">FAQ</div>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">Questions, answered</h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground">Everything you need to know about learning with EduUp.</p>
      </div>
      <Accordion type="single" collapsible className="mt-10 sm:mt-12 space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem
            key={f.q}
            value={`item-${i}`}
            className="rounded-2xl border border-border bg-card px-4 sm:px-6 shadow-soft"
          >
            <AccordionTrigger className="py-4 sm:py-5 text-left text-base sm:text-lg font-semibold hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 sm:pb-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Footer() {
  const linkGroups = [
    {
      title: "Platform",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how" },
        { label: "Tech News", href: "/news" },
        { label: "Sign Up", href: "/signup" },
      ],
    },
    {
      title: "Resources & Legal",
      links: [
        { label: "About", href: "#top" },
        { label: "FAQ", href: "#faq" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Cookies & Storage", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-secondary/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-8 sm:gap-12">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
              AI-powered learning for the next generation of computer science students. Build skills, get instant feedback, and earn milestone badges on your own schedule.
            </p>
          </div>
          {linkGroups.map((group) => (
            <div key={group.title}>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-foreground">
                {group.title}
              </div>
              <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="text-sm sm:text-base text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm sm:text-base text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 sm:mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:pt-8 sm:flex-row text-center sm:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduUp. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-5 sm:gap-8">
            <Link
              to="/privacy"
              className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              to="/cookies"
              className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed/")) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  const watchMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  }
  return url;
}

function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(DEMO_VIDEO_URL);
  const hasVideo = Boolean(DEMO_VIDEO_URL && DEMO_VIDEO_URL.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product Demo"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {hasVideo ? (
          <div>
            <div className="mb-4 pr-10">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                EduUp in Action 🎬
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Watch how students learn smarter with AI-guided assignments.
              </p>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-border">
              <iframe
                src={embedUrl}
                title="EduUp Demo Video"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pr-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Product Tour
              </div>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                How EduUp works in 3 steps
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                Built around how computer science students actually master concepts and build career confidence.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 sm:gap-4 rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 transition-colors hover:bg-muted/50">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    1. Pick a topic and watch curated playlists
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Choose from core CS subjects like Data Structures, Algorithms, OS, DBMS, and Networks with handpicked YouTube lectures organized by subtopic.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 sm:gap-4 rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 transition-colors hover:bg-muted/50">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-accent/20 text-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    2. Solve assignments and get instant AI feedback
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Tackle MCQs and coding questions. Get instant explanations on incorrect choices and AI code grading with constructive feedback.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 sm:gap-4 rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5 transition-colors hover:bg-muted/50">
                <div className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    3. Track streaks and earn badges
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Build daily study habits with automated streak tracking, unlock collectible achievement badges, and take mindful brain breaks with mini-games.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Free forever · No credit card required
              </span>
              <Button
                asChild
                className="w-full sm:w-auto rounded-full bg-primary px-6 py-5 text-sm font-semibold shadow-soft hover:shadow-glow cursor-pointer"
                onClick={onClose}
              >
                <Link to="/signup">
                  Get started free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden scroll-smooth bg-background">
      <Navbar />
      <Hero onWatchDemo={() => setDemoOpen(true)} />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
}
