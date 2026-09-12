import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check,
  AlertCircle,
  Code2,
  ListFilter,
  FileText,
  RotateCcw,
  Trophy,
  Send,
  Loader2,
  BookOpen,
  Clock,
  Layers,
  ClipboardCheck,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";

export const Route = createFileRoute("/assignments/$subject/$subtopic")({
  head: () => ({
    meta: [
      { title: "Solve Assignments — EduUp" },
      {
        name: "description",
        content: "Practice topic-based questions with instant AI-powered feedback on EduUp.",
      },
    ],
  }),
  component: SolveAssignmentsPage,
});

interface QuestionSet {
  set: string;
  count: number;
}

interface Question {
  id: string;
  subject: string;
  subtopic: string;
  type: "mcq" | "coding" | "short_answer" | string;
  questionText: string;
  options: string[];
  correctOption?: number | null;
  difficulty: "easy" | "medium" | "hard" | string;
  assignmentSet?: string;
  createdAt?: string;
}

function formatAssignmentTitle(setName: string): string {
  const match = setName.match(/set\s*(\d+)/i);
  if (match) {
    return `Assignment ${match[1]}`;
  }
  return setName.startsWith("Assignment") ? setName : `Assignment (${setName})`;
}

function SolveAssignmentsPage() {
  const { subject: rawSubject, subtopic: rawSubtopic } = Route.useParams();
  const navigate = useNavigate();

  const subject = decodeURIComponent(rawSubject || "DSA");
  const subtopic = decodeURIComponent(rawSubtopic || "Arrays");

  // Assignment Sets state
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [setsLoading, setSetsLoading] = useState(true);
  const [setsError, setSetsError] = useState<string | null>(null);

  // Active Selected Set state
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  // Questions state for the active set
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Question solving state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<
    Record<string, { submissionId: string; submittedAt: string; answerText: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. Fetch available sets when page loads or subject/subtopic changes
  const loadSets = useCallback(() => {
    let isMounted = true;
    setSetsLoading(true);
    setSetsError(null);
    setSelectedSet(null);
    setQuestions([]);
    setIsCompleted(false);

    const params = new URLSearchParams({ subject, subtopic });

    fetchAPI(`/questions/sets?${params.toString()}`)
      .then((data: QuestionSet[]) => {
        if (!isMounted) return;
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from server");
        }

        // Sort sets naturally (e.g. Set 1, Set 2, Set 3, Set 4)
        const sorted = [...data].sort((a, b) => {
          const numA = parseInt(a.set.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.set.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

        setSets(sorted);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading question sets:", err);
        setSetsError(err.message || "Failed to load assignment sets. Please ensure the server is running.");
      })
      .finally(() => {
        if (isMounted) setSetsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [subject, subtopic]);

  useEffect(() => {
    const cleanup = loadSets();
    return cleanup;
  }, [loadSets]);

  // 2. Fetch questions for the selected set
  const handleStartSet = async (setName: string) => {
    setSelectedSet(setName);
    setQuestionsLoading(true);
    setQuestionsError(null);
    setCurrentIndex(0);
    setAnswers({});
    setSubmittedQuestions({});
    setIsCompleted(false);

    try {
      const params = new URLSearchParams({
        subject,
        subtopic,
        assignmentSet: setName,
      });

      const data = await fetchAPI(`/questions?${params.toString()}`);
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from server");
      }
      setQuestions(data);
    } catch (err: any) {
      console.error("Error loading set questions:", err);
      setQuestionsError(err.message || `Failed to load questions for ${setName}. Please try again.`);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // 3. Return from question flow to the set selection screen
  const handleBackToSets = () => {
    setSelectedSet(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSubmittedQuestions({});
    setIsCompleted(false);
    setQuestionsError(null);
  };

  // Active question getters
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const isCurrentSubmitted = currentQuestion ? Boolean(submittedQuestions[currentQuestion.id]) : false;

  const handleSelectOption = (_optionIndex: number, optionText: string) => {
    if (!currentQuestion || isCurrentSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionText,
    }));
  };

  const handleTextChange = (val: string) => {
    if (!currentQuestion || isCurrentSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleSubmitCurrent = async () => {
    if (!currentQuestion) return;
    const answer = (answers[currentQuestion.id] || "").trim();

    if (!answer) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to submit answers and track your progress.",
      });
      navigate({ to: "/login" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetchAPI("/questions/submit", {
        method: "POST",
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer,
        }),
      });

      setSubmittedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          submissionId: res.id,
          submittedAt: res.submittedAt,
          answerText: answer,
        },
      }));

      toast.success("Answer submitted successfully!", {
        description: "AI review and instant scoring will be available soon.",
      });
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      toast.error("Submission failed", {
        description: err.message || "Could not save your submission. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentIndex(0);
  };

  // Progress computation
  const submittedCount = Object.keys(submittedQuestions).length;
  const progressPercent = totalQuestions > 0 ? Math.round((submittedCount / totalQuestions) * 100) : 0;
  const totalQuestionsAcrossSets = sets.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/20 selection:text-accent">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {selectedSet ? (
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all cursor-pointer"
                title="Back to Assignment Sets"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
                title="Return to Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}

            <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </span>
              EduUp
            </Link>

            <span className="text-muted-foreground/50">/</span>

            <div className="flex items-center gap-2 text-sm font-medium">
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                {subject}
              </Badge>
              <span className="font-semibold text-foreground hidden sm:inline">{subtopic}</span>
              {selectedSet && (
                <>
                  <span className="text-muted-foreground/50 hidden sm:inline">/</span>
                  <Badge variant="outline" className="rounded-full bg-accent/10 text-accent border-accent/20 px-2 py-0.5 text-xs font-semibold hidden sm:inline-flex">
                    {formatAssignmentTitle(selectedSet)}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedSet && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSets}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hidden md:inline-flex"
              >
                All Sets
              </Button>
            )}
            <Link
              to="/dashboard"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Exit to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
        {/* =========================================================================
            STATE 1: Loading sets
           ========================================================================= */}
        {setsLoading ? (
          <div className="space-y-6">
            <div className="space-y-2 text-center max-w-md mx-auto animate-pulse">
              <div className="h-8 w-48 rounded-full bg-muted mx-auto" />
              <div className="h-4 w-64 rounded-full bg-muted/60 mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-muted" />
                    <div className="h-5 w-16 rounded-full bg-muted" />
                  </div>
                  <div className="h-6 w-3/4 rounded-xl bg-muted" />
                  <div className="h-4 w-full rounded bg-muted/50" />
                  <div className="h-10 w-full rounded-2xl bg-muted pt-2" />
                </div>
              ))}
            </div>
          </div>
        ) : setsError ? (
          /* =========================================================================
              STATE 2: Error loading sets
             ========================================================================= */
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 sm:p-12 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Unable to load assignment sets</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{setsError}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={loadSets}
                className="rounded-full bg-primary text-primary-foreground"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : sets.length === 0 ? (
          /* =========================================================================
              STATE 3: No sets found
             ========================================================================= */
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-accent/15 text-accent">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">No assignments found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              There are currently no practice assignments available for <span className="font-semibold text-foreground">{subtopic}</span> in {subject}.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-full bg-accent text-accent-foreground font-bold px-6 shadow-sm hover:-translate-y-0.5"
              >
                Explore Other Topics
              </Button>
            </div>
          </div>
        ) : !selectedSet ? (
          /* =========================================================================
              STATE 4: SET SELECTION SCREEN
             ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent">
                <Layers className="h-3.5 w-3.5" />
                <span>Assignment Sets</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {subtopic} Assignments
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Choose a practice set below. Each assignment is structured with focused practice questions, instant answer submission, and upcoming AI grading.
              </p>

              {/* Summary metadata pill row */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <Badge variant="outline" className="rounded-full bg-muted/60 text-muted-foreground border-border px-3 py-1 text-xs font-medium">
                  <Layers className="h-3 w-3 mr-1.5 text-primary" />
                  {sets.length} Available Set{sets.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline" className="rounded-full bg-muted/60 text-muted-foreground border-border px-3 py-1 text-xs font-medium">
                  <BookOpen className="h-3 w-3 mr-1.5 text-accent" />
                  {totalQuestionsAcrossSets} Total Questions
                </Badge>
                <Badge variant="outline" className="rounded-full bg-muted/60 text-muted-foreground border-border px-3 py-1 text-xs font-medium">
                  <Clock className="h-3 w-3 mr-1.5 text-amber-500" />
                  ~{totalQuestionsAcrossSets} Mins Total
                </Badge>
              </div>
            </div>

            {/* Assignment Set Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {sets.map((set, idx) => {
                const title = formatAssignmentTitle(set.set);
                const estimatedMinutes = set.count; // assume ~1 min per question

                return (
                  <div
                    key={set.set}
                    className="group relative rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft hover:shadow-glow hover:border-accent/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent group-hover:scale-105 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-sm">
                          <ClipboardCheck className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full bg-muted/60 text-muted-foreground border-border px-3 py-1 text-xs font-semibold"
                        >
                          {set.set}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                          {title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Curated set of practice questions designed to test your mastery of {subtopic}.
                        </p>
                      </div>

                      {/* Question Count & Estimated Time Meta */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/50 border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span>{set.count} Questions</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/50 border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>~{estimatedMinutes} min{estimatedMinutes === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={() => handleStartSet(set.set)}
                        className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      >
                        <Play className="h-4 w-4 mr-2 fill-current" />
                        <span>Start</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : questionsLoading ? (
          /* =========================================================================
              STATE 5: Loading questions for chosen set
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment sets
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-soft space-y-6 animate-pulse text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="font-display text-lg font-bold text-foreground">
                  Loading {formatAssignmentTitle(selectedSet)}...
                </h4>
                <p className="text-xs text-muted-foreground">Fetching questions for this set from the question bank.</p>
              </div>
            </div>
          </div>
        ) : questionsError ? (
          /* =========================================================================
              STATE 6: Error loading questions for chosen set
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment sets
              </button>
            </div>

            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 sm:p-12 text-center shadow-soft">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Unable to load questions</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{questionsError}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => handleStartSet(selectedSet)}
                  className="rounded-full bg-primary text-primary-foreground"
                >
                  Retry Set
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToSets}
                  className="rounded-full"
                >
                  Back to Assignment Sets
                </Button>
              </div>
            </div>
          </div>
        ) : totalQuestions === 0 ? (
          /* =========================================================================
              STATE 7: 0 questions in chosen set
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment sets
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-soft">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-accent/15 text-accent">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">No questions in this set</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                No questions are currently populated for {formatAssignmentTitle(selectedSet)}.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleBackToSets}
                  className="rounded-full bg-accent text-accent-foreground font-bold px-6 shadow-sm hover:-translate-y-0.5"
                >
                  Back to Assignment Sets
                </Button>
              </div>
            </div>
          </div>
        ) : isCompleted ? (
          /* =========================================================================
              STATE 8: Assignment Set Completion Summary
             ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment sets
              </button>
            </div>

            <div className="rounded-3xl border border-accent/20 bg-gradient-to-b from-card via-card to-accent/5 p-8 sm:p-12 text-center shadow-glow space-y-6">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-accent text-accent-foreground shadow-lg animate-bounce">
                <Trophy className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <Badge className="rounded-full bg-accent/20 text-accent border-accent/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  {formatAssignmentTitle(selectedSet)} Complete
                </Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  You've completed {formatAssignmentTitle(selectedSet)}!
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                  Excellent work! Your answers have been recorded. Instant AI-powered grading and in-depth personalized feedback will be unlocked soon.
                </p>
              </div>

              {/* Summary Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto pt-2">
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Questions</span>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    {totalQuestions}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Submitted</span>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {submittedCount} / {totalQuestions}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">AI Review</span>
                  <p className="mt-1 font-display text-sm font-bold text-accent">
                    Pending AI Phase
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Button
                  onClick={handleBackToSets}
                  className="w-full sm:w-auto h-12 rounded-full bg-accent px-8 font-bold text-accent-foreground hover:-translate-y-0.5 shadow-soft transition-all cursor-pointer"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Back to Assignment Sets
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="w-full sm:w-auto h-12 rounded-full border-border hover:bg-muted px-6 font-semibold"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Review Questions
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full sm:w-auto h-12 rounded-full text-muted-foreground hover:text-foreground px-6 font-medium"
                >
                  Exit to Dashboard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              STATE 9: ACTIVE QUESTION FLOW FOR THE SELECTED SET
             ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar: "Back to assignment sets" link and set indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-border/40">
              <button
                type="button"
                onClick={handleBackToSets}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to assignment sets
              </button>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full bg-accent/15 text-accent border-accent/30 px-3 py-1 text-xs font-bold"
                >
                  {formatAssignmentTitle(selectedSet)}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full bg-muted/60 text-muted-foreground border-border px-2.5 py-1 text-xs font-medium"
                >
                  {selectedSet}
                </Badge>
              </div>
            </div>

            {/* Topic Header & Progress Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="font-semibold text-accent">
                  {submittedCount} of {totalQuestions} submitted ({progressPercent}%)
                </span>
              </div>

              <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-2 rounded-full" />

              {/* Question Quick Jumpers */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(submittedQuestions[q.id]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-soft ring-2 ring-primary/40"
                          : isAnswered
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted border border-border"
                      }`}
                      title={`Go to Question ${idx + 1}`}
                    >
                      {isAnswered ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6">
              {/* Question Metadata Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full bg-muted/60 text-muted-foreground border-border px-3 py-1 text-xs font-semibold"
                  >
                    Question {currentIndex + 1}
                  </Badge>

                  {/* Difficulty Tag */}
                  <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      currentQuestion.difficulty?.toLowerCase() === "easy"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : currentQuestion.difficulty?.toLowerCase() === "hard"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {currentQuestion.difficulty || "medium"}
                  </Badge>
                </div>

                {/* Question Type Tag */}
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  {currentQuestion.type === "mcq" ? (
                    <>
                      <ListFilter className="h-3.5 w-3.5 text-primary" />
                      <span>Multiple Choice</span>
                    </>
                  ) : currentQuestion.type === "coding" ? (
                    <>
                      <Code2 className="h-3.5 w-3.5 text-accent" />
                      <span>Coding Task</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Short Answer</span>
                    </>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-foreground whitespace-pre-wrap">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Question Interactive Input */}
              {currentQuestion.type === "mcq" ? (
                /* MCQ Radio Options */
                <div className="space-y-3 pt-2">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = currentAnswer === option;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx, option)}
                          className={`group flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "border-accent bg-accent/10 ring-2 ring-accent/30 text-foreground"
                              : "border-border bg-card/60 hover:border-accent/40 hover:bg-accent/5 text-muted-foreground hover:text-foreground"
                          } ${isCurrentSubmitted ? "cursor-default opacity-90" : ""}`}
                        >
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"
                            }`}
                          >
                            {isSelected ? <Check className="h-4 w-4" /> : letter}
                          </div>
                          <span className="text-sm sm:text-base font-medium leading-relaxed">
                            {option}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No options listed for this question.</p>
                  )}
                </div>
              ) : (
                /* Coding / Short Answer Textarea */
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      {currentQuestion.type === "coding" ? "Your Code Solution:" : "Your Answer:"}
                    </span>
                    <span className="font-mono text-[11px]">{currentAnswer.length} characters</span>
                  </div>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => handleTextChange(e.target.value)}
                    disabled={isCurrentSubmitted}
                    placeholder={
                      currentQuestion.type === "coding"
                        ? "// Write your algorithm or function implementation here...\nfunction solution() {\n  \n}"
                        : "Type your detailed explanation or answer here..."
                    }
                    className="min-h-[220px] rounded-2xl border-border bg-muted/20 font-mono text-sm leading-relaxed p-4 focus-visible:ring-accent shadow-inner resize-y disabled:opacity-85"
                  />
                </div>
              )}

              {/* Submitted AI Review Placeholder Banner */}
              {isCurrentSubmitted && (
                <div className="flex items-start sm:items-center gap-3.5 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/15 via-accent/10 to-transparent p-4 sm:p-5 shadow-soft animate-in fade-in duration-300">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span>Submitted! AI review coming soon</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your answer has been saved successfully. Automated AI grading, code analysis, and feedback will be unlocked in the upcoming release.
                    </p>
                  </div>
                </div>
              )}

              {/* Card Actions: Submit & Navigation */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="rounded-full px-5 text-xs font-semibold h-10 border-border"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Previous
                  </Button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {/* Submit Button per question */}
                  {!isCurrentSubmitted ? (
                    <Button
                      type="button"
                      onClick={handleSubmitCurrent}
                      disabled={submitting || !currentAnswer.trim()}
                      className="rounded-full bg-accent px-6 text-xs font-bold text-accent-foreground hover:-translate-y-0.5 shadow-sm transition-all h-10 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Answer
                        </>
                      )}
                    </Button>
                  ) : null}

                  {/* Next / Finish Navigation Button */}
                  <Button
                    type="button"
                    onClick={handleNext}
                    className={`rounded-full px-6 text-xs font-bold h-10 transition-all ${
                      currentIndex === totalQuestions - 1
                        ? "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {currentIndex === totalQuestions - 1 ? (
                      <>
                        Finish Assignment <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
                      </>
                    ) : (
                      <>
                        Next <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
