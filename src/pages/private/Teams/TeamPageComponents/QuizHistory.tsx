import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/react-query/api";
import QuizResults from "./QuizResults";


interface StoredAttempt {
  quizId?: string;
  teamId?: string;
  timestamp?: string;
  attempts?: any[];
  result?: any;
  quizTitle?: string;
}

export default function QuizHistory() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<StoredAttempt[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);
  const [fetchedQuizQuestions, setFetchedQuizQuestions] = useState<any[] | null>(null);

  useEffect(() => {
    try {
      const key = 'quiz_attempts_v1';
      const stored = localStorage.getItem(key);
      const list = stored ? (JSON.parse(stored) as StoredAttempt[]) : [];
      const filtered = teamId ? list.filter(i => i.teamId === teamId) : list;
      filtered.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setHistory(filtered);

      (async () => {
        try {
          const ids = Array.from(new Set(filtered.map(f => f.quizId).filter(Boolean)));
          if (ids.length === 0) return;
          const results = await Promise.all(ids.map(async id => {
            try {
              const res = await api.quizzesIdTestGet(id!);
              const data = res.data as any;
              return { id, title: data.quiz_title || data.quiz_name || id };
            } catch (e) {
              return { id, title: id };
            }
          }));
          const map: Record<string, string> = {};
          results.forEach(r => { if (r && r.id) map[r.id] = r.title; });
          const updated = filtered.map(f => ({ ...f, quizTitle: f.quizId ? map[f.quizId] || f.quizId : undefined } as any));
          setHistory(updated as StoredAttempt[]);
        } catch (e) {
          console.warn('Failed to fetch quiz titles', e);
        }
      })();
    } catch (e) {
      console.warn('Failed to load quiz history', e);
      setHistory([]);
    }
  }, [teamId]);

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Quiz Attempts History</h2>
            <Button variant="outline" onClick={() => navigate(`/teams/${teamId}`)}>Back to Team</Button>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">No quiz attempts found for this team.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Quiz Attempts History</h2>
          <Button variant="outline" onClick={() => navigate(`/teams/${teamId}`)}>Back to Team</Button>
        </div>

        <div className="space-y-4">
          {history.map((h, idx) => {
          const timestamp = h.timestamp ? new Date(h.timestamp).toLocaleString() : 'Unknown';
          const total = h.attempts?.length || 0;
          let percent: number | null = null;
          if (h.result && h.result.questions_answers) {
            const correct = h.result.questions_answers.filter((q: any) => q.is_correct).length;
            percent = Math.round((correct / h.result.questions_answers.length) * 100);
          }
            return (
              <Card key={`${h.quizId}-${idx}`} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{timestamp}</div>
                    <h3 className="text-lg font-medium">Quiz: {h.quizTitle || 'unknown'}</h3>
                    <div className="text-sm text-muted-foreground">Questions: {total}</div>
                  </div>
                  <div className="text-right">
                    {percent !== null ? (
                      <div className="text-xl font-bold">{percent}%</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No result</div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button variant="ghost" onClick={() => {
                        navigate(`/teams/${teamId}/quizzes/${h.quizId}/results`, { state: { attempt: h } });
                      }}>View</Button>
                      <Button variant="destructive" onClick={() => {
                        try {
                          const key = 'quiz_attempts_v1';
                          const stored = localStorage.getItem(key);
                          const list = stored ? (JSON.parse(stored) as StoredAttempt[]) : [];
                          const removeIdx = list.findIndex(x => x.timestamp === h.timestamp && x.quizId === h.quizId);
                          if (removeIdx !== -1) list.splice(removeIdx, 1);
                          localStorage.setItem(key, JSON.stringify(list));
                          const filtered = list.filter(i => i.teamId === teamId);
                          filtered.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
                          setHistory(filtered);
                          if (selectedIndex !== null && selectedIndex >= filtered.length) setSelectedIndex(null);
                        } catch (e) {
                          console.warn('Failed to remove attempt', e);
                        }
                      }}>Delete</Button>
                    </div>
                  </div>
                </div>
                {selectedIndex === idx && (
                  loadingQuizId === h.quizId ? (
                    <div className="mt-4 text-sm text-muted-foreground">Loading quiz...</div>
                  ) : (
                    fetchedQuizQuestions ? (
                      <QuizResults teamId={teamId} questions={fetchedQuizQuestions as any} userAnswers={Object.fromEntries((h.attempts || []).map((a: any) => [a.quiz_question_id || a.questionId || `q${Math.random()}`, a.answer || []]))} result={h.result} />
                    ) : (
                      <div className="mt-4 text-sm text-muted-foreground">No quiz data available to render results.</div>
                    )
                  )
                )}
              </Card>
            );
        })}
        </div>
      </div>
    </div>
  );
}
