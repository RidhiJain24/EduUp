import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { toast } from "sonner";
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

function DashboardNav({ user }: { user: { name: string; email: string } }) {
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

function WelcomeHeader({ user }: { user: { name: string } }) {
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
          Welcome to EduUp, {user.name}! 🎉
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
    subtopics: ["All", "Recursion", "Binary Search Trees", "Linked Lists", "Graphs", "Sorting Algorithms"],
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
    subtopics: ["All", "Normalization", "SQL Queries", "Transactions & Concurrency", "Indexing"],
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
    subtopics: ["All", "Load Balancing", "Caching", "Database Sharding", "Microservices"],
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
    subtopics: ["All", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "SOLID Principles"],
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
    subtopics: ["All", "Processes & Threads", "CPU Scheduling", "Memory Management", "Deadlocks", "File Systems"],
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
    subtopics: ["All", "OSI Model", "TCP/IP", "Routing", "DNS & HTTP", "Network Security"],
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
};

function SearchTopic() {
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeSubtopic, setActiveSubtopic] = useState<string>("All");
  const [results, setResults] = useState<ApiPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const clearAll = () => {
    setActiveSubject(null);
    setActiveSubtopic("All");
    setQuery("");
    setResults([]);
    setError(null);
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
    <section id="courses">
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

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="self-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Subjects:
        </span>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => pickSubject(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 ${
              activeSubject === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {currentSubject && (
        <div className="mt-8">
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

          <div className="mb-6 flex flex-wrap gap-2">
            {currentSubject.subtopics.map((t) => (
              <button
                key={t}
                onClick={() => setActiveSubtopic(t)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  activeSubtopic === t
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                    <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
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
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, idx) => {
                const url = p.youtubeUrl ?? p.url ?? "#";
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
                      <div className="mt-4 flex flex-col gap-2">
                        <Button
                          asChild
                          className="h-10 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Play className="mr-1.5 h-3.5 w-3.5" /> Watch Videos
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 w-full rounded-full border-accent text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          📝 Solve Assignments
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

  useEffect(() => {
    if (seconds !== 0 || !running) return;
    setRunning(false);
    playChime();
    toast("Session complete! Take a break 🎉", {
      description: "Nice focus streak. Stretch, hydrate, then go again.",
      duration: 10000,
      action: {
        label: "New session",
        onClick: () => {
          setSeconds(SESSION);
          setRunning(true);
        },
      },
    });
  }, [seconds, running, SESSION]);

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
          onClick={() => {
            if (seconds === 0) setSeconds(SESSION);
            setRunning((r) => !r);
          }}
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


const breakGames = [
  { name: "Word Scramble", desc: "Unscramble letters to form real words against the clock.", icon: Puzzle, tint: "from-primary to-blue-500" },
  { name: "Quick Math Quiz", desc: "Sharpen your mental math with 60 seconds of quick sums.", icon: Calculator, tint: "from-accent to-orange-500" },
  { name: "Memory Match", desc: "Flip cards and match pairs to boost focus and memory.", icon: Brain, tint: "from-emerald-500 to-teal-500" },
];

function TakeABreak() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Feeling tired? Refresh your mind 🎮
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Quick brain games to recharge between study sessions.</p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {breakGames.map((g) => (
          <div
            key={g.name}
            className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-soft transition-transform hover:-translate-y-1"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.tint} text-white shadow-soft`}>
              <g.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">{g.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.desc}</p>
            <Button className="mt-5 h-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
              <Play className="mr-1.5 h-3.5 w-3.5" /> Play
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

const SHIELD_CLIP =
  "polygon(50% 0%, 100% 14%, 100% 58%, 50% 100%, 0% 58%, 0% 14%)";

const badgeList = [
  { name: "First Steps", desc: "Complete your first lesson", icon: Star, earned: true, tint: "from-primary to-blue-500" },
  { name: "Streak Starter", desc: "Study 3 days in a row", icon: Flame, earned: true, tint: "from-accent to-orange-500" },
  { name: "Sharp Shooter", desc: "Score 90%+ on an assignment", icon: Target, earned: false, tint: "" },
  { name: "Marathoner", desc: "Log 10 hours of focus time", icon: Medal, earned: false, tint: "" },
  { name: "Course Champ", desc: "Finish a full course", icon: Trophy, earned: false, tint: "" },
];

function BadgeShield({ badge }: { badge: (typeof badgeList)[number] }) {
  const Icon = badge.earned ? badge.icon : Lock;
  return (
    <div className="group flex flex-col items-center text-center">
      <div
        className={`relative h-24 w-20 transition-transform duration-300 ease-out ${
          badge.earned
            ? "group-hover:-translate-y-1 group-hover:scale-110 motion-safe:group-hover:animate-scale-in"
            : "group-hover:scale-105"
        }`}
      >
        {/* outer shield frame */}
        <div
          className={`absolute inset-0 ${badge.earned ? "bg-gradient-to-br " + badge.tint : "bg-border"}`}
          style={{ clipPath: SHIELD_CLIP }}
        />
        {/* inner face */}
        <div
          className={`absolute inset-[3px] ${
            badge.earned ? "bg-gradient-to-br " + badge.tint : "bg-muted"
          }`}
          style={{ clipPath: SHIELD_CLIP }}
        />
        {/* shine */}
        {badge.earned && (
          <div
            className="absolute inset-[3px] bg-gradient-to-br from-white/60 via-white/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            style={{ clipPath: SHIELD_CLIP }}
          />
        )}
        {/* glow */}
        {badge.earned && (
          <div
            className={`absolute -inset-1 -z-10 rounded-full bg-gradient-to-br ${badge.tint} opacity-30 blur-lg transition-opacity duration-300 group-hover:opacity-70`}
          />
        )}
        <div className="absolute inset-0 grid place-items-center pb-3">
          <Icon
            className={`h-7 w-7 ${badge.earned ? "text-white drop-shadow" : "text-muted-foreground"}`}
          />
        </div>
      </div>
      <p className={`mt-3 font-display text-sm font-bold ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
        {badge.name}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{badge.desc}</p>
    </div>
  );
}

function BadgesEmpty() {
  const earned = badgeList.filter((b) => b.earned).length;
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Badges & achievements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {earned} of {badgeList.length} unlocked — hover a badge to see it shine.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {badgeList.map((b) => (
            <BadgeShield key={b.name} badge={b} />
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-muted/50 p-5 text-center sm:flex-row sm:text-left">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Next goal</p>
            <h3 className="font-display text-base font-bold text-foreground">Sharp Shooter</h3>
            <p className="text-sm text-muted-foreground">Score 90%+ on an assignment to unlock this shield.</p>
          </div>
          <Button className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5">
            Start a lesson
          </Button>
        </div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        navigate({ to: "/login" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10">
        <DashboardNav user={user} />
        <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:space-y-20 sm:px-6 sm:py-14">
          <WelcomeHeader user={user} />
          <QuickStats />

          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
            <div className="space-y-16 sm:space-y-20">
              <SearchTopic />
            </div>
            <div className="space-y-6">
              <StudyTimer />
            </div>
          </div>

          <TakeABreak />
          <ProgressEmpty />
          <BadgesEmpty />
          <FeedbackEmpty />
          <StudyNews />
        </main>
      </div>
    </div>
  );
}
