import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Puzzle,
  Brain,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FastForward,
  Clock,
  Trophy,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type BreakGameType = "scramble" | "quiz" | "memory";

// ==========================================
// LOCAL STORAGE BEST SCORES
// ==========================================

const SCRAMBLE_BEST_KEY = "eduup_game_scramble_best";
const QUIZ_BEST_KEY = "eduup_game_quiz_best";
const MEMORY_BEST_KEY = "eduup_game_memory_best";

export interface GameBestScores {
  scramble: number | null; // Correct words out of 10
  quiz: number | null;     // Correct questions in 60s
  memory: number | null;   // Fewest moves to match 8 pairs
}

export function getBestScores(): GameBestScores {
  if (typeof window === "undefined") {
    return { scramble: null, quiz: null, memory: null };
  }
  try {
    const s = localStorage.getItem(SCRAMBLE_BEST_KEY);
    const q = localStorage.getItem(QUIZ_BEST_KEY);
    const m = localStorage.getItem(MEMORY_BEST_KEY);
    return {
      scramble: s !== null ? parseInt(s, 10) : null,
      quiz: q !== null ? parseInt(q, 10) : null,
      memory: m !== null ? parseInt(m, 10) : null,
    };
  } catch {
    return { scramble: null, quiz: null, memory: null };
  }
}

export function saveBestScore(game: BreakGameType, score: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (game === "scramble") {
      const current = localStorage.getItem(SCRAMBLE_BEST_KEY);
      const currVal = current !== null ? parseInt(current, 10) : -1;
      if (score > currVal) {
        localStorage.setItem(SCRAMBLE_BEST_KEY, String(score));
        return true;
      }
    } else if (game === "quiz") {
      const current = localStorage.getItem(QUIZ_BEST_KEY);
      const currVal = current !== null ? parseInt(current, 10) : -1;
      if (score > currVal) {
        localStorage.setItem(QUIZ_BEST_KEY, String(score));
        return true;
      }
    } else if (game === "memory") {
      const current = localStorage.getItem(MEMORY_BEST_KEY);
      const currVal = current !== null ? parseInt(current, 10) : 999999;
      // For memory match, fewer moves is better
      if (score < currVal) {
        localStorage.setItem(MEMORY_BEST_KEY, String(score));
        return true;
      }
    }
  } catch {
    /* ignore storage errors */
  }
  return false;
}

// ==========================================
// 1. WORD SCRAMBLE GAME
// ==========================================

const SCRAMBLE_WORDS_POOL = [
  "RECURSION",
  "ALGORITHM",
  "POINTER",
  "DATABASE",
  "COMPILER",
  "BINARY",
  "NETWORK",
  "PROTOCOL",
  "STACK",
  "QUEUE",
  "SORTING",
  "HASHING",
  "KERNEL",
  "THREAD",
  "BOOLEAN",
  "VARIABLE",
  "FUNCTION",
  "INTERFACE",
  "POLYMORPHISM",
  "INHERITANCE",
  "DEADLOCK",
  "ENCRYPTION",
  "BANDWIDTH",
  "FIREWALL",
  "CACHE",
];

function shuffleString(str: string): string {
  const letters = str.split("");
  if (letters.length <= 1) return str;
  let scrambled = str;
  let attempts = 0;
  while (scrambled === str && attempts < 25) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join("");
    attempts++;
  }
  if (scrambled === str && str.length > 1) {
    const arr = str.split("");
    const temp = arr[0];
    arr[0] = arr[arr.length - 1];
    arr[arr.length - 1] = temp;
    scrambled = arr.join("");
  }
  return scrambled;
}

function getRandomWords(count: number = 10): string[] {
  const shuffled = [...SCRAMBLE_WORDS_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function WordScrambleGame({ onScoreUpdated }: { onScoreUpdated?: () => void }) {
  const [wordList, setWordList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "skipped" | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const currentWord = wordList[currentIndex] || "";

  const initGame = useCallback(() => {
    const list = getRandomWords(10);
    setWordList(list);
    setCurrentIndex(0);
    setScrambled(shuffleString(list[0] || ""));
    setUserInput("");
    setScore(0);
    setShowHint(false);
    setIsFinished(false);
    setFeedback(null);
    setIsNewBest(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const advanceWord = useCallback(
    (newScore: number) => {
      if (currentIndex + 1 >= wordList.length) {
        setIsFinished(true);
        const achievedNewBest = saveBestScore("scramble", newScore);
        setIsNewBest(achievedNewBest);
        onScoreUpdated?.();
      } else {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setScrambled(shuffleString(wordList[nextIdx]));
        setUserInput("");
        setShowHint(false);
        setFeedback(null);
      }
    },
    [currentIndex, wordList, onScoreUpdated]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || feedback !== null || isFinished) return;

    if (userInput.trim().toUpperCase() === currentWord.toUpperCase()) {
      setFeedback("correct");
      const nextScore = score + 1;
      setScore(nextScore);
      setTimeout(() => {
        advanceWord(nextScore);
      }, 700);
    } else {
      // Shake or momentary wrong indication
      setUserInput("");
    }
  };

  const handleSkip = () => {
    if (feedback !== null || isFinished) return;
    setFeedback("skipped");
    setTimeout(() => {
      advanceWord(score);
    }, 850);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  if (isFinished) {
    const bestScores = getBestScores();
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/20 text-accent shadow-soft">
          <Trophy className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
          Word Scramble Finished! 🎉
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You solved <span className="font-bold text-foreground">{score}</span> out of 10 words.
        </p>

        {isNewBest ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> New Personal Best!
          </div>
        ) : (
          bestScores.scramble !== null && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Personal Best: {bestScores.scramble} / 10
            </p>
          )
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={initGame}
            className="rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Header Row: progress & score */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            Word {currentIndex + 1} of 10
          </Badge>
          {showHint && (
            <Badge variant="secondary" className="rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Starts with "{currentWord[0]}"
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Trophy className="h-4 w-4 text-accent" />
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={((currentIndex + 1) / 10) * 100} className="h-1.5" />

      {/* Scrambled Word Display */}
      <div className="flex flex-col items-center justify-center py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Unscramble this CS term:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {scrambled.split("").map((letter, idx) => (
            <span
              key={`${currentIndex}-${idx}`}
              className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl border border-primary/25 bg-primary/10 font-display text-lg sm:text-xl font-extrabold text-primary shadow-xs transition-transform hover:scale-105"
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback === "correct" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" /> Correct! Next word coming up...
        </div>
      )}
      {feedback === "skipped" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm font-semibold text-amber-700 dark:text-amber-400 animate-in fade-in">
          <FastForward className="h-4 w-4" /> Skipped! The word was: <span className="font-bold">{currentWord}</span>
        </div>
      )}

      {/* Input & Action Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            autoFocus
            disabled={feedback !== null}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            placeholder="Type your answer..."
            className="h-12 rounded-xl text-center text-base sm:text-lg font-bold tracking-wider uppercase border-border/80 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={!userInput.trim() || feedback !== null}
            className="h-12 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-xs hover:-translate-y-0.5 transition-transform"
          >
            Submit
          </Button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleHint}
            disabled={showHint || feedback !== null}
            className="rounded-full text-xs border-border/70 text-muted-foreground hover:text-foreground"
          >
            <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            {showHint ? `Starts with "${currentWord[0]}"` : "Hint"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={feedback !== null}
            className="rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            <FastForward className="mr-1.5 h-3.5 w-3.5" /> Skip word
          </Button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 2. QUICK QUIZ GAME (60-Second Trivia)
// ==========================================

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const QUIZ_QUESTIONS_POOL: QuizQuestion[] = [
  {
    question: "Which data structure uses the LIFO (Last In, First Out) principle?",
    options: ["Stack", "Queue", "Array", "Binary Tree"],
    correctIndex: 0,
  },
  {
    question: "What is the average time complexity of binary search on a sorted array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctIndex: 1,
  },
  {
    question: "Which standard port is used for HTTPS encrypted web traffic?",
    options: ["80", "443", "8080", "22"],
    correctIndex: 1,
  },
  {
    question: "In JavaScript, what does `typeof NaN` evaluate to?",
    options: ["'nan'", "'undefined'", "'number'", "'object'"],
    correctIndex: 2,
  },
  {
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Performance Unit",
      "Control Power Unit",
    ],
    correctIndex: 0,
  },
  {
    question: "Which of the following is NOT one of the 4 pillars of OOP?",
    options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"],
    correctIndex: 2,
  },
  {
    question: "What is the worst-case time complexity of standard QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(2ⁿ)"],
    correctIndex: 2,
  },
  {
    question: "In SQL, which command completely removes a table and its structure?",
    options: ["DELETE", "DROP TABLE", "REMOVE", "TRUNCATE"],
    correctIndex: 1,
  },
  {
    question: "On which OSI model layer does the Internet Protocol (IP) operate?",
    options: ["Data Link Layer", "Network Layer", "Transport Layer", "Application Layer"],
    correctIndex: 1,
  },
  {
    question: "Which data structure is typically used to implement Breadth-First Search (BFS)?",
    options: ["Queue", "Stack", "Priority Queue", "Linked List"],
    correctIndex: 0,
  },
  {
    question: "What is the base of the hexadecimal number system?",
    options: ["8", "10", "16", "32"],
    correctIndex: 2,
  },
  {
    question: "Which type of memory is the fastest to access in a computer architecture?",
    options: ["RAM", "CPU Registers", "L3 Cache", "NVMe SSD"],
    correctIndex: 1,
  },
  {
    question: "What does DNS stand for in computer networking?",
    options: [
      "Domain Name System",
      "Digital Network Service",
      "Data Node Server",
      "Direct Network Storage",
    ],
    correctIndex: 0,
  },
  {
    question: "Which algorithm finds the shortest path in a graph with non-negative edge weights?",
    options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Prim's Algorithm", "Floyd-Warshall"],
    correctIndex: 1,
  },
  {
    question: "In boolean logic, what is the value of `!(true && false)`?",
    options: ["true", "false", "undefined", "null"],
    correctIndex: 0,
  },
  {
    question: "In Git, which command creates a new branch and checks it out immediately?",
    options: ["git branch -c", "git checkout -b", "git switch -m", "git new"],
    correctIndex: 1,
  },
  {
    question: "What is the average time complexity to look up a key in a Hash Map?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctIndex: 0,
  },
  {
    question: "What does CSS stand for in web engineering?",
    options: [
      "Cascading Style Sheets",
      "Creative Style Software",
      "Computer Style System",
      "Colorful Sheet Syntax",
    ],
    correctIndex: 0,
  },
  {
    question: "Which sorting algorithm is guaranteed stable with O(n log n) worst-case time?",
    options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"],
    correctIndex: 1,
  },
  {
    question: "In Python, which keyword creates an anonymous one-line function?",
    options: ["def", "lambda", "func", "inline"],
    correctIndex: 1,
  },
  {
    question: "What is the HTTP response code for 'Internal Server Error'?",
    options: ["400", "404", "500", "503"],
    correctIndex: 2,
  },
  {
    question: "In networking, what does TCP guarantee that UDP does not?",
    options: [
      "Reliable, in-order packet delivery",
      "Faster transmission speed",
      "Lower packet overhead",
      "Broadcast streaming",
    ],
    correctIndex: 0,
  },
];

function QuickQuizGame({ onScoreUpdated }: { onScoreUpdated?: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    const shuffled = [...QUIZ_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSecondsLeft(60);
    setSelectedOption(null);
    setIsFinished(false);
    setIsNewBest(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 60-Second Countdown Timer
  useEffect(() => {
    if (isFinished) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished]);

  // When timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && !isFinished) {
      setIsFinished(true);
      const achievedNewBest = saveBestScore("quiz", score);
      setIsNewBest(achievedNewBest);
      onScoreUpdated?.();
    }
  }, [secondsLeft, isFinished, score, onScoreUpdated]);

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || isFinished) return;

    setSelectedOption(index);
    const q = questions[currentIndex];
    const isCorrect = index === q.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(nextScore);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length && secondsLeft > 0) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
        const achievedNewBest = saveBestScore("quiz", nextScore);
        setIsNewBest(achievedNewBest);
        onScoreUpdated?.();
      }
    }, 650);
  };

  const currentQ = questions[currentIndex];

  if (isFinished) {
    const bestScores = getBestScores();
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/20 text-accent shadow-soft">
          <Clock className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
          Time's Up! ⏱️
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You answered <span className="font-bold text-foreground">{score}</span> questions correctly in 60s.
        </p>

        {isNewBest ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> New Personal Best!
          </div>
        ) : (
          bestScores.quiz !== null && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Personal Best: {bestScores.quiz} pts
            </p>
          )
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={initGame}
            className="rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const timerColor =
    secondsLeft <= 15
      ? "text-destructive font-extrabold animate-pulse"
      : secondsLeft <= 30
      ? "text-accent font-bold"
      : "text-foreground font-semibold";

  return (
    <div className="space-y-6 py-2">
      {/* Header Row: Timer & Score */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <span className={`text-sm tabular-nums ${timerColor}`}>
            0:{String(secondsLeft).padStart(2, "0")} remaining
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Trophy className="h-4 w-4 text-accent" />
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Progress line representing remaining 60s */}
      <Progress
        value={(secondsLeft / 60) * 100}
        className={`h-1.5 ${secondsLeft <= 15 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
      />

      {/* Question Card */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
        <div className="mb-2">
          <Badge variant="outline" className="rounded-full text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border-border/80">
            Question #{currentIndex + 1}
          </Badge>
        </div>
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* 4 Multiple-Choice Options */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;
          const showState = selectedOption !== null;

          let btnClass = "border-border/80 bg-card hover:bg-muted/60 text-foreground";
          if (showState) {
            if (isCorrect) {
              btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs";
            } else if (isSelected) {
              btnClass = "border-destructive bg-destructive/15 text-destructive font-bold";
            } else {
              btnClass = "border-border/40 opacity-50";
            }
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={selectedOption !== null}
              onClick={() => handleSelectOption(idx)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${btnClass} ${
                selectedOption === null ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"
              }`}
            >
              <span>{opt}</span>
              {showState && isCorrect && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              {showState && isSelected && !isCorrect && (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. MEMORY MATCH GAME (4x4 Grid - 8 Pairs)
// ==========================================

interface MemoryCard {
  id: number;
  pairId: number;
  content: string;
  isTerm: boolean;
}

const MEMORY_PAIRS = [
  { term: "Stack", def: "LIFO structure" },
  { term: "Queue", def: "FIFO structure" },
  { term: "Binary Search", def: "O(log n) lookup" },
  { term: "Recursion", def: "Function calling itself" },
  { term: "Array", def: "Contiguous memory" },
  { term: "Hash Map", def: "Key-value in O(1)" },
  { term: "Graph", def: "Nodes & edges" },
  { term: "Heap", def: "Priority tree" },
];

function MemoryMatchGame({ onScoreUpdated }: { onScoreUpdated?: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const lockRef = useRef(false);

  const initGame = useCallback(() => {
    const deck: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((pair, pairId) => {
      deck.push({
        id: pairId * 2,
        pairId,
        content: pair.term,
        isTerm: true,
      });
      deck.push({
        id: pairId * 2 + 1,
        pairId,
        content: pair.def,
        isTerm: false,
      });
    });

    // Shuffle the 16 cards
    deck.sort(() => 0.5 - Math.random());
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsFinished(false);
    setIsNewBest(false);
    lockRef.current = false;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (index: number) => {
    if (lockRef.current || isFinished) return;
    if (flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedPairIds.includes(card.pairId)) return;

    if (flippedIndices.length === 0) {
      setFlippedIndices([index]);
    } else if (flippedIndices.length === 1) {
      const firstIdx = flippedIndices[0];
      const firstCard = cards[firstIdx];
      const newFlipped = [firstIdx, index];
      setFlippedIndices(newFlipped);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check if match
      if (firstCard.pairId === card.pairId) {
        const nextMatched = [...matchedPairIds, card.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === MEMORY_PAIRS.length) {
          setIsFinished(true);
          const achievedNewBest = saveBestScore("memory", nextMoves);
          setIsNewBest(achievedNewBest);
          onScoreUpdated?.();
        }
      } else {
        // Not a match: flip back after brief moment
        lockRef.current = true;
        setTimeout(() => {
          setFlippedIndices([]);
          lockRef.current = false;
        }, 850);
      }
    }
  };

  if (isFinished) {
    const bestScores = getBestScores();
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-soft">
          <Brain className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
          Brilliant Memory! 🧠
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You matched all 8 pairs in <span className="font-bold text-foreground">{moves}</span> moves.
        </p>

        {isNewBest ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> New Personal Best!
          </div>
        ) : (
          bestScores.memory !== null && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Personal Best: {bestScores.memory} moves
            </p>
          )
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={initGame}
            className="rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:-translate-y-0.5"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Header Row: Moves & Matches */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-xs font-semibold border-primary/20 bg-primary/5 text-primary">
            Matches: {matchedPairIds.length} / 8
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <span>Moves: {moves}</span>
        </div>
      </div>

      {/* 4x4 Grid of Cards */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedPairIds.includes(card.pairId);
          const showFace = isFlipped || isMatched;

          let cardStyle =
            "border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-primary/40 text-muted-foreground";
          if (isMatched) {
            cardStyle =
              "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs";
          } else if (isFlipped) {
            cardStyle =
              "border-accent bg-accent/10 text-accent font-bold shadow-soft scale-102";
          }

          return (
            <button
              key={`${card.id}-${idx}`}
              type="button"
              disabled={showFace}
              onClick={() => handleCardClick(idx)}
              className={`h-20 sm:h-24 rounded-xl border p-2 flex flex-col items-center justify-center text-center transition-all duration-200 select-none ${cardStyle} ${
                !showFace ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {showFace ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span
                    className={`leading-tight ${
                      card.isTerm
                        ? "font-display text-xs sm:text-sm font-bold text-foreground"
                        : "text-[11px] sm:text-xs font-medium text-muted-foreground"
                    }`}
                  >
                    {card.content}
                  </span>
                  {isMatched && (
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/60">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MODAL WRAPPER FOR TAKE A BREAK
// ==========================================

export function TakeABreakModal({
  isOpen,
  initialGame = "scramble",
  onClose,
  onScoreUpdated,
}: {
  isOpen: boolean;
  initialGame?: BreakGameType;
  onClose: () => void;
  onScoreUpdated?: () => void;
}) {
  const [activeGame, setActiveGame] = useState<BreakGameType>(initialGame);

  useEffect(() => {
    if (isOpen) {
      setActiveGame(initialGame);
    }
  }, [isOpen, initialGame]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 border-border bg-card shadow-soft">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <span>Mind Refresh Mini-Games</span> 🎮
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Take a 2-minute mindful break to recharge your cognitive focus.
          </DialogDescription>
        </DialogHeader>

        {/* Game Switcher Tabs */}
        <div className="mt-2 flex rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setActiveGame("scramble")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeGame === "scramble"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Word Scramble
          </button>
          <button
            type="button"
            onClick={() => setActiveGame("quiz")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeGame === "quiz"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Quick Quiz
          </button>
          <button
            type="button"
            onClick={() => setActiveGame("memory")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeGame === "memory"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Memory Match
          </button>
        </div>

        {/* Active Game Component */}
        <div className="mt-4">
          {activeGame === "scramble" && (
            <WordScrambleGame onScoreUpdated={onScoreUpdated} />
          )}
          {activeGame === "quiz" && (
            <QuickQuizGame onScoreUpdated={onScoreUpdated} />
          )}
          {activeGame === "memory" && (
            <MemoryMatchGame onScoreUpdated={onScoreUpdated} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// TAKE A BREAK STANDALONE DASHBOARD SECTION
// ==========================================

export function TakeABreakSection({
  onPlayGame,
  bestScores,
}: {
  onPlayGame: (game: BreakGameType) => void;
  bestScores: GameBestScores;
}) {
  const games = [
    {
      key: "scramble" as const,
      name: "Word Scramble",
      desc: "Unscramble letters to identify core CS terms before running out of words.",
      icon: Puzzle,
      tint: "from-primary to-blue-500",
      bestText:
        bestScores.scramble !== null
          ? `Best: ${bestScores.scramble}/10`
          : "Best: --",
    },
    {
      key: "quiz" as const,
      name: "Quick Quiz",
      desc: "Sharpen programming trivia with 60 seconds of rapid-fire questions.",
      icon: Zap,
      tint: "from-accent to-orange-500",
      bestText:
        bestScores.quiz !== null ? `Best: ${bestScores.quiz} pts` : "Best: --",
    },
    {
      key: "memory" as const,
      name: "Memory Match",
      desc: "Flip cards and match CS data structures with their definitions.",
      icon: Brain,
      tint: "from-emerald-500 to-teal-500",
      bestText:
        bestScores.memory !== null
          ? `Best: ${bestScores.memory} moves`
          : "Best: --",
    },
  ];

  return (
    <section id="take-a-break" className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Feeling tired? Refresh your mind 🎮
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick brain games to recharge between study sessions.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {games.map((g) => (
          <div
            key={g.key}
            className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-soft transition-transform hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.tint} text-white shadow-soft`}
                >
                  <g.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {g.bestText}
                </span>
              </div>

              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                {g.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
            </div>

            <Button
              onClick={() => onPlayGame(g.key)}
              className="mt-5 h-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" /> Play
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

