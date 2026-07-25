import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Search,
  Flame,
  BookOpen,
  ClipboardCheck,
  Award,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Lock,
  Trophy,
  Target,
  Zap,
  Star,
  BadgeCheck,
  Rocket,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduUp" },
      { name: "description", content: "Your EduUp learning dashboard — streaks, courses, badges and AI feedback in one place." },
      { property: "og:title", content: "Dashboard — EduUp" },
      { property: "og:description", content: "Your EduUp learning dashboard — streaks, courses, badges and AI feedback in one place." },
    ],
  }),
  component: Dashboard,
});

const STUDENT_NAME = "Alex";
const STREAK = 7;

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </span>
      EduUp
    </Link>
  );
}

function DashboardNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Courses", href: "#courses" },
    { label: "Assignments", href: "#assignments" },
    { label: "Progress", href: "#progress" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`rounded-full px-4 py-2 text-base font-medium transition-colors ${
                l.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses, assignments…"
              className="h-10 rounded-full border-border bg-muted/60 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-foreground sm:inline-flex">
            <Flame className="h-4 w-4 text-accent" />
            <span className="text-foreground">{STREAK} day streak</span>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                    {STUDENT_NAME[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{STUDENT_NAME}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{STUDENT_NAME} Johnson</span>
                  <span className="text-xs font-normal text-muted-foreground">alex@school.edu</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><UserIcon className="h-4 w-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 text-destructive focus:text-destructive">
                <Link to="/login"><LogOut className="h-4 w-4" /> Log out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col items-end gap-1.5 py-2 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className="h-0.5 w-6 rounded-full bg-foreground" />
            <span className="h-0.5 w-5 rounded-full bg-accent" />
            <span className="h-0.5 w-6 rounded-full bg-muted-foreground" />
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-border bg-card p-3 shadow-soft lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2 text-base font-medium ${
                    l.active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function WelcomeHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{today}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Welcome back, {STUDENT_NAME} 👋
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          You're on a <span className="font-semibold text-accent">{STREAK}-day streak</span> — keep it going!
        </p>
      </div>
      <Button className="rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5">
        <Rocket className="mr-2 h-4 w-4" /> Start today's session
      </Button>
    </section>
  );
}

const stats = [
  { label: "Current streak", value: `${STREAK} days`, icon: Flame, tint: "bg-accent/15 text-accent" },
  { label: "Courses in progress", value: "4", icon: BookOpen, tint: "bg-primary/10 text-primary" },
  { label: "Pending review", value: "2", icon: ClipboardCheck, tint: "bg-blue-500/10 text-blue-600" },
  { label: "Badges earned", value: "12", icon: Award, tint: "bg-emerald-500/10 text-emerald-600" },
];

function QuickStats() {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tint}`}>
            <s.icon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-2xl font-bold text-foreground">{s.value}</p>
          <p className="text-sm text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

const courses = [
  { title: "Intro to Machine Learning", category: "Computer Science", progress: 68, gradient: "from-primary to-blue-500", emoji: "🤖" },
  { title: "Calculus II — Integrals", category: "Mathematics", progress: 42, gradient: "from-accent to-orange-500", emoji: "📐" },
  { title: "Modern World History", category: "Humanities", progress: 85, gradient: "from-emerald-500 to-teal-500", emoji: "🌍" },
];

function ContinueLearning() {
  return (
    <section id="courses">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Continue learning</h2>
          <p className="text-sm text-muted-foreground">Pick up right where you left off.</p>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">View all</a>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {courses.map((c) => (
          <div
            key={c.title}
            className="w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 lg:w-auto"
          >
            <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${c.gradient} text-5xl`}>
              {c.emoji}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.category}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-foreground">{c.title}</h3>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Progress</span>
                  <span className="text-foreground">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
              <Button className="mt-4 h-9 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
                <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudyTimer() {
  const SESSION = 25 * 60;
  const [seconds, setSeconds] = useState(SESSION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = ((SESSION - seconds) / SESSION) * 100;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Study timer</h3>
          <p className="text-xs text-muted-foreground">Pomodoro · 25 min</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="my-6 flex flex-col items-center">
        <div className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-foreground">
          {mm}:{ss}
        </div>
        <div className="mt-4 w-full">
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setRunning((r) => !r)}
          className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
        >
          {running ? <><Pause className="mr-1.5 h-4 w-4" /> Pause</> : <><Play className="mr-1.5 h-4 w-4" /> Start</>}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setRunning(false); setSeconds(SESSION); }}
          className="h-11 rounded-full"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-xs font-medium text-foreground">
        💧 Take a water break every 45 mins.
      </p>
    </div>
  );
}

const badges = [
  { name: "First Steps", icon: Star, earned: true, tint: "from-primary to-blue-500" },
  { name: "Fast Learner", icon: Zap, earned: true, tint: "from-accent to-orange-500" },
  { name: "Week Warrior", icon: Flame, earned: true, tint: "from-red-500 to-orange-500" },
  { name: "Top Scorer", icon: Trophy, earned: true, tint: "from-yellow-500 to-amber-500" },
  { name: "Sharp Mind", icon: Target, earned: false },
  { name: "AI Ace", icon: Sparkles, earned: false },
  { name: "Verified", icon: BadgeCheck, earned: false },
];

function Badges() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Badges & achievements</h2>
          <p className="text-sm text-muted-foreground">4 of 24 earned</p>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">View all</a>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {badges.map((b) => (
            <div key={b.name} className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl ${
                  b.earned
                    ? `bg-gradient-to-br ${b.tint} text-white shadow-soft`
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {b.earned ? <b.icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
              </div>
              <span className={`text-xs font-medium ${b.earned ? "text-foreground" : "text-muted-foreground"}`}>
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const weekly = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 70 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 80 },
  { day: "Sun", value: 100 },
];

function ProgressChart() {
  const max = Math.max(...weekly.map((w) => w.value));
  return (
    <section id="progress" className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Weekly activity</h2>
          <p className="text-sm text-muted-foreground">Minutes studied this week</p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          +18% vs last week
        </span>
      </div>
      <div className="flex h-48 items-end justify-between gap-2 sm:gap-4">
        {weekly.map((w) => {
          const h = (w.value / max) * 100;
          return (
            <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition-all hover:from-accent hover:to-accent/60"
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{w.day}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const feedback = [
  {
    course: "Machine Learning",
    title: "Assignment 4 — Linear Regression",
    score: 92,
    snippet: "Excellent derivation of the cost function. Consider vectorizing the gradient loop for cleaner code.",
    when: "2 hours ago",
  },
  {
    course: "Calculus II",
    title: "Problem set 6 — U-substitution",
    score: 85,
    snippet: "Strong technique overall. Watch the sign in step 3 — a common trap when reversing bounds.",
    when: "Yesterday",
  },
  {
    course: "World History",
    title: "Essay — Industrial Revolution",
    score: 88,
    snippet: "Clear thesis and good sourcing. Expand the counter-argument section in your conclusion.",
    when: "2 days ago",
  },
];

function scoreTint(score: number) {
  if (score >= 90) return "bg-emerald-500/10 text-emerald-600";
  if (score >= 80) return "bg-primary/10 text-primary";
  return "bg-accent/15 text-accent";
}

function RecentFeedback() {
  return (
    <section id="assignments">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Recent AI feedback</h2>
          <p className="text-sm text-muted-foreground">Your latest graded submissions.</p>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">View all</a>
      </div>
      <div className="space-y-3">
        {feedback.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center"
          >
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg font-bold ${scoreTint(f.score)}`}>
              {f.score}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.course}</span>
                <span className="text-xs text-muted-foreground">· {f.when}</span>
              </div>
              <h3 className="mt-0.5 font-display text-base font-bold text-foreground">{f.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-accent" />
                {f.snippet}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View full feedback <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10">
        <DashboardNav />
        <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
          <WelcomeHeader />
          <QuickStats />

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <ContinueLearning />
              <ProgressChart />
            </div>
            <div className="space-y-6">
              <StudyTimer />
            </div>
          </div>

          <Badges />
          <RecentFeedback />
        </main>
      </div>
    </div>
  );
}
