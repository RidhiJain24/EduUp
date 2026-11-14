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
  XCircle,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
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
  aiScore?: number | null;
  aiFeedback?: string | null;
}

interface CodingReview {
  score?: number;
  isCorrect?: boolean;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  timeComplexity?: string;
  suggestedApproach?: string;
}

interface SubmittedQuestionData {
  submissionId: string;
  submittedAt: string;
  answerText: string;
  isCorrect?: boolean | null;
  correctOption?: number | null;
  explanation?: string | null;
  status?: string;
  score?: number | null;
  aiScore?: number | null;
  feedback?: string | null;
  strengths?: string[];
  improvements?: string[];
  timeComplexity?: string;
  suggestedApproach?: string;
  review?: CodingReview | null;
}

interface ResultQuestionItem {
  id: string;
  subject: string;
  subtopic: string;
  assignmentSet?: string;
  type: string;
  difficulty?: string;
  questionText: string;
  options?: string[];
  correctOption?: number | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  userAnswer?: string | null;
  answer?: string | null;
  isCorrect?: boolean | null;
  submitted?: boolean;
  submittedAt?: string | null;
  submissionId?: string | null;
  aiScore?: number | null;
  aiFeedback?: string | null;
}

interface ResultsSummary {
  totalQuestions: number;
  numberCorrect: number;
  numberPendingReview: number;
  correctCount?: number;
  pendingCount?: number;
  questions: ResultQuestionItem[];
}

function parseReviewSafe(aiFeedback?: string | null): CodingReview | null {
  if (!aiFeedback) return null;
  if (typeof aiFeedback === "object") return aiFeedback as CodingReview;
  try {
    return JSON.parse(aiFeedback);
  } catch (e) {
    return null;
  }
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
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, SubmittedQuestionData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsSummary | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // 1. Fetch available sets when page loads or subject/subtopic changes
  const loadSets = useCallback(() => {
    let isMounted = true;
    setSetsLoading(true);
    setSetsError(null);
    setSelectedSet(null);
    setQuestions([]);
    setIsCompleted(false);
    setResultsData(null);
    setExpandedQuestions({});

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
    setResultsData(null);
    setExpandedQuestions({});

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

      // Pre-load existing submissions for this set if user previously attempted it
      try {
        const results = await fetchAPI(`/questions/results?${params.toString()}`);
        if (results && Array.isArray(results.questions)) {
          const loadedAnswers: Record<string, string> = {};
          const loadedSubmissions: Record<string, SubmittedQuestionData> = {};

          results.questions.forEach((q: ResultQuestionItem) => {
            if (q.submitted && (q.userAnswer || q.answer)) {
              loadedAnswers[q.id] = q.userAnswer || q.answer || "";
              const parsed = parseReviewSafe(q.aiFeedback);
              loadedSubmissions[q.id] = {
                submissionId: q.submissionId || "",
                submittedAt: q.submittedAt || "",
                answerText: q.userAnswer || q.answer || "",
                isCorrect: q.isCorrect,
                correctOption: q.correctOption,
                explanation: q.explanation || parsed?.feedback,
                status: q.aiScore !== null && q.aiScore !== undefined ? "reviewed" : "pending_ai_review",
                score: q.aiScore ?? parsed?.score,
                aiScore: q.aiScore ?? parsed?.score,
                feedback: parsed?.feedback || q.explanation,
                strengths: parsed?.strengths,
                improvements: parsed?.improvements,
                timeComplexity: parsed?.timeComplexity,
                suggestedApproach: parsed?.suggestedApproach,
                review: parsed,
              };
            }
          });

          if (Object.keys(loadedAnswers).length > 0) {
            setAnswers((prev) => ({ ...loadedAnswers, ...prev }));
            setSubmittedQuestions((prev) => ({ ...loadedSubmissions, ...prev }));
          }
        }
      } catch (e) {
        // Ignore pre-load error if not logged in or no submissions exist yet
      }
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
    setResultsData(null);
    setExpandedQuestions({});
  };

  // 3b. Retry the current set from the beginning
  const handleRetrySet = () => {
    if (selectedSet) {
      handleStartSet(selectedSet);
    }
  };

  const toggleQuestionExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 4. Fetch results whenever assignment set is marked complete
  useEffect(() => {
    if (isCompleted && selectedSet) {
      let isMounted = true;
      setResultsLoading(true);

      const params = new URLSearchParams({
        subject,
        subtopic,
        assignmentSet: selectedSet,
      });

      fetchAPI(`/questions/results?${params.toString()}`)
        .then((data: ResultsSummary) => {
          if (isMounted) {
            setResultsData(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching assignment results:", err);
        })
        .finally(() => {
          if (isMounted) {
            setResultsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isCompleted, selectedSet, subject, subtopic]);

  // Active question getters
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";
  const isCurrentSubmitted = currentQuestion ? Boolean(submittedQuestions[currentQuestion.id]) : false;
  const currentSubmission = currentQuestion ? submittedQuestions[currentQuestion.id] : undefined;
  const activeCorrectOptIdx = currentSubmission?.correctOption ?? currentQuestion?.correctOption;
  const activeCorrectOptionText =
    currentQuestion &&
    activeCorrectOptIdx !== null &&
    activeCorrectOptIdx !== undefined &&
    currentQuestion.options &&
    currentQuestion.options[activeCorrectOptIdx]
      ? currentQuestion.options[activeCorrectOptIdx]
      : null;

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
      const isMcq = currentQuestion.type === "mcq";
      const selectedOptIndex =
        isMcq && currentQuestion.options ? currentQuestion.options.indexOf(answer) : undefined;

      const res = await fetchAPI("/questions/submit", {
        method: "POST",
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer,
          selectedOption: selectedOptIndex !== undefined && selectedOptIndex !== -1 ? selectedOptIndex : undefined,
        }),
      });

      const parsedReview = res.review || parseReviewSafe(res.aiFeedback);

      setSubmittedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          submissionId: res.id || res.submissionId,
          submittedAt: res.submittedAt || new Date().toISOString(),
          answerText: answer,
          isCorrect: res.isCorrect,
          correctOption: res.correctOption,
          explanation: res.explanation || res.feedback || parsedReview?.feedback,
          status: res.status,
          score: res.score ?? res.aiScore ?? parsedReview?.score,
          aiScore: res.aiScore ?? res.score ?? parsedReview?.score,
          feedback: res.feedback || parsedReview?.feedback,
          strengths: res.strengths || parsedReview?.strengths,
          improvements: res.improvements || parsedReview?.improvements,
          timeComplexity: res.timeComplexity || parsedReview?.timeComplexity,
          suggestedApproach: res.suggestedApproach || parsedReview?.suggestedApproach,
          review: parsedReview,
        },
      }));

      if (isMcq) {
        if (res.isCorrect) {
          toast.success("Correct answer! 🎉", {
            description: res.explanation || "Great job!",
          });
        } else {
          toast.error("Incorrect answer", {
            description: res.explanation || "Review the correct answer below.",
          });
        }
      } else if (res.status === "pending_ai_review") {
        toast.info("Submission saved", {
          description: "AI review unavailable right now, your answer is saved.",
        });
      } else {
        toast.success("AI review complete! 🎉", {
          description: `Score: ${res.score ?? res.aiScore ?? parsedReview?.score ?? 0}/100`,
        });
      }
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
    setResultsData(null);
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

            <div className="rounded-3xl border border-accent/20 bg-gradient-to-b from-card via-card to-accent/5 p-6 sm:p-10 shadow-glow space-y-8">
              {/* Score Header & Congratulations */}
              {(() => {
                const totalQ = resultsData?.totalQuestions ?? totalQuestions;
                const mcqList = resultsData
                  ? resultsData.questions.filter((q) => q.type?.toLowerCase() === "mcq")
                  : questions.filter((q) => q.type?.toLowerCase() === "mcq");
                const codingList = resultsData
                  ? resultsData.questions.filter((q) => q.type?.toLowerCase() === "coding")
                  : questions.filter((q) => q.type?.toLowerCase() === "coding");

                const numCorrect = resultsData?.numberCorrect ?? 0;
                const numPending = resultsData?.numberPendingReview ?? 0;
                const accuracy = mcqList.length > 0 ? Math.round((numCorrect / mcqList.length) * 100) : 0;

                const scoredCoding = codingList.filter(
                  (q) => typeof q.aiScore === "number" && !isNaN(q.aiScore)
                );
                const avgScore =
                  scoredCoding.length > 0
                    ? Math.round(
                        scoredCoding.reduce((sum, q) => sum + (q.aiScore ?? 0), 0) /
                          scoredCoding.length
                      )
                    : null;

                let headerTitle = "";
                let headerSub = "";

                if (codingList.length === 0) {
                  // MCQ-based set
                  headerTitle = `You got ${numCorrect} of ${totalQ} correct`;
                  headerSub = `${accuracy}% accuracy on ${formatAssignmentTitle(selectedSet || "Set 1")}`;
                } else if (mcqList.length === 0) {
                  // Coding-based set
                  if (avgScore !== null) {
                    headerTitle = `Average AI score: ${avgScore}/100`;
                    headerSub = `Evaluated across ${scoredCoding.length} coding question${scoredCoding.length === 1 ? "" : "s"} with instant AI feedback`;
                  } else {
                    const submittedCount = resultsData
                      ? resultsData.questions.filter((q) => q.submitted).length
                      : Object.keys(submittedQuestions).length;
                    headerTitle = `${submittedCount} submitted, pending AI review`;
                    headerSub = "All code solutions are saved and pending automated AI review";
                  }
                } else {
                  // Mixed set
                  if (avgScore !== null) {
                    headerTitle = `Average AI score: ${avgScore}/100`;
                    headerSub = `${numCorrect} of ${mcqList.length} MCQ correct • ${scoredCoding.length} coding question${scoredCoding.length === 1 ? "" : "s"} evaluated`;
                  } else {
                    headerTitle = `You got ${numCorrect} of ${mcqList.length} correct`;
                    headerSub = `${numPending} coding submission${numPending === 1 ? "" : "s"} pending AI review`;
                  }
                }

                return (
                  <div className="text-center space-y-4">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-accent text-accent-foreground shadow-glow animate-bounce">
                      <Trophy className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                      <Badge className="rounded-full bg-accent/20 text-accent border-accent/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                        {formatAssignmentTitle(selectedSet || "")} Results
                      </Badge>
                      <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        {headerTitle}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                        {headerSub}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Summary Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {(() => {
                  const codingList = resultsData
                    ? resultsData.questions.filter((q) => q.type?.toLowerCase() === "coding")
                    : questions.filter((q) => q.type?.toLowerCase() === "coding");
                  const mcqList = resultsData
                    ? resultsData.questions.filter((q) => q.type?.toLowerCase() === "mcq")
                    : questions.filter((q) => q.type?.toLowerCase() === "mcq");
                  const totalQ = resultsData?.totalQuestions ?? totalQuestions;
                  const numCorrect = resultsData?.numberCorrect ?? 0;
                  const scoredCoding = codingList.filter(
                    (q) => typeof q.aiScore === "number" && !isNaN(q.aiScore)
                  );
                  const avgScore =
                    scoredCoding.length > 0
                      ? Math.round(
                          scoredCoding.reduce((sum, q) => sum + (q.aiScore ?? 0), 0) /
                            scoredCoding.length
                        )
                      : null;

                  if (codingList.length > 0 && mcqList.length === 0) {
                    return (
                      <>
                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Problems</span>
                          <p className="mt-1 font-display text-2xl font-bold text-foreground">
                            {totalQ}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-center">
                          <span className="text-xs font-semibold text-accent uppercase flex items-center justify-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Average AI Score
                          </span>
                          <p className="mt-1 font-display text-2xl font-bold text-accent">
                            {avgScore !== null ? `${avgScore}/100` : "Pending"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Evaluated
                          </span>
                          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {scoredCoding.length} of {codingList.length}
                          </p>
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="rounded-2xl border border-border bg-card p-4 text-center">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Total Questions</span>
                        <p className="mt-1 font-display text-2xl font-bold text-foreground">
                          {totalQ}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct (MCQ)
                        </span>
                        <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {numCorrect}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center">
                        <span className="text-xs font-semibold text-accent uppercase flex items-center justify-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {codingList.length > 0 ? "Average AI Score" : "Pending Review"}
                        </span>
                        <p className="mt-1 font-display text-2xl font-bold text-accent">
                          {codingList.length > 0
                            ? avgScore !== null
                              ? `${avgScore}/100`
                              : "Pending"
                            : resultsData ? resultsData.numberPendingReview : "-"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Question Breakdown List */}
              {resultsLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <span>Loading auto-graded results...</span>
                </div>
              ) : resultsData && resultsData.questions.length > 0 ? (
                <div className="space-y-4 max-w-3xl mx-auto text-left w-full">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-accent" />
                      Question Breakdown & Review
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {resultsData.questions.length} questions
                    </span>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3.5 rounded-2xl">
                    {resultsData.questions.map((q, qIdx) => {
                      const isMcq = q.type?.toLowerCase() === "mcq";
                      const isCoding = q.type?.toLowerCase() === "coding";
                      const isExpanded = Boolean(expandedQuestions[q.id]);
                      const parsedReview = isCoding ? parseReviewSafe(q.aiFeedback) : null;
                      const hasAiScore = typeof q.aiScore === "number" && !isNaN(q.aiScore);

                      return (
                        <div
                          key={q.id || qIdx}
                          className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                            isMcq
                              ? q.isCorrect === true
                                ? "border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-950/20"
                                : q.isCorrect === false
                                ? "border-destructive/35 bg-destructive/5 dark:bg-destructive/20"
                                : "border-border bg-card/60"
                              : hasAiScore
                              ? q.aiScore! >= 70
                                ? "border-emerald-500/35 bg-emerald-500/5 dark:bg-emerald-950/20"
                                : "border-accent/40 bg-accent/5 dark:bg-accent/10"
                              : "border-border bg-card/60"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Correct / Incorrect Icon */}
                            <div className="shrink-0 mt-0.5">
                              {isMcq ? (
                                q.isCorrect === true ? (
                                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  </div>
                                ) : q.isCorrect === false ? (
                                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-destructive text-destructive-foreground shadow-sm">
                                    <X className="h-4 w-4 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-muted-foreground">
                                    <HelpCircle className="h-4 w-4" />
                                  </div>
                                )
                              ) : isCoding ? (
                                hasAiScore ? (
                                  <div className={`grid h-7 w-7 place-items-center rounded-lg text-white shadow-sm ${
                                    q.aiScore! >= 70 ? "bg-emerald-600" : "bg-accent text-accent-foreground"
                                  }`}>
                                    <Sparkles className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-white shadow-sm">
                                    <Clock className="h-4 w-4" />
                                  </div>
                                )
                              ) : null}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Question {qIdx + 1}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                                    {q.type}
                                  </Badge>
                                  {isMcq ? (
                                    q.isCorrect === true ? (
                                      <Badge className="bg-emerald-600 text-white text-[11px] gap-1 font-bold">
                                        <Check className="h-3 w-3 stroke-[2.5]" /> Correct
                                      </Badge>
                                    ) : q.isCorrect === false ? (
                                      <Badge variant="destructive" className="text-[11px] gap-1 font-bold">
                                        <X className="h-3 w-3 stroke-[2.5]" /> Incorrect
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                        Not Answered
                                      </Badge>
                                    )
                                  ) : isCoding ? (
                                    hasAiScore ? (
                                      <Badge
                                        className={`${
                                          q.aiScore! >= 70
                                            ? "bg-emerald-600 text-white"
                                            : "bg-accent text-accent-foreground"
                                        } text-[11px] gap-1 font-bold shadow-sm`}
                                      >
                                        <Sparkles className="h-3 w-3" /> AI Score: {q.aiScore}/100
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[11px] gap-1 font-medium">
                                        <Clock className="h-3 w-3" /> Pending Review
                                      </Badge>
                                    )
                                  ) : null}
                                </div>
                              </div>

                              <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                                {q.questionText}
                              </p>

                              {/* Student Answer */}
                              <div className="mt-3 flex flex-wrap items-baseline gap-2 text-xs sm:text-sm">
                                <span className="font-semibold text-muted-foreground">Your Answer:</span>
                                <span
                                  className={
                                    isMcq
                                      ? q.isCorrect === true
                                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                        : q.isCorrect === false
                                        ? "text-destructive font-bold line-through"
                                        : "italic text-muted-foreground"
                                      : "font-mono bg-muted/60 px-2 py-0.5 rounded text-foreground font-medium text-xs break-all"
                                  }
                                >
                                  {q.userAnswer || q.answer || "No answer submitted"}
                                </span>
                              </div>

                              {/* For incorrect ones: inline / expandable correct answer + explanation */}
                              {isMcq && (q.isCorrect === false || !q.isCorrect) && (
                                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-3.5 space-y-1.5">
                                  <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                    <Check className="h-4 w-4 stroke-[2.5]" />
                                    <span>Correct Answer: {q.correctAnswer || (q.correctOption !== null && q.correctOption !== undefined && q.options ? q.options[q.correctOption] : "N/A")}</span>
                                  </div>
                                  {q.explanation && (
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      <span className="font-semibold text-foreground">Explanation: </span>
                                      {q.explanation}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* For correct MCQ: show explanation inline */}
                              {isMcq && q.isCorrect === true && q.explanation && (
                                <div className="mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs text-muted-foreground">
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Explanation: </span>
                                  {q.explanation}
                                </div>
                              )}

                              {/* Expandable options preview */}
                              {q.options && q.options.length > 0 && (
                                <div className="mt-2.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleQuestionExpand(q.id)}
                                    className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{isExpanded ? "Hide all options" : "Show all options"}</span>
                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>

                                  {isExpanded && (
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
                                      {q.options.map((opt, optIndex) => {
                                        const isRight = optIndex === q.correctOption || opt === q.correctAnswer;
                                        const isStudentPick = opt === q.userAnswer || opt === q.answer;
                                        return (
                                          <div
                                            key={optIndex}
                                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                              isRight
                                                ? "border-emerald-500/60 bg-emerald-500/10 font-semibold text-emerald-950 dark:text-emerald-100"
                                                : isStudentPick
                                                ? "border-destructive/60 bg-destructive/10 text-destructive line-through"
                                                : "border-border/60 bg-card/60 text-muted-foreground"
                                            }`}
                                          >
                                            <span className="flex items-center gap-2 min-w-0">
                                              <span className="font-bold shrink-0">{String.fromCharCode(65 + optIndex)}.</span>
                                              <span className="truncate">{opt}</span>
                                            </span>
                                            {isRight && (
                                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 shrink-0">
                                                Correct
                                              </Badge>
                                            )}
                                            {!isRight && isStudentPick && (
                                              <Badge variant="destructive" className="text-[10px] py-0 px-1.5 shrink-0">
                                                You
                                              </Badge>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Coding Question AI Review & Feedback Summary */}
                              {isCoding && (
                                <div className="mt-3.5 space-y-3">
                                  {hasAiScore || parsedReview ? (
                                    <div className="rounded-xl border border-accent/30 bg-card/90 p-4 space-y-3 shadow-sm">
                                      {/* Header with Score and Time Complexity */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                                          <Sparkles className="h-4 w-4" />
                                          <span>AI Code Review</span>
                                          {q.isCorrect !== null && q.isCorrect !== undefined && (
                                            <Badge
                                              className={`text-[10px] py-0 px-2 font-bold uppercase ${
                                                q.isCorrect ? "bg-emerald-600 text-white" : "bg-destructive text-destructive-foreground"
                                              }`}
                                            >
                                              {q.isCorrect ? "Passed" : "Needs Work"}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {parsedReview?.timeComplexity && (
                                            <Badge variant="outline" className="text-[10px] font-mono border-border bg-muted/40 gap-1">
                                              <Clock className="h-2.5 w-2.5 text-accent" />
                                              <span>{parsedReview.timeComplexity}</span>
                                            </Badge>
                                          )}
                                          <Badge
                                            className={`text-xs font-extrabold ${
                                              (q.aiScore ?? parsedReview?.score ?? 0) >= 70
                                                ? "bg-emerald-600 text-white"
                                                : "bg-accent text-accent-foreground"
                                            }`}
                                          >
                                            Score: {q.aiScore ?? parsedReview?.score ?? 0}/100
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* Feedback Summary */}
                                      <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                          Feedback Summary
                                        </span>
                                        <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                                          {parsedReview?.feedback || q.explanation || "Your solution was evaluated by AI."}
                                        </p>
                                      </div>

                                      {/* Toggle Detailed Analysis */}
                                      <button
                                        type="button"
                                        onClick={() => toggleQuestionExpand(q.id)}
                                        className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
                                      >
                                        <span>{isExpanded ? "Hide detailed analysis" : "Show detailed analysis (Strengths, Improvements, Suggested Approach)"}</span>
                                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                      </button>

                                      {isExpanded && parsedReview && (
                                        <div className="space-y-3 pt-2.5 border-t border-border/50 animate-in fade-in duration-200">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Green Strengths */}
                                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
                                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                                                <span>Strengths</span>
                                              </span>
                                              {parsedReview.strengths && parsedReview.strengths.length > 0 ? (
                                                <ul className="text-xs space-y-1.5 text-foreground">
                                                  {parsedReview.strengths.map((s: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                                                      <span>{s}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="text-xs text-muted-foreground italic">No strengths highlighted.</p>
                                              )}
                                            </div>

                                            {/* Orange Improvements */}
                                            <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 space-y-1.5">
                                              <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                                                <span>Improvements</span>
                                              </span>
                                              {parsedReview.improvements && parsedReview.improvements.length > 0 ? (
                                                <ul className="text-xs space-y-1.5 text-foreground">
                                                  {parsedReview.improvements.map((imp: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                                      <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5 stroke-[2.5]" />
                                                      <span>{imp}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="text-xs text-muted-foreground italic">No improvements suggested.</p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Suggested Approach */}
                                          {parsedReview.suggestedApproach && (
                                            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                                              <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                                                <Lightbulb className="h-3.5 w-3.5 text-accent" />
                                                <span>Suggested Approach</span>
                                              </span>
                                              <p className="text-xs text-muted-foreground leading-relaxed">
                                                {parsedReview.suggestedApproach}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-muted-foreground space-y-1">
                                      <div className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>AI review unavailable right now, your answer is saved</span>
                                      </div>
                                      <p className="leading-relaxed">
                                        Your code solution has been saved. Automated AI evaluation was not completed at submit time.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Actions: Back to Assignments & Retry this set */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Button
                  onClick={handleBackToSets}
                  className="w-full sm:w-auto h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-bold shadow-soft transition-all cursor-pointer"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Back to Assignments
                </Button>
                <Button
                  onClick={handleRetrySet}
                  className="w-full sm:w-auto h-12 rounded-full bg-accent text-accent-foreground hover:shadow-glow hover:-translate-y-0.5 px-8 font-bold shadow-soft transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry this set
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

                      // POST-SUBMISSION: Reveal immediate grading feedback per question
                      if (isCurrentSubmitted) {
                        const isStudentPick = isSelected || currentSubmission?.answerText === option;
                        const isCorrectOption =
                          (currentSubmission?.correctOption !== null &&
                            currentSubmission?.correctOption !== undefined &&
                            currentSubmission.correctOption === optIdx) ||
                          (currentQuestion.correctOption !== null &&
                            currentQuestion.correctOption !== undefined &&
                            currentQuestion.correctOption === optIdx);

                        if (isStudentPick && currentSubmission?.isCorrect === true) {
                          // 1. Correct answer chosen by student: Green highlight + checkmark
                          return (
                            <div
                              key={optIdx}
                              className="flex items-center justify-between gap-3.5 p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 dark:bg-emerald-950/40 ring-2 ring-emerald-500/25 text-foreground cursor-default select-none shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                </div>
                                <span className="text-sm sm:text-base font-semibold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                                  {option}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                              </span>
                            </div>
                          );
                        }

                        if (isStudentPick && currentSubmission?.isCorrect === false) {
                          // 2. Incorrect answer chosen by student: Red highlight + X
                          return (
                            <div
                              key={optIdx}
                              className="flex items-center justify-between gap-3.5 p-4 rounded-2xl border-2 border-destructive bg-destructive/15 dark:bg-destructive/25 ring-2 ring-destructive/25 text-foreground cursor-default select-none shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold bg-destructive text-destructive-foreground shadow-sm">
                                  <X className="h-4 w-4 stroke-[3]" />
                                </div>
                                <span className="text-sm sm:text-base font-semibold text-destructive-950 dark:text-destructive-100 leading-relaxed">
                                  {option}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/20 text-destructive shrink-0">
                                <XCircle className="h-3.5 w-3.5" /> Your Answer
                              </span>
                            </div>
                          );
                        }

                        if (isCorrectOption) {
                          // 3. Reveal correct answer when student picked wrong option: Green dashed highlight + checkmark
                          return (
                            <div
                              key={optIdx}
                              className="flex items-center justify-between gap-3.5 p-4 rounded-2xl border-2 border-emerald-500/70 border-dashed bg-emerald-500/10 dark:bg-emerald-950/20 text-foreground cursor-default select-none transition-all"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold bg-emerald-600/85 text-white shadow-sm">
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                </div>
                                <span className="text-sm sm:text-base font-semibold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                                  {option}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answer
                              </span>
                            </div>
                          );
                        }

                        // 4. Other neutral unselected options
                        return (
                          <div
                            key={optIdx}
                            className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/40 bg-card/30 opacity-40 text-muted-foreground cursor-default select-none"
                          >
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold bg-muted text-muted-foreground">
                              {letter}
                            </div>
                            <span className="text-sm sm:text-base font-normal leading-relaxed">
                              {option}
                            </span>
                          </div>
                        );
                      }

                      // PRE-SUBMISSION: Neutral blue outline/highlight upon selection (NO checkmark)
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx, option)}
                          className={`group flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/25 text-foreground shadow-sm"
                              : "border-border bg-card/70 hover:border-blue-400/50 hover:bg-blue-500/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                                : "bg-muted text-muted-foreground group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                            }`}
                          >
                            {letter}
                          </div>
                          <span
                            className={`text-sm sm:text-base leading-relaxed ${
                              isSelected ? "font-semibold text-foreground" : "font-medium"
                            }`}
                          >
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

              {/* Loading Banner while AI review is in progress */}
              {submitting && currentQuestion.type === "coding" && (
                <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4 sm:p-5 shadow-soft animate-in fade-in duration-300">
                  <div className="flex items-center gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                        <span>AI is reviewing your code...</span>
                        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Analyzing correctness, edge cases, algorithmic time complexity, and code quality.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted Auto-Grading Feedback Banner / Real AI Review Card */}
              {isCurrentSubmitted && (
                currentQuestion.type === "mcq" ? (
                  <div
                    className={`flex items-start sm:items-center gap-3.5 rounded-2xl border p-4 sm:p-5 shadow-soft animate-in fade-in duration-300 ${
                      currentSubmission?.isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                        : "border-destructive/40 bg-destructive/10 text-destructive-950 dark:text-destructive-100"
                    }`}
                  >
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm ${
                        currentSubmission?.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {currentSubmission?.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1 w-full min-w-0">
                      {currentSubmission?.isCorrect ? (
                        <>
                          <h5 className="font-display text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <span>Correct! Well done</span>
                            <CheckCircle2 className="h-4 w-4" />
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {currentSubmission?.explanation || "Your answer matches the correct option."}
                          </p>
                        </>
                      ) : (
                        <>
                          <h5 className="font-display text-sm font-bold flex items-center gap-1.5 text-destructive">
                            <span>Incorrect Answer</span>
                            <XCircle className="h-4 w-4" />
                          </h5>
                          {activeCorrectOptionText && (
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Correct Answer: {activeCorrectOptionText}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {currentSubmission?.explanation ||
                              (activeCorrectOptionText
                                ? `The correct answer is ${activeCorrectOptionText}`
                                : "Review the question and try to understand the concept.")}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : currentQuestion.type === "coding" ? (
                  currentSubmission?.status === "pending_ai_review" ||
                  (currentSubmission?.score === null &&
                    currentSubmission?.score === undefined &&
                    currentSubmission?.aiScore === null &&
                    currentSubmission?.aiScore === undefined &&
                    !currentSubmission?.feedback &&
                    !currentSubmission?.review) ? (
                    /* Fallback when review is pending or rate-limited */
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 sm:p-5 shadow-soft animate-in fade-in duration-300">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-sm">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                            <span>AI review unavailable right now, your answer is saved</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your code implementation was successfully recorded. The automated AI evaluation is temporarily delayed or experiencing high demand.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Real AI Review Card for Coding */
                    <div className="rounded-2xl border border-accent/30 bg-card/90 p-5 sm:p-6 shadow-soft animate-in fade-in duration-300 space-y-4">
                      {/* Header with Title, Status Badge, Time Complexity and Score Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                              <span>AI Code Review</span>
                              {currentSubmission?.isCorrect !== null && currentSubmission?.isCorrect !== undefined && (
                                <Badge
                                  className={`text-[10px] py-0 px-2 font-bold uppercase ${
                                    currentSubmission.isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-destructive text-destructive-foreground"
                                  }`}
                                >
                                  {currentSubmission.isCorrect ? "Passed" : "Needs Work"}
                                </Badge>
                              )}
                            </h4>
                            <span className="text-[11px] text-muted-foreground">Automated multi-factor evaluation</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Time Complexity Badge */}
                          {currentSubmission?.timeComplexity && (
                            <Badge variant="outline" className="rounded-full bg-muted/60 border-border px-2.5 py-1 text-xs font-mono font-medium gap-1 text-foreground">
                              <Clock className="h-3 w-3 text-accent" />
                              <span>{currentSubmission.timeComplexity}</span>
                            </Badge>
                          )}

                          {/* Score Badge (e.g. 85/100) */}
                          <Badge
                            className={`rounded-full px-3.5 py-1 text-xs sm:text-sm font-extrabold shadow-sm ${
                              (currentSubmission?.score ?? currentSubmission?.aiScore ?? 0) >= 70
                                ? "bg-emerald-600 text-white"
                                : "bg-accent text-accent-foreground"
                            }`}
                          >
                            {currentSubmission?.score ?? currentSubmission?.aiScore ?? 0}/100
                          </Badge>
                        </div>
                      </div>

                      {/* Overall Feedback */}
                      {(currentSubmission?.feedback || currentSubmission?.explanation) && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Overall Feedback
                          </span>
                          <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                            {currentSubmission.feedback || currentSubmission.explanation}
                          </p>
                        </div>
                      )}

                      {/* Strengths & Improvements in responsive columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* Green Strengths List */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-3.5 space-y-2">
                          <h6 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Strengths</span>
                          </h6>
                          {currentSubmission?.strengths && currentSubmission.strengths.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-foreground">
                              {currentSubmission.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No specific strengths highlighted.</p>
                          )}
                        </div>

                        {/* Orange Improvements List */}
                        <div className="rounded-xl border border-accent/40 bg-accent/5 p-3.5 space-y-2">
                          <h6 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Improvements</span>
                          </h6>
                          {currentSubmission?.improvements && currentSubmission.improvements.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-foreground">
                              {currentSubmission.improvements.map((imp, idx) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5 stroke-[2.5]" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No improvements suggested.</p>
                          )}
                        </div>
                      </div>

                      {/* Suggested Approach */}
                      {currentSubmission?.suggestedApproach && (
                        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
                          <span className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-accent" />
                            <span>Suggested Approach</span>
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {currentSubmission.suggestedApproach}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* Generic Fallback for non-coding non-mcq */
                  <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h5 className="font-display text-sm font-bold text-foreground">Answer Submitted</h5>
                      <p className="text-xs text-muted-foreground">Your answer has been saved successfully.</p>
                    </div>
                  </div>
                )
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
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          {currentQuestion.type === "coding" ? "AI Reviewing..." : "Submitting..."}
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
