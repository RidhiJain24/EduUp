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
  Sparkles,
  Star,
  Rocket,
  LogOut,
  Settings,
  User as UserIcon,
  Zap,
  LineChart,
  MessageSquare,
  Gamepad2,
  Brain,
  Puzzle,
  Calculator,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduUp" },
      { name: "description", content: "Your EduUp learning dashboard — start your learning journey with courses, badges and AI feedback." },
      { property: "og:title", content: "Dashboard — EduUp" },
      { property: "og:description", content: "Your EduUp learning dashboard — start your learning journey with courses, badges and AI feedback." },
    ],
  }),
  component: Dashboard,
});

const STUDENT_NAME = "Alex";

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
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{today}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Welcome to EduUp, {STUDENT_NAME}! 🎉
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Let's start your learning journey today.
        </p>
      </div>
      <Button className="rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5">
        <Rocket className="mr-2 h-4 w-4" /> Explore courses
      </Button>
    </section>
  );
}

const stats = [
  { label: "Current streak", value: "0 days", icon: Flame },
  { label: "Courses in progress", value: "0", icon: BookOpen },
  { label: "Pending review", value: "0", icon: ClipboardCheck },
  { label: "Badges earned", value: "0", icon: Award },
];

function QuickStats() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 transition-transform hover:-translate-y-0.5"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
            <s.icon className="h-5 w-5" />
          </div>
          <p className="mt-5 text-2xl font-bold text-muted-foreground">{s.value}</p>
          <p className="text-sm text-muted-foreground/80">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

const recommended = [
  { title: "Intro to Machine Learning", category: "Computer Science", level: "Beginner", gradient: "from-primary to-blue-500", emoji: "🤖" },
  { title: "Calculus II — Integrals", category: "Mathematics", level: "Intermediate", gradient: "from-accent to-orange-500", emoji: "📐" },
  { title: "Modern World History", category: "Humanities", level: "Beginner", gradient: "from-emerald-500 to-teal-500", emoji: "🌍" },
  { title: "Creative Writing 101", category: "Language Arts", level: "Beginner", gradient: "from-pink-500 to-rose-500", emoji: "✍️" },
];

function GetStarted() {
  return (
    <section id="courses">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Get started</h2>
          <p className="mt-1 text-sm text-muted-foreground">Popular courses picked for new learners.</p>
        </div>
        <a href="#" className="text-sm font-semibold text-primary hover:underline">Browse all</a>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:overflow-visible lg:px-0">
        {recommended.map((c) => (
          <div
            key={c.title}
            className="w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1 lg:w-auto"
          >
            <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${c.gradient} text-5xl`}>
              {c.emoji}
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.category}</p>
              <h3 className="mt-1.5 font-display text-lg font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {c.level}
              </p>
              <Button className="mt-5 h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Enroll
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TakeABreakDialog() {
  const games = [
    { name: "Word Scramble", desc: "Unscramble letters to form real words against the clock.", icon: Puzzle, tint: "from-primary to-blue-500" },
    { name: "Quick Math Quiz", desc: "Sharpen your mental math with 60 seconds of quick sums.", icon: Calculator, tint: "from-accent to-orange-500" },
    { name: "Memory Match", desc: "Flip cards and match pairs to boost focus and memory.", icon: Brain, tint: "from-emerald-500 to-teal-500" },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent/15 px-4 py-2.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent/25">
          <Gamepad2 className="h-4 w-4 text-accent" />
          Feeling tired? Play a quick game 🎮
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl border-border p-6 sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-2xl font-bold">Take a break</DialogTitle>
          <DialogDescription className="text-sm">
            Recharge with a quick brain game. Pick one below.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {games.map((g) => (
            <div key={g.name} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.tint} text-white shadow-soft`}>
                <g.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{g.name}</h3>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{g.desc}</p>
              <Button className="mt-4 h-9 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
                <Play className="mr-1.5 h-3.5 w-3.5" /> Play
              </Button>
            </div>
          ))}
        </div>
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Study timer</h3>
          <p className="text-xs text-muted-foreground">Pomodoro · 25 min</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      <div className="my-5 flex flex-col items-center">
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

      <TakeABreakDialog />
    </div>
  );
}

function BadgesEmpty() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Badges & achievements</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your first goal is within reach.</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-soft sm:flex-row sm:text-left">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary to-blue-500 text-white shadow-soft">
          <Star className="h-9 w-9" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Upcoming goal</p>
          <h3 className="mt-1 font-display text-lg font-bold text-foreground">First Steps</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Earn your first badge by completing your first lesson!
          </p>
        </div>
        <Button className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
          Start a lesson
        </Button>
      </div>
    </section>
  );
}

function ProgressEmpty() {
  return (
    <section id="progress" className="rounded-2xl border border-border bg-card p-8 shadow-soft">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Weekly activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track your minutes studied over time.</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LineChart className="h-8 w-8" />
        </div>
        <p className="max-w-md text-sm font-medium text-muted-foreground">
          Your activity will show up here once you start studying.
        </p>
      </div>
    </section>
  );
}

function FeedbackEmpty() {
  return (
    <section id="assignments">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Recent AI feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">Instant feedback on every submission.</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
          <MessageSquare className="h-8 w-8" />
        </div>
        <p className="max-w-md text-sm font-medium text-muted-foreground">
          Submit your first assignment to get instant AI feedback here.
        </p>
        <Button variant="outline" className="rounded-full">
          Find an assignment
        </Button>
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
        <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-14">
          <WelcomeHeader />
          <QuickStats />

          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
            <div className="space-y-16 sm:space-y-20">
              <GetStarted />
              <ProgressEmpty />
            </div>
            <div className="space-y-6">
              <StudyTimer />
            </div>
          </div>

          <BadgesEmpty />
          <FeedbackEmpty />
        </main>
      </div>
    </div>
  );
}
