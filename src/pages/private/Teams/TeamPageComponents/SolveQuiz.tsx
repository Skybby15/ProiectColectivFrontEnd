import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/react-query/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DtoSolveQuizRequest, DtoSolveQuestionRequest, DtoSolveQuizResponse } from "@/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import QuizResults from "./QuizResults";

interface ReadQuizQuestionResponse {
  quiz_question_id: string;
  question: string;
  quiz_options: string[];
}

interface ReadQuizResponse {
  quiz_id: string;
  quiz_title: string;
  quiz_questions: ReadQuizQuestionResponse[];
}

export default function SolveQuiz() {
  const { teamId, quizId } = useParams<{ teamId: string; quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<ReadQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DtoSolveQuizResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const res = await api.quizzesIdTestGet(quizId);
        setQuiz(res.data as unknown as ReadQuizResponse);
      } catch (err) {
        toast.error("Failed to load quiz");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const questions = quiz?.quiz_questions || [];
  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion?.quiz_question_id) return;
    const qid = currentQuestion.quiz_question_id;
    // Toggle selection for multi-select questions
    const prev = answers[qid] || [];
    const exists = prev.includes(option);
    const next = exists ? prev.filter(a => a !== option) : [...prev, option];
    setAnswers({ ...answers, [qid]: next });
    console.log(`Toggled option for ${qid}:`, option, 'now:', next);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleFinish = async () => {
    if (!quizId) return;
    console.log("Current answers state:", answers);
    console.log("Questions:", questions);
    setSubmitting(true);
    try {
      const attempts: DtoSolveQuestionRequest[] = questions.map(q => {
        const questionId = q.quiz_question_id || "";
        const userAnswer = answers[questionId] || [];
        console.log(`Question ${questionId} answer:`, userAnswer);
        return {
          quiz_question_id: questionId,
          answer: userAnswer
        };
      });
      console.log("Attempts being sent:", attempts);
      const payload: DtoSolveQuizRequest = {
        attempts
      };
      console.log("Full payload:", JSON.stringify(payload, null, 2));
      const res = await api.quizzesIdTestPost(quizId, payload);
      const quizResult: DtoSolveQuizResponse = res.data;
      console.log("Quiz result:", quizResult);
      setResult(quizResult);
      setShowResults(true);
      // Persist attempt to local history (frontend-side) since backend doesn't currently store attempts
      try {
        const key = 'quiz_attempts_v1';
        const stored = localStorage.getItem(key);
        const list = stored ? JSON.parse(stored) as any[] : [];
        const timestamp = new Date().toISOString();
        const attemptsRecord = {
          quizId: quizId,
          teamId: teamId,
          timestamp,
          attempts,
          result: quizResult
        };
        list.push(attemptsRecord);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to save quiz attempt to local storage', e);
      }
    } catch (err) {
      toast.error("Failed to submit quiz");
      console.error("Submission error:", err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: unknown } };
        console.error("Error response:", axiosErr.response?.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="w-96 h-64" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No questions found.</p>
      </div>
    );
  }

  // Show results screen using shared component
  if (showResults && result) {
    return <QuizResults teamId={teamId} questions={questions as any} userAnswers={answers} result={result} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen relative p-6">
      {/* Exit Button */}
      <Button
        variant="outline"
        className="absolute top-6 left-6"
        onClick={() => navigate(`/teams/${teamId}`)}
      >
        Exit Quiz
      </Button>

      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="absolute left-8 p-4 rounded-full bg-card shadow-lg hover:shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Center Card */}
      <Card className="w-full max-w-2xl p-8 shadow-2xl">
        <div className="mb-4 text-sm text-muted-foreground">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <h2 className="text-2xl font-semibold mb-6">{currentQuestion?.question || "No question text"}</h2>
        <div className="space-y-3">
          {currentQuestion?.quiz_options?.map((option: string, i: number) => {
            const qid = currentQuestion.quiz_question_id || "";
            const selected = answers[qid]?.includes(option) || false;
            console.log(`Rendering option "${option}" for question ${qid}, selected:`, selected);
            return (
              <button
                key={i}
                onClick={() => {
                  console.log(`Clicked option "${option}" for question ${qid}`);
                  handleOptionSelect(option);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {currentIndex === questions.length - 1 && (
          <Button
            className="w-full mt-6"
            onClick={handleFinish}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Finish Quiz"}
          </Button>
        )}
      </Card>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={currentIndex === questions.length - 1}
        className="absolute right-8 p-4 rounded-full bg-card shadow-lg hover:shadow-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}
