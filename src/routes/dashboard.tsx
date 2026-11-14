import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Star,
  Rocket,
  LogOut,
  Settings,
  User as UserIcon,
  Zap,
  LineChart,
  MessageSquare,
  Brain,
  Puzzle,
  Calculator,
  Youtube,
  ArrowRight,
  Newspaper,
  Briefcase,
  Lightbulb,
  Lock,
  Trophy,
  Target,
  Medal,
  Sparkles,
  Sun,
  Moon,
  Calendar,
  CheckCircle2,
  Crown,
  Clock,
  RefreshCw,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  TakeABreakSection,
  TakeABreakModal,
  getBestScores,
  type BreakGameType,
  type GameBestScores,
} from "@/components/dashboard/TakeABreakGames";

interface ProgressBadge {
  badgeKey: string;
  unlockedAt: string;
}

interface RecentFeedbackItem {
  id: string;
  submissionId?: string;
  questionId?: string;
  questionText: string;
  subject: string;
  subtopic: string;
  aiScore: number | null;
  feedback: string;
  submittedAt: string;
}

interface WeeklyActivityItem {
  date: string;
  count: number;
  submissions?: number;
}

interface ProgressSummary {
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  assignmentsAttempted: number;
  averageAiScore: number | null;
  mcqAccuracy: number;
  weeklyActivity: WeeklyActivityItem[];
  recentFeedback: RecentFeedbackItem[];
  badges: ProgressBadge[];
}

function formatTimeAgo(dateInput: string | Date | undefined): string {
  if (!dateInput) return "Recently";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EduUp" },
      { name: "description", content: "Your EduUp learning dashboard — search CS topics, take mindful breaks, and stay on top of tech news." },
      { property: "og:title", content: "Dashboard — EduUp" },
      { property: "og:description", content: "Your EduUp learning dashboard — search CS topics, take mindful breaks, and stay on top of tech news." },
    ],
  }),
  component: Dashboard,
});

import { fetchAPI } from "@/lib/api";

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

function DashboardNav({
  user,
  currentStreak,
}: {
  user: { name: string; email: string };
  currentStreak?: number;
}) {
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

        <div className="ml-auto flex items-center gap-3">
          {/* Navbar streak chip */}
          {currentStreak !== undefined && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                currentStreak > 0
                  ? "border border-accent/40 bg-accent/10 text-accent shadow-xs"
                  : "border border-border/80 bg-muted/60 text-muted-foreground"
              }`}
              title={currentStreak > 0 ? `${currentStreak} day streak` : "Start your streak today"}
            >
              <Flame
                className={`h-4 w-4 ${
                  currentStreak > 0 ? "fill-accent text-accent animate-pulse" : "text-muted-foreground"
                }`}
              />
              <span className="hidden sm:inline">
                {currentStreak > 0 ? `${currentStreak} day streak` : "Start your streak today"}
              </span>
              <span className="sm:hidden font-mono font-bold">
                {currentStreak > 0 ? `${currentStreak}d` : "0d"}
              </span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{user.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><UserIcon className="h-4 w-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 text-destructive focus:text-destructive">
                <button className="w-full" onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}>
                  <LogOut className="h-4 w-4" /> Log out
                </button>
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

function WelcomeHeader({
  user,
  currentStreak = 0,
}: {
  user: { name: string };
  currentStreak?: number;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hasStreak = currentStreak > 0;

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">{today}</p>
          <span className="text-muted-foreground/40">•</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${
              hasStreak ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${hasStreak ? "fill-accent text-accent" : ""}`} />
            {hasStreak ? `${currentStreak} day streak` : "Start your streak today"}
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Welcome to EduUp, {user.name}! 🎉
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          {hasStreak
            ? `You're on a ${currentStreak} day streak — keep the learning momentum going!`
            : "Start your streak today by practicing an assignment or exploring a course."}
        </p>
      </div>
      <Button
        asChild
        className="rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 cursor-pointer"
      >
        <a href="#courses">
          <Rocket className="mr-2 h-4 w-4" /> Explore courses
        </a>
      </Button>
    </section>
  );
}

function QuickStats({
  currentStreak = 0,
  assignmentsAttempted = 0,
  totalSubmissions = 0,
  badgesCount = 0,
}: {
  currentStreak?: number;
  assignmentsAttempted?: number;
  totalSubmissions?: number;
  badgesCount?: number;
}) {
  const stats = [
    {
      label: "Current streak",
      value: `${currentStreak} day${currentStreak === 1 ? "" : "s"}`,
      icon: Flame,
      tint: "bg-accent/15 text-accent",
    },
    {
      label: "Assignments attempted",
      value: String(assignmentsAttempted),
      icon: ClipboardCheck,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Questions solved",
      value: String(totalSubmissions),
      icon: CheckCircle2,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Badges earned",
      value: String(badgesCount),
      icon: Award,
      tint: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tint}`}>
            <s.icon className="h-5 w-5" />
          </div>
          <p className="mt-5 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            {s.value}
          </p>
          <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

const subjects = [
  "DSA",
  "DBMS",
  "System Design",
  "OOP",
  "Operating Systems",
  "Computer Networks",
  "Web Development",
  "Aptitude & Interview Prep",
  "Machine Learning",
  "Computer Architecture",
];

type Playlist = {
  title: string;
  channel: string;
  videos: number;
  thumbGradient: string;
  emoji: string;
};

const subjectData: Record<
  string,
  { subtopics: string[]; playlists?: Record<string, Playlist[]> }
> = {
  DSA: {
    subtopics: ["All", "Arrays", "Strings", "Recursion", "Backtracking", "Linked Lists", "Stacks & Queues", "Binary Trees", "Binary Search Trees", "Heaps", "Hashing", "Graphs", "Sorting Algorithms", "Searching Algorithms", "Dynamic Programming", "Greedy Algorithms", "Tries", "Bit Manipulation", "Sliding Window"],
    playlists: {
      All: [
        { title: "Complete DSA Bootcamp", channel: "Abdul Bari", videos: 82, thumbGradient: "from-primary to-blue-500", emoji: "🧩" },
        { title: "DSA Full Course in C++", channel: "CodeHelp - Love Babbar", videos: 120, thumbGradient: "from-accent to-orange-500", emoji: "💻" },
        { title: "Data Structures Masterclass", channel: "freeCodeCamp", videos: 65, thumbGradient: "from-emerald-500 to-teal-500", emoji: "📚" },
        { title: "DSA for Interviews", channel: "NeetCode", videos: 150, thumbGradient: "from-pink-500 to-rose-500", emoji: "🎯" },
      ],
      Recursion: [
        { title: "Recursion Mastery", channel: "Aditya Verma", videos: 22, thumbGradient: "from-primary to-blue-500", emoji: "🔁" },
        { title: "Recursion + Backtracking", channel: "Striver", videos: 18, thumbGradient: "from-accent to-orange-500", emoji: "🌀" },
        { title: "Recursion Made Simple", channel: "CodeHelp", videos: 15, thumbGradient: "from-emerald-500 to-teal-500", emoji: "🧠" },
      ],
      "Binary Search Trees": [
        { title: "BSTs — Full Course", channel: "Abdul Bari", videos: 18, thumbGradient: "from-primary to-blue-500", emoji: "🌳" },
        { title: "BSTs Explained Visually", channel: "freeCodeCamp", videos: 12, thumbGradient: "from-accent to-orange-500", emoji: "🎥" },
        { title: "Trees & BST Interview Prep", channel: "NeetCode", videos: 24, thumbGradient: "from-emerald-500 to-teal-500", emoji: "💡" },
      ],
      "Linked Lists": [
        { title: "Linked Lists — Deep Dive", channel: "Striver", videos: 20, thumbGradient: "from-primary to-blue-500", emoji: "🔗" },
        { title: "LinkedList Playlist", channel: "CodeHelp", videos: 14, thumbGradient: "from-accent to-orange-500", emoji: "➰" },
        { title: "Linked List Patterns", channel: "NeetCode", videos: 16, thumbGradient: "from-emerald-500 to-teal-500", emoji: "🧵" },
      ],
      Graphs: [
        { title: "Graphs Series", channel: "Striver", videos: 55, thumbGradient: "from-primary to-blue-500", emoji: "🕸️" },
        { title: "Graph Algorithms", channel: "Abdul Bari", videos: 30, thumbGradient: "from-accent to-orange-500", emoji: "🗺️" },
        { title: "Graph Interview Qs", channel: "NeetCode", videos: 40, thumbGradient: "from-emerald-500 to-teal-500", emoji: "🔗" },
      ],
      "Sorting Algorithms": [
        { title: "All Sorting Algorithms", channel: "Abdul Bari", videos: 12, thumbGradient: "from-primary to-blue-500", emoji: "📊" },
        { title: "Sorting Visualized", channel: "freeCodeCamp", videos: 10, thumbGradient: "from-accent to-orange-500", emoji: "🎞️" },
        { title: "Quick, Merge & Heap Sort", channel: "CS Dojo", videos: 8, thumbGradient: "from-emerald-500 to-teal-500", emoji: "⚡" },
      ],
    },
  },
  DBMS: {
    subtopics: ["All", "Normalization", "SQL Queries", "Transactions & Concurrency", "Indexing", "ER Diagrams", "Joins", "Database Design"],
    playlists: {
      All: [
        { title: "Complete DBMS Course", channel: "Gate Smashers", videos: 90, thumbGradient: "from-primary to-blue-500", emoji: "🗄️" },
        { title: "DBMS Full Tutorial", channel: "Knowledge Gate", videos: 75, thumbGradient: "from-accent to-orange-500", emoji: "📂" },
        { title: "Database Systems", channel: "freeCodeCamp", videos: 45, thumbGradient: "from-emerald-500 to-teal-500", emoji: "💾" },
      ],
      Normalization: [
        { title: "Normalization Explained", channel: "Gate Smashers", videos: 8, thumbGradient: "from-primary to-blue-500", emoji: "📐" },
        { title: "1NF to BCNF Deep Dive", channel: "Jenny's Lectures", videos: 10, thumbGradient: "from-accent to-orange-500", emoji: "🧮" },
      ],
      "SQL Queries": [
        { title: "SQL for Beginners", channel: "freeCodeCamp", videos: 30, thumbGradient: "from-primary to-blue-500", emoji: "🧾" },
        { title: "Advanced SQL Queries", channel: "Mosh", videos: 22, thumbGradient: "from-accent to-orange-500", emoji: "🔍" },
        { title: "SQL Interview Questions", channel: "TechTFQ", videos: 40, thumbGradient: "from-emerald-500 to-teal-500", emoji: "💬" },
      ],
      "Transactions & Concurrency": [
        { title: "Transactions & ACID", channel: "Gate Smashers", videos: 12, thumbGradient: "from-primary to-blue-500", emoji: "🔒" },
        { title: "Concurrency Control", channel: "Knowledge Gate", videos: 9, thumbGradient: "from-accent to-orange-500", emoji: "🔀" },
      ],
      Indexing: [
        { title: "Indexing in DBMS", channel: "Gate Smashers", videos: 7, thumbGradient: "from-primary to-blue-500", emoji: "📇" },
        { title: "B-Trees & B+ Trees", channel: "Abdul Bari", videos: 6, thumbGradient: "from-accent to-orange-500", emoji: "🌲" },
      ],
    },
  },
  "System Design": {
    subtopics: ["All", "Load Balancing", "Caching", "Database Sharding", "Microservices", "API Design", "Scalability", "CAP Theorem"],
    playlists: {
      All: [
        { title: "System Design Primer", channel: "Gaurav Sen", videos: 60, thumbGradient: "from-primary to-blue-500", emoji: "🏗️" },
        { title: "System Design Masterclass", channel: "ByteByteGo", videos: 45, thumbGradient: "from-accent to-orange-500", emoji: "⚙️" },
        { title: "HLD & LLD Playlist", channel: "CodeKarle", videos: 38, thumbGradient: "from-emerald-500 to-teal-500", emoji: "🧱" },
      ],
      "Load Balancing": [
        { title: "Load Balancers Explained", channel: "ByteByteGo", videos: 6, thumbGradient: "from-primary to-blue-500", emoji: "⚖️" },
        { title: "L4 vs L7 Load Balancing", channel: "Gaurav Sen", videos: 5, thumbGradient: "from-accent to-orange-500", emoji: "🔁" },
      ],
      Caching: [
        { title: "Caching Strategies", channel: "ByteByteGo", videos: 8, thumbGradient: "from-primary to-blue-500", emoji: "⚡" },
        { title: "Redis & Memcached", channel: "Hussein Nasser", videos: 12, thumbGradient: "from-accent to-orange-500", emoji: "🧊" },
      ],
      "Database Sharding": [
        { title: "Sharding Deep Dive", channel: "Gaurav Sen", videos: 5, thumbGradient: "from-primary to-blue-500", emoji: "🧩" },
        { title: "Partitioning & Sharding", channel: "ByteByteGo", videos: 7, thumbGradient: "from-accent to-orange-500", emoji: "📦" },
      ],
      Microservices: [
        { title: "Microservices Architecture", channel: "Fireship", videos: 10, thumbGradient: "from-primary to-blue-500", emoji: "🧬" },
        { title: "Microservices Patterns", channel: "CodeKarle", videos: 14, thumbGradient: "from-accent to-orange-500", emoji: "🛰️" },
      ],
    },
  },
  OOP: {
    subtopics: ["All", "Classes & Objects", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Design Patterns", "SOLID Principles"],
    playlists: {
      All: [
        { title: "Complete OOP Course", channel: "Telusko", videos: 40, thumbGradient: "from-primary to-blue-500", emoji: "🧱" },
        { title: "OOP in Java", channel: "Kunal Kushwaha", videos: 32, thumbGradient: "from-accent to-orange-500", emoji: "☕" },
        { title: "OOP Concepts Explained", channel: "freeCodeCamp", videos: 25, thumbGradient: "from-emerald-500 to-teal-500", emoji: "🎓" },
      ],
      Encapsulation: [
        { title: "Encapsulation Deep Dive", channel: "Telusko", videos: 5, thumbGradient: "from-primary to-blue-500", emoji: "📦" },
      ],
      Inheritance: [
        { title: "Inheritance Explained", channel: "Kunal Kushwaha", videos: 6, thumbGradient: "from-primary to-blue-500", emoji: "🧬" },
        { title: "Inheritance Types", channel: "Telusko", videos: 4, thumbGradient: "from-accent to-orange-500", emoji: "🌿" },
      ],
      Polymorphism: [
        { title: "Polymorphism in OOP", channel: "Telusko", videos: 5, thumbGradient: "from-primary to-blue-500", emoji: "🎭" },
      ],
      Abstraction: [
        { title: "Abstraction Explained", channel: "Kunal Kushwaha", videos: 4, thumbGradient: "from-primary to-blue-500", emoji: "🌫️" },
      ],
      "SOLID Principles": [
        { title: "SOLID Principles", channel: "ByteByteGo", videos: 6, thumbGradient: "from-primary to-blue-500", emoji: "🧭" },
        { title: "SOLID with Examples", channel: "Fireship", videos: 5, thumbGradient: "from-accent to-orange-500", emoji: "🧱" },
      ],
    },
  },
  "Operating Systems": {
    subtopics: ["All", "Process Management", "Memory Management", "Scheduling Algorithms", "Deadlocks", "File Systems", "Threads & Concurrency", "Virtual Memory"],
    playlists: {
      All: [
        { title: "Complete OS Course", channel: "Gate Smashers", videos: 100, thumbGradient: "from-primary to-blue-500", emoji: "🖥️" },
        { title: "Operating Systems Full Tutorial", channel: "Knowledge Gate", videos: 80, thumbGradient: "from-accent to-orange-500", emoji: "⚙️" },
        { title: "OS Concepts", channel: "Neso Academy", videos: 60, thumbGradient: "from-emerald-500 to-teal-500", emoji: "📘" },
      ],
      "Processes & Threads": [
        { title: "Processes vs Threads", channel: "Gate Smashers", videos: 10, thumbGradient: "from-primary to-blue-500", emoji: "🧵" },
        { title: "Multithreading Explained", channel: "Neso Academy", videos: 8, thumbGradient: "from-accent to-orange-500", emoji: "🪡" },
      ],
      "CPU Scheduling": [
        { title: "CPU Scheduling Algorithms", channel: "Gate Smashers", videos: 12, thumbGradient: "from-primary to-blue-500", emoji: "⏱️" },
      ],
      "Memory Management": [
        { title: "Paging & Segmentation", channel: "Knowledge Gate", videos: 14, thumbGradient: "from-primary to-blue-500", emoji: "🧠" },
        { title: "Virtual Memory", channel: "Neso Academy", videos: 10, thumbGradient: "from-accent to-orange-500", emoji: "💽" },
      ],
      Deadlocks: [
        { title: "Deadlocks in OS", channel: "Gate Smashers", videos: 8, thumbGradient: "from-primary to-blue-500", emoji: "🔐" },
      ],
      "File Systems": [
        { title: "File Systems Explained", channel: "Neso Academy", videos: 9, thumbGradient: "from-primary to-blue-500", emoji: "📁" },
      ],
    },
  },
  "Computer Networks": {
    subtopics: ["All", "OSI Model", "TCP/IP", "Routing", "DNS", "HTTP/HTTPS", "Network Security", "Sockets"],
    playlists: {
      All: [
        { title: "Complete CN Course", channel: "Gate Smashers", videos: 95, thumbGradient: "from-primary to-blue-500", emoji: "🌐" },
        { title: "Networking Fundamentals", channel: "PowerCert", videos: 40, thumbGradient: "from-accent to-orange-500", emoji: "📡" },
      ],
      "OSI Model": [
        { title: "OSI Model Explained", channel: "PowerCert", videos: 7, thumbGradient: "from-primary to-blue-500", emoji: "📶" },
      ],
      "TCP/IP": [
        { title: "TCP/IP Deep Dive", channel: "Hussein Nasser", videos: 12, thumbGradient: "from-primary to-blue-500", emoji: "🔌" },
      ],
      Routing: [
        { title: "Routing Protocols", channel: "Gate Smashers", videos: 10, thumbGradient: "from-primary to-blue-500", emoji: "🛰️" },
      ],
      "DNS & HTTP": [
        { title: "How DNS Works", channel: "ByteByteGo", videos: 6, thumbGradient: "from-primary to-blue-500", emoji: "🌍" },
        { title: "HTTP/HTTPS Explained", channel: "Fireship", videos: 5, thumbGradient: "from-accent to-orange-500", emoji: "🔗" },
      ],
      "Network Security": [
        { title: "Network Security Basics", channel: "Neso Academy", videos: 12, thumbGradient: "from-primary to-blue-500", emoji: "🛡️" },
      ],
    },
  },
  "Web Development": {
    subtopics: ["All", "HTML & CSS", "JavaScript", "React", "Node.js & Express", "REST APIs", "Responsive Design"],
  },
  "Aptitude & Interview Prep": {
    subtopics: ["All", "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "HR Interview Prep", "Technical Interview Prep"],
  },
  "Machine Learning": {
    subtopics: ["All", "Linear Regression", "Classification", "Neural Networks", "Model Evaluation", "Data Preprocessing"],
  },
  "Computer Architecture": {
    subtopics: ["All", "Number Systems", "Logic Gates", "CPU Architecture", "Memory Hierarchy", "Pipelining"],
  },
};

type ApiPlaylist = {
  id?: string;
  playlistId?: string;
  title: string;
  channelName?: string;
  channelTitle?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  url?: string;
  playlistUrl?: string;
};

function SearchTopic() {
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeSubtopic, setActiveSubtopic] = useState<string>("All");
  const [results, setResults] = useState<ApiPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtopicContainerRef = useRef<HTMLDivElement | null>(null);

  const resolveSubject = (raw: string): string | null => {
    const q = raw.trim().toLowerCase();
    if (!q) return null;
    const match = subjects.find(
      (s) => s.toLowerCase() === q || s.toLowerCase().includes(q) || q.includes(s.toLowerCase()),
    );
    return match ?? null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = resolveSubject(query);
    if (subject) {
      setActiveSubject(subject);
      setActiveSubtopic("All");
    }
  };

  const pickSubject = (s: string) => {
    setQuery(s);
    setActiveSubject(s);
    setActiveSubtopic("All");
  };

  const navigate = useNavigate();

  const clearAll = () => {
    setActiveSubject(null);
    setActiveSubtopic("All");
    setQuery("");
    setResults([]);
    setError(null);
  };

  const handleSolveAssignments = (subtopicName: string) => {
    const subject = activeSubject || "DSA";
    const subtopic =
      subtopicName === "All"
        ? (subjectData[subject]?.subtopics?.find((s) => s !== "All") || "Recursion")
        : subtopicName;

    navigate({
      to: "/assignments/$subject/$subtopic",
      params: {
        subject,
        subtopic,
      },
    });
  };

  const currentSubject = activeSubject ? subjectData[activeSubject] : null;

  useEffect(() => {
    if (!activeSubject) return;
    const searchQuery = [activeSubject, activeSubtopic !== "All" ? activeSubtopic : ""]
      .filter(Boolean)
      .join(" ");
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(
      `http://localhost:5000/api/playlists/search?query=${encodeURIComponent(searchQuery)}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        const list: ApiPlaylist[] = Array.isArray(data)
          ? data
          : (data?.playlists ?? data?.results ?? data?.data ?? []);
        setResults(list);
        if (!list.length) setError("Couldn't load playlists right now, try again.");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setResults([]);
        setError("Couldn't load playlists right now, try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeSubject, activeSubtopic]);

  return (
    <section id="courses" className="w-full min-w-0 max-w-full">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Explore a subject</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a subject, drill into sub-topics, and get curated playlists with assignments.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a subject (e.g. DSA, DBMS, System Design)..."
          className="h-14 rounded-full border-border bg-card pl-14 pr-32 text-base shadow-soft"
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Search
        </Button>
      </form>

      <div className="relative mt-5 w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Subjects:
          </span>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => pickSubject(s)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                activeSubject === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>

      {currentSubject && (
        <div className="mt-8 min-w-0 max-w-full">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-foreground">
              <span className="text-primary">{activeSubject}</span>
              {activeSubtopic !== "All" && (
                <span className="text-foreground"> · {activeSubtopic}</span>
              )}
            </h3>
            <button
              onClick={clearAll}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div ref={subtopicContainerRef} className="relative mb-6 w-full min-w-0 max-w-full">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {currentSubject.subtopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveSubtopic(t)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                    activeSubtopic === t
                      ? "border-accent bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
          </div>

          {/* Solve Assignments Banner (Always visible when subject is active) */}
          <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-background p-5 shadow-soft sm:flex-row">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-soft">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  Ready to test yourself?
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {activeSubtopic === "All" ? (
                    <>
                      Select a topic above to unlock practice assignments for{" "}
                      <span className="font-semibold text-foreground">{activeSubject}</span>
                    </>
                  ) : (
                    <>
                      Solve practice questions on{" "}
                      <span className="font-semibold text-foreground">{activeSubtopic}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {activeSubtopic === "All" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    className="h-11 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground hover:-translate-y-0.5 shadow-sm shrink-0 cursor-pointer"
                  >
                    Choose a topic to practice ↓
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lg">
                  <DropdownMenuLabel className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {activeSubject} Topics
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentSubject.subtopics
                    .filter((t) => t !== "All")
                    .map((subtopic) => (
                      <DropdownMenuItem
                        key={subtopic}
                        onClick={() => handleSolveAssignments(subtopic)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium cursor-pointer hover:bg-accent/15"
                      >
                        <span>{subtopic}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                type="button"
                onClick={() => handleSolveAssignments(activeSubtopic)}
                className="h-11 rounded-full bg-accent px-6 text-sm font-bold text-accent-foreground hover:-translate-y-0.5 shadow-sm shrink-0 cursor-pointer"
              >
                📝 Solve Assignments
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                >
                  <div className="h-36 animate-pulse bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
                    <div className="mt-4 h-10 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
              <p className="text-sm font-semibold text-foreground">
                Couldn't load playlists right now, try again.
              </p>
              <Button
                onClick={() => setActiveSubtopic((t) => t)}
                variant="outline"
                className="mt-4 rounded-full border-primary text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
              {results.map((p, idx) => {
                const url =
                  p.playlistUrl ??
                  p.youtubeUrl ??
                  p.url ??
                  (p.playlistId
                    ? `https://www.youtube.com/playlist?list=${p.playlistId}`
                    : p.id
                      ? `https://www.youtube.com/playlist?list=${p.id}`
                      : "#");
                const thumb = p.thumbnail ?? p.thumbnailUrl;
                const channel = p.channelName ?? p.channelTitle ?? "YouTube";
                return (
                  <div
                    key={p.id ?? p.playlistId ?? `${p.title}-${idx}`}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-36 bg-gradient-to-br from-primary to-blue-500">
                      {thumb && (
                        <img
                          src={thumb}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white">
                        <Youtube className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {channel}
                      </p>
                      <h4 className="mt-1.5 font-display text-base font-bold text-foreground line-clamp-2">
                        {p.title}
                      </h4>
                      <div className="mt-4">
                        <Button
                          asChild
                          className="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Play className="mr-1.5 h-3.5 w-3.5" /> Watch Videos
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1108.73, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.2);
    });
    setTimeout(() => ctx.close(), 2200);
  } catch {
    /* audio unavailable */
  }
}

const TIMER_STORAGE_KEY = "eduup_study_timer";

type PresetOption = 15 | 25 | 45 | 60 | "custom";
type WaterBreakOption = 15 | 30 | 45 | 60 | "off";

const ALL_WATER_BREAK_PRESETS = [15, 30, 45, 60] as const;

function adjustWaterBreakForDuration(currentWb: WaterBreakOption, durationMins: number): WaterBreakOption {
  if (currentWb === "off") return "off";
  if (currentWb <= durationMins) return currentWb;

  const valid = ALL_WATER_BREAK_PRESETS.filter((m) => m <= durationMins);
  if (valid.length > 0) {
    return valid[valid.length - 1];
  }
  return "off";
}

interface SavedTimerState {
  durationMinutes: number;
  preset: PresetOption;
  customMinutesStr: string;
  waterBreakInterval: WaterBreakOption;
  secondsLeft: number;
  running: boolean;
  endTimestamp: number | null;
}

function getInitialTimerState(): SavedTimerState {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedTimerState;
      if (typeof parsed.durationMinutes === "number" && parsed.durationMinutes > 0) {
        const wbRaw = parsed.waterBreakInterval ?? 45;
        const wb = adjustWaterBreakForDuration(wbRaw, parsed.durationMinutes);
        if (parsed.running && parsed.endTimestamp) {
          const now = Date.now();
          const remaining = Math.max(0, Math.ceil((parsed.endTimestamp - now) / 1000));
          if (remaining > 0) {
            return {
              ...parsed,
              waterBreakInterval: wb,
              secondsLeft: remaining,
              running: true,
            };
          } else {
            return {
              ...parsed,
              waterBreakInterval: wb,
              secondsLeft: 0,
              running: false,
              endTimestamp: null,
            };
          }
        } else {
          return {
            ...parsed,
            waterBreakInterval: wb,
            running: false,
            endTimestamp: null,
          };
        }
      }
    }
  } catch {
    /* ignore storage errors */
  }

  const defaultDuration = 25;
  const defaultWb = adjustWaterBreakForDuration(45, defaultDuration);

  return {
    durationMinutes: defaultDuration,
    preset: 25,
    customMinutesStr: "25",
    waterBreakInterval: defaultWb,
    secondsLeft: defaultDuration * 60,
    running: false,
    endTimestamp: null,
  };
}

function StudyTimer({ onOpenGame }: { onOpenGame?: () => void }) {
  const [initialState] = useState(getInitialTimerState);
  const [preset, setPreset] = useState<PresetOption>(initialState.preset);
  const [customMinutesStr, setCustomMinutesStr] = useState<string>(initialState.customMinutesStr);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialState.durationMinutes);
  const [waterBreakInterval, setWaterBreakInterval] = useState<WaterBreakOption>(initialState.waterBreakInterval);
  const [seconds, setSeconds] = useState<number>(initialState.secondsLeft);
  const [running, setRunning] = useState<boolean>(initialState.running);
  const [showWaterBreakSelector, setShowWaterBreakSelector] = useState(false);

  const endTimestampRef = useRef<number | null>(initialState.endTimestamp);

  const totalSeconds = durationMinutes * 60;
  const isEditable = !running && seconds === totalSeconds;

  const saveState = (
    mins: number,
    pres: PresetOption,
    custStr: string,
    wbInt: WaterBreakOption,
    secLeft: number,
    isRun: boolean,
    endTs: number | null
  ) => {
    try {
      const data: SavedTimerState = {
        durationMinutes: mins,
        preset: pres,
        customMinutesStr: custStr,
        waterBreakInterval: wbInt,
        secondsLeft: secLeft,
        running: isRun,
        endTimestamp: endTs,
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore storage errors */
    }
  };

  const handleCompletion = useCallback(
    (currentDurationMins: number, wb: WaterBreakOption) => {
      playChime();
      toast("Session complete! Take a break 🎉", {
        description: "Nice focus streak. Stretch, hydrate, and refresh your mind with a quick game.",
        duration: 12000,
        action: {
          label: "Play a quick game 🎮",
          onClick: () => {
            if (onOpenGame) {
              onOpenGame();
            } else {
              const el = document.getElementById("take-a-break");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          },
        },
      });
    },
    [onOpenGame]
  );

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      if (endTimestampRef.current) {
        const remaining = Math.max(0, Math.ceil((endTimestampRef.current - Date.now()) / 1000));
        setSeconds(remaining);
        saveState(durationMinutes, preset, customMinutesStr, waterBreakInterval, remaining, true, endTimestampRef.current);

        if (remaining <= 0) {
          setRunning(false);
          endTimestampRef.current = null;
          saveState(durationMinutes, preset, customMinutesStr, waterBreakInterval, 0, false, null);
          handleCompletion(durationMinutes, waterBreakInterval);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running, durationMinutes, preset, customMinutesStr, waterBreakInterval, handleCompletion]);

  const handleSelectPreset = (p: PresetOption) => {
    if (!isEditable) return;
    setPreset(p);
    let newMins = durationMinutes;
    if (p === "custom") {
      const parsed = Math.max(1, Math.min(240, parseInt(customMinutesStr, 10) || 25));
      newMins = parsed;
    } else {
      newMins = p;
    }
    setDurationMinutes(newMins);
    const newSec = newMins * 60;
    setSeconds(newSec);

    const adjustedWb = adjustWaterBreakForDuration(waterBreakInterval, newMins);
    setWaterBreakInterval(adjustedWb);
    saveState(newMins, p, customMinutesStr, adjustedWb, newSec, false, null);
  };

  const handleCustomInputChange = (val: string) => {
    if (!isEditable) return;
    setCustomMinutesStr(val);
    const parsed = Math.max(1, Math.min(240, parseInt(val, 10) || 1));
    setDurationMinutes(parsed);
    const newSec = parsed * 60;
    setSeconds(newSec);

    const adjustedWb = adjustWaterBreakForDuration(waterBreakInterval, parsed);
    setWaterBreakInterval(adjustedWb);
    saveState(parsed, "custom", val, adjustedWb, newSec, false, null);
  };

  const handleSelectWaterBreak = (wb: WaterBreakOption) => {
    if (!isEditable) return;
    setWaterBreakInterval(wb);
    saveState(durationMinutes, preset, customMinutesStr, wb, seconds, false, null);
  };

  const handleStartPause = () => {
    setShowWaterBreakSelector(false);
    if (running) {
      setRunning(false);
      endTimestampRef.current = null;
      saveState(durationMinutes, preset, customMinutesStr, waterBreakInterval, seconds, false, null);
    } else {
      const secToRun = seconds === 0 ? totalSeconds : seconds;
      const targetTs = Date.now() + secToRun * 1000;
      setSeconds(secToRun);
      setRunning(true);
      endTimestampRef.current = targetTs;
      saveState(durationMinutes, preset, customMinutesStr, waterBreakInterval, secToRun, true, targetTs);
    }
  };

  const handleReset = () => {
    setShowWaterBreakSelector(false);
    setRunning(false);
    endTimestampRef.current = null;
    const resetSec = totalSeconds;
    setSeconds(resetSec);
    saveState(durationMinutes, preset, customMinutesStr, waterBreakInterval, resetSec, false, null);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;

  const validWaterBreakOptions = [
    ...ALL_WATER_BREAK_PRESETS.filter((m) => m <= durationMinutes).map((m) => ({
      label: `${m}m`,
      val: m as WaterBreakOption,
    })),
    { label: "Off", val: "off" as WaterBreakOption },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Study timer</h3>
          <p className="text-xs text-muted-foreground">Study session · {durationMinutes} min</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      {/* Duration presets & custom duration UI */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Session Duration</span>
          {!isEditable && (
            <span className="text-[10px] text-muted-foreground italic">Reset to change settings</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([15, 25, 45, 60] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={!isEditable}
              onClick={() => handleSelectPreset(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                preset === m
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${!isEditable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {m}m
            </button>
          ))}
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => handleSelectPreset("custom")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              preset === "custom"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            } ${!isEditable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Custom
          </button>
        </div>

        {preset === "custom" && (
          <div className="mt-1 flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={240}
              disabled={!isEditable}
              value={customMinutesStr}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              placeholder="Minutes"
              className="h-8 w-24 text-xs"
            />
            <span className="text-xs text-muted-foreground font-medium">minutes</span>
          </div>
        )}
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
          onClick={handleStartPause}
          className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
        >
          {running ? (
            <><Pause className="mr-1.5 h-4 w-4" /> Pause</>
          ) : (
            <><Play className="mr-1.5 h-4 w-4" /> Start</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-11 rounded-full"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Water break reminder interactive element below buttons */}
      <div className="mt-4">
        {!showWaterBreakSelector ? (
          <button
            type="button"
            disabled={!isEditable}
            onClick={() => isEditable && setShowWaterBreakSelector(true)}
            className={`w-full rounded-xl bg-accent/10 px-3.5 py-2.5 text-xs font-medium text-foreground flex items-center justify-between transition-all ${
              isEditable ? "hover:bg-accent/20 cursor-pointer" : "opacity-75 cursor-default"
            }`}
          >
            <span>
              {waterBreakInterval === "off"
                ? "💧 Don't forget to stay hydrated"
                : `💧 Water break every ${waterBreakInterval} min`}
            </span>
            {isEditable && (
              <span className="text-[10px] font-semibold text-primary">Change</span>
            )}
          </button>
        ) : (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-foreground">Water break interval</span>
              <button
                type="button"
                onClick={() => setShowWaterBreakSelector(false)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {validWaterBreakOptions.map((item) => (
                <button
                  key={String(item.val)}
                  type="button"
                  onClick={() => {
                    handleSelectWaterBreak(item.val);
                    setShowWaterBreakSelector(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    waterBreakInterval === item.val
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-background text-foreground hover:bg-muted border border-border/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




const SHIELD_CLIP =
  "polygon(50% 0%, 100% 14%, 100% 58%, 50% 100%, 0% 58%, 0% 14%)";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

interface BadgeItem {
  name: string;
  desc: string;
  icon: any;
  earned: boolean;
  tier: BadgeTier;
  progress?: string;
}

interface BadgeDefinition {
  key: string;
  name: string;
  desc: string;
  icon: any;
  tier: BadgeTier;
  progress?: string;
}

const ALL_BADGES: BadgeDefinition[] = [
  // Bronze Tier
  { key: "first_steps", name: "First Steps", desc: "Submit your first question", icon: Star, tier: "bronze" },
  { key: "streak_starter", name: "Streak Starter", desc: "Study 3 days in a row", icon: Flame, tier: "bronze" },

  // Silver Tier
  { key: "week_warrior", name: "Week Warrior", desc: "Maintain a 7-day study streak", icon: Calendar, tier: "silver" },
  { key: "sharp_shooter", name: "Sharp Shooter", desc: "Score 90%+ on a coding problem", icon: Target, tier: "silver" },
  { key: "marathoner", name: "Marathoner", desc: "Log 10 hours of focus time", icon: Medal, tier: "silver", progress: "Locked" },
  { key: "multi_tasker", name: "Multi-Tasker", desc: "Solve questions in 3 subjects in 1 day", icon: Layers, tier: "silver" },

  // Gold Tier
  { key: "deep_focus", name: "Deep Focus", desc: "Complete a 60-min focus session", icon: Clock, tier: "gold", progress: "Locked" },
  { key: "streak_50", name: "50 Day Streak", desc: "Maintain a 50-day study streak", icon: Zap, tier: "gold" },
  { key: "perfectionist", name: "Perfectionist", desc: "Score 100% on 3 coding questions", icon: CheckCircle2, tier: "gold" },
  { key: "course_champ", name: "Course Champ", desc: "Finish a full course", icon: Trophy, tier: "gold", progress: "Locked" },
  { key: "comeback_kid", name: "Comeback Kid", desc: "Resume after a 5+ day break", icon: RefreshCw, tier: "gold", progress: "Locked" },

  // Platinum / Diamond Tier
  { key: "streak_100", name: "100 Day Streak", desc: "Maintain a 100-day study streak", icon: Crown, tier: "platinum" },
];

const TIER_STYLES: Record<
  BadgeTier,
  {
    rimBg: string;
    innerBg: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  bronze: {
    rimBg: "from-amber-400 via-amber-700 to-amber-950",
    innerBg: "from-amber-600 via-amber-700 to-amber-900",
    glow: "from-amber-500 via-amber-600 to-amber-900",
    badgeBg: "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/20",
    badgeText: "text-amber-800 dark:text-amber-300 font-bold",
    label: "Bronze",
  },
  silver: {
    rimBg: "from-slate-100 via-slate-400 to-slate-800",
    innerBg: "from-slate-200 via-slate-400 to-slate-700",
    glow: "from-slate-300 via-slate-400 to-slate-600",
    badgeBg: "bg-slate-400/10 border-slate-400/30 dark:bg-slate-400/20",
    badgeText: "text-slate-700 dark:text-slate-200 font-bold",
    label: "Silver",
  },
  gold: {
    rimBg: "from-yellow-100 via-yellow-400 to-amber-800",
    innerBg: "from-yellow-200 via-amber-400 to-amber-700",
    glow: "from-yellow-300 via-amber-400 to-yellow-600",
    badgeBg: "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/20",
    badgeText: "text-yellow-800 dark:text-yellow-300 font-bold",
    label: "Gold",
  },
  platinum: {
    rimBg: "from-cyan-100 via-sky-300 via-teal-400 to-indigo-800",
    innerBg: "from-cyan-200 via-sky-400 via-indigo-500 to-purple-700",
    glow: "from-cyan-300 via-sky-400 via-indigo-500 to-purple-600",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 dark:bg-cyan-500/20",
    badgeText: "text-cyan-800 dark:text-cyan-300 font-bold",
    label: "Platinum",
  },
};

function BadgeShield({ badge }: { badge: BadgeItem }) {
  const Icon = badge.earned ? badge.icon : Lock;
  const style = TIER_STYLES[badge.tier];

  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* 3D Shield Container */}
      <div
        className={`relative h-28 w-24 transition-all duration-300 ease-out ${
          badge.earned
            ? "group-hover:-translate-y-2 group-hover:scale-110 drop-shadow-xl"
            : "group-hover:scale-105 drop-shadow-md"
        }`}
      >
        {/* Ambient Glow Aura */}
        {badge.earned && (
          <div
            className={`absolute -inset-2 -z-10 rounded-full bg-gradient-to-br ${style.glow} opacity-35 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
          />
        )}

        {/* 1. Outer Metallic Bevel Rim */}
        <div
          className={`absolute inset-0 ${
            badge.earned ? `bg-gradient-to-br ${style.rimBg}` : "bg-border/80"
          }`}
          style={{ clipPath: SHIELD_CLIP }}
        />

        {/* 2. Inner Metallic Shield Face */}
        <div
          className={`absolute inset-[3px] ${
            badge.earned ? `bg-gradient-to-br ${style.innerBg}` : "bg-muted/90"
          }`}
          style={{ clipPath: SHIELD_CLIP }}
        />

        {/* 3. Embossed 3D Shadow Layer */}
        {badge.earned && (
          <div
            className="absolute inset-[3px] bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none"
            style={{ clipPath: SHIELD_CLIP }}
          />
        )}

        {/* 4. Glossy Specular Highlight / Polish Line */}
        {badge.earned && (
          <>
            <div
              className="absolute inset-[3px] bg-gradient-to-b from-white/45 via-white/5 to-transparent pointer-events-none"
              style={{ clipPath: SHIELD_CLIP }}
            />
            <div
              className="absolute top-1 left-2 h-10 w-16 -rotate-12 rounded-full bg-white/20 blur-[1px] pointer-events-none"
            />
          </>
        )}

        {/* 5. Metallic Light-Sweep Animation on Hover */}
        {badge.earned && (
          <div
            className="absolute inset-[3px] overflow-hidden pointer-events-none"
            style={{ clipPath: SHIELD_CLIP }}
          >
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/85 to-transparent" />
          </div>
        )}

        {/* 6. Icon */}
        <div className="absolute inset-0 grid place-items-center pb-3">
          <Icon
            className={`h-8 w-8 ${
              badge.earned
                ? "text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                : "text-muted-foreground/60"
            }`}
          />
        </div>
      </div>

      {/* Tier Pill */}
      <span
        className={`mt-3 inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
          badge.earned
            ? `${style.badgeBg} ${style.badgeText}`
            : "border-border/60 bg-muted/40 text-muted-foreground/70"
        }`}
      >
        {style.label}
      </span>

      {/* Badge Name & Desc */}
      <p
        className={`mt-1 font-display text-xs font-bold leading-tight ${
          badge.earned ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {badge.name}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground max-w-[130px]">
        {badge.desc}
      </p>
    </div>
  );
}

function BadgesSection({ badges = [] }: { badges?: ProgressBadge[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const earnedKeySet = useMemo(() => {
    return new Set((badges || []).map((b) => b.badgeKey));
  }, [badges]);

  const badgeItems: BadgeItem[] = useMemo(() => {
    return ALL_BADGES.map((b) => {
      const earned = earnedKeySet.has(b.key);
      return {
        name: b.name,
        desc: b.desc,
        icon: b.icon,
        tier: b.tier,
        earned,
        progress: earned ? "Unlocked" : b.progress || "In progress",
      };
    });
  }, [earnedKeySet]);

  const earnedCount = useMemo(() => {
    return badgeItems.filter((b) => b.earned).length;
  }, [badgeItems]);

  // Prioritize unlocked badges first, followed by locked badges
  const sortedBadges = useMemo(() => {
    return [...badgeItems].sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return 0;
    });
  }, [badgeItems]);

  // Show 6 badges (single row on desktop) when collapsed, or all 12 when expanded
  const visibleBadges = isExpanded ? sortedBadges : sortedBadges.slice(0, 6);

  // Find next locked badge dynamically for callout box
  const nextGoal = sortedBadges.find((b) => !b.earned) || sortedBadges[0];
  const NextGoalIcon = nextGoal.icon;
  const nextGoalStyle = TIER_STYLES[nextGoal.tier];

  return (
    <section id="badges">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Badges & achievements 🏆
            </h2>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full transition-colors hover:bg-primary/20"
            >
              {isExpanded ? "Show less" : `Show all (${badgeItems.length})`}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {earnedCount} of {badgeItems.length} unlocked — hover an unlocked badge to see its tier shimmer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-600" /> Bronze</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Silver</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Gold</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Platinum</span>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 sm:grid-cols-3 md:grid-cols-6">
          {visibleBadges.map((b) => (
            <BadgeShield key={b.name} badge={b} />
          ))}
        </div>

        {/* Expand/Collapse Toggle Button at bottom of grid if collapsed */}
        {!isExpanded && badgeItems.length > 6 && (
          <div className="mt-6 flex justify-center border-t border-border/40 pt-4">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 bg-muted/60 px-4 py-2 rounded-full hover:bg-muted transition-colors"
            >
              Show all ({badgeItems.length}) badges ↓
            </button>
          </div>
        )}

        {/* Dynamic Next Goal Box */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/40 p-5 text-center sm:flex-row sm:text-left">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${nextGoalStyle.rimBg} text-white shadow-soft`}
          >
            <NextGoalIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-accent">Next Goal</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${nextGoalStyle.badgeBg} ${nextGoalStyle.badgeText}`}
              >
                {nextGoalStyle.label} Tier
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-foreground mt-0.5">
              {nextGoal.name}
            </h3>
            <p className="text-sm text-muted-foreground">{nextGoal.desc}</p>
            {nextGoal.progress && (
              <p className="mt-1 text-xs font-semibold text-accent">
                Status: {nextGoal.progress}
              </p>
            )}
          </div>
          <Button asChild className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 shadow-xs">
            <a href="#courses">
              Start practicing
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WeeklyActivitySection({
  weeklyActivity = [],
  totalSubmissions = 0,
}: {
  weeklyActivity?: WeeklyActivityItem[];
  totalSubmissions?: number;
}) {
  const isNewLearner = totalSubmissions === 0;

  const weekTotal = useMemo(() => {
    return (weeklyActivity || []).reduce(
      (sum, item) => sum + (item.count || item.submissions || 0),
      0
    );
  }, [weeklyActivity]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...(weeklyActivity || []).map((item) => item.count || item.submissions || 0));
  }, [weeklyActivity]);

  return (
    <section id="progress" className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Weekly activity 📊
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions solved this week
          </p>
        </div>
        {!isNewLearner && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <span>{weekTotal} solved past 7 days</span>
          </div>
        )}
      </div>

      {isNewLearner ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LineChart className="h-8 w-8" />
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground">
            Your activity will show up here once you start solving questions.
          </p>
          <Button asChild className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
            <a href="#courses">
              <Rocket className="mr-1.5 h-4 w-4" /> Start practicing
            </a>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2">
            {(weeklyActivity || []).map((item) => {
              const count = item.count || item.submissions || 0;
              const dateObj = new Date(item.date + "T00:00:00");
              const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
              const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const isToday = new Date().toISOString().slice(0, 10) === item.date;
              const heightPercent = Math.max(12, Math.round((count / maxCount) * 100));

              return (
                <div
                  key={item.date}
                  className="flex flex-col items-center h-full justify-end group"
                >
                  {/* Tooltip / Count on top of bar */}
                  <span
                    className={`mb-2 text-xs font-bold transition-opacity ${
                      count > 0
                        ? "text-foreground"
                        : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {count}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] h-36 flex items-end justify-center rounded-xl bg-muted/40 p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        count > 0
                          ? isToday
                            ? "bg-gradient-to-t from-primary to-accent shadow-md shadow-accent/20"
                            : "bg-primary/85 group-hover:bg-primary shadow-xs"
                          : "bg-muted-foreground/15 border border-dashed border-border/60"
                      }`}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isToday ? "text-accent font-bold" : "text-foreground"
                      }`}
                    >
                      {dayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                      {monthDay}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function RecentFeedbackSection({
  recentFeedback = [],
  totalSubmissions = 0,
}: {
  recentFeedback?: RecentFeedbackItem[];
  totalSubmissions?: number;
}) {
  const hasFeedback = recentFeedback && recentFeedback.length > 0;

  return (
    <section id="assignments">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Recent AI feedback 🤖
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Instant feedback on your coding submissions.
          </p>
        </div>
      </div>

      {!hasFeedback ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
            <MessageSquare className="h-8 w-8" />
          </div>
          <p className="max-w-md text-sm font-medium text-muted-foreground">
            Submit your first coding assignment to get AI feedback here.
          </p>
          <Button asChild variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary/10">
            <a href="#courses">
              Find an assignment
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recentFeedback.map((item) => {
            const score = item.aiScore;
            const scoreBadgeColor =
              score !== null && score >= 90
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : score !== null && score >= 70
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";

            return (
              <div
                key={item.id || item.submissionId || `${item.subject}-${item.subtopic}-${item.submittedAt}`}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {item.subject}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {formatTimeAgo(item.submittedAt)}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-base font-bold text-foreground line-clamp-1">
                    {item.subtopic}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.questionText}
                  </p>

                  {item.feedback && (
                    <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3">
                        "{item.feedback}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">
                    AI Score
                  </span>
                  {score !== null ? (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreBadgeColor}`}
                    >
                      {score}/100
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      Pending review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function QuickStatsSkeleton() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="mt-4 h-7 w-20 rounded bg-muted" />
          <div className="mt-2 h-4 w-28 rounded bg-muted/60" />
        </div>
      ))}
    </section>
  );
}

function ProgressErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 shadow-soft text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            Unable to load progress summary
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            We couldn't connect to the progress tracking service. Your data is safe.
          </p>
        </div>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="rounded-full border-accent/40 text-accent hover:bg-accent/10"
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}

const newsItems = [
  {
    tag: "Internship",
    tagIcon: Briefcase,
    tagTint: "bg-primary/10 text-primary",
    title: "Google Summer of Code 2027 applications open",
    summary: "Students can now apply for GSoC 2027 — over 200 mentoring orgs participating this year.",
  },
  {
    tag: "News",
    tagIcon: Newspaper,
    tagTint: "bg-accent/15 text-accent",
    title: "New JavaScript framework trending on GitHub",
    summary: "A lightweight reactive framework hit 30k stars in a week — here's what makes it different.",
  },
  {
    tag: "Career Tip",
    tagIcon: Lightbulb,
    tagTint: "bg-emerald-500/10 text-emerald-600",
    title: "Top 5 DSA patterns every interview asks",
    summary: "Master sliding window, two pointers, and three more patterns that unlock 80% of problems.",
  },
  {
    tag: "News",
    tagIcon: Newspaper,
    tagTint: "bg-accent/15 text-accent",
    title: "AI copilots reshape entry-level developer roles",
    summary: "How new grads are adapting workflows and what skills recruiters value most in 2027.",
  },
];

function StudyNews() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            What's happening in tech 📰
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Handpicked news, internships, and career tips for CS students.</p>
        </div>
        <a href="#" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">View all</a>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:overflow-visible lg:px-0">
        {newsItems.map((n) => (
          <article
            key={n.title}
            className="flex w-72 shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1 lg:w-auto"
          >
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${n.tagTint}`}>
              <n.tagIcon className="h-3.5 w-3.5" /> {n.tag}
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">{n.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{n.summary}</p>
            <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setProgressLoading(true);
    setProgressError(null);
    try {
      const data = await fetchAPI('/progress/summary');
      setProgress(data);
    } catch (err: any) {
      console.error('Failed to load progress summary:', err);
      setProgressError(err?.message || 'Failed to load progress');
    } finally {
      setProgressLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAPI('/auth/me')
      .then((u) => {
        setUser(u);
        loadProgress();
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate({ to: "/login" });
      })
      .finally(() => setUserLoading(false));
  }, [navigate, loadProgress]);

  if (userLoading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentStreak = progress?.currentStreak ?? 0;
  const assignmentsAttempted = progress?.assignmentsAttempted ?? 0;
  const totalSubmissions = progress?.totalSubmissions ?? 0;
  const badges = progress?.badges ?? [];
  const weeklyActivity = progress?.weeklyActivity ?? [];
  const recentFeedback = progress?.recentFeedback ?? [];

  const [activeBreakGame, setActiveBreakGame] = useState<BreakGameType | null>(null);
  const [bestScores, setBestScores] = useState<GameBestScores>(getBestScores);

  const refreshBestScores = useCallback(() => {
    setBestScores(getBestScores());
  }, []);

  const handleOpenBreakGame = useCallback((game: BreakGameType = "scramble") => {
    setActiveBreakGame(game);
    const el = document.getElementById("take-a-break");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10">
        <DashboardNav user={user} currentStreak={currentStreak} />
        <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-14">
          <WelcomeHeader user={user} currentStreak={currentStreak} />

          {progressError && <ProgressErrorCard onRetry={loadProgress} />}

          {progressLoading && !progress ? (
            <QuickStatsSkeleton />
          ) : (
            <QuickStats
              currentStreak={currentStreak}
              assignmentsAttempted={assignmentsAttempted}
              totalSubmissions={totalSubmissions}
              badgesCount={badges.length}
            />
          )}

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
            <div className="min-w-0 space-y-16 sm:space-y-20">
              <SearchTopic />
            </div>
            <div className="space-y-6">
              <StudyTimer onOpenGame={() => handleOpenBreakGame("scramble")} />
            </div>
          </div>

          <TakeABreakSection
            onPlayGame={(game) => handleOpenBreakGame(game)}
            bestScores={bestScores}
          />

          <TakeABreakModal
            isOpen={activeBreakGame !== null}
            initialGame={activeBreakGame || "scramble"}
            onClose={() => {
              setActiveBreakGame(null);
              refreshBestScores();
            }}
            onScoreUpdated={refreshBestScores}
          />

          {progressLoading && !progress ? (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft animate-pulse">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="mt-2 h-4 w-60 rounded bg-muted/60" />
              <div className="mt-6 h-48 rounded-2xl bg-muted/40" />
            </div>
          ) : (
            <WeeklyActivitySection
              weeklyActivity={weeklyActivity}
              totalSubmissions={totalSubmissions}
            />
          )}

          {progressLoading && !progress ? (
            <div className="grid gap-5 md:grid-cols-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl border border-border bg-card p-5" />
              ))}
            </div>
          ) : (
            <RecentFeedbackSection
              recentFeedback={recentFeedback}
              totalSubmissions={totalSubmissions}
            />
          )}

          <BadgesSection badges={badges} />

          <StudyNews />
        </main>
      </div>
    </div>
  );
}
