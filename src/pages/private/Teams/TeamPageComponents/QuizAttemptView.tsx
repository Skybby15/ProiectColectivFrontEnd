import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QuizResults from "./QuizResults";
import { api } from "@/services/react-query/api";
import type { DtoSolveQuizResponse } from "@/api";

export default function QuizAttemptView() {
  const { teamId, quizId } = useParams<{ teamId: string; quizId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stateAttempt = (location.state as any)?.attempt;
    if (stateAttempt) setAttempt(stateAttempt);

    const fetch = async () => {
      if (!quizId) return setLoading(false);
      try {
        const res = await api.quizzesIdTestGet(quizId);
        setQuestions((res.data as any).quiz_questions || []);
      } catch (e) {
        console.warn('Failed to fetch quiz for attempt view', e);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [location.state, quizId]);

  useEffect(() => {
    if (attempt) return;
    try {
      const params = new URLSearchParams(location.search);
      const ts = params.get('ts');
      const key = 'quiz_attempts_v1';
      const stored = localStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((x: any) => x.quizId === quizId && (!ts || x.timestamp === ts));
      if (found) setAttempt(found);
    } catch (e) {
      console.warn('Failed to load attempt from storage', e);
    }
  }, [attempt, location.search, quizId]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!questions) return <div className="flex items-center justify-center h-screen">Quiz not found.</div>;
  if (!attempt) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4">Attempt not found.</div>
      <button className="btn" onClick={() => navigate(-1)}>Back</button>
    </div>
  );

  const userAnswers: Record<string, string[]> = Object.fromEntries((attempt.attempts || []).map((a: any) => [a.quiz_question_id || a.questionId || a.quiz_question_id, a.answer || []]));
  const result: DtoSolveQuizResponse = attempt.result as DtoSolveQuizResponse;

  return (
    <div className="min-h-screen bg-background p-6">
      <QuizResults teamId={teamId} questions={questions as any} userAnswers={userAnswers} result={result} />
    </div>
  );
}
