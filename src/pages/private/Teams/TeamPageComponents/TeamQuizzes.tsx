import { useEffect } from "react";
import { useGetTeamQuizzes } from "@/services/react-query/quiz";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EntityQuiz } from "@/api";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface TeamQuizzesProps { teamId: string; }

export default function TeamQuizzes({ teamId }: TeamQuizzesProps) {
  const navigate = useNavigate();
  const { mutate : getTeamQuizzes, data, isPending, isError, error } = useGetTeamQuizzes(teamId);

  useEffect(() => {
    getTeamQuizzes();
  }, [getTeamQuizzes]);

  const quizzes: EntityQuiz[] = data || [];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Team Quizzes</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/teams/${teamId}/quizzes/create`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
          <Button variant="outline" onClick={() => navigate(`/teams/${teamId}/quizzes/history`)}>History</Button>
          <Button variant="outline" onClick={() => getTeamQuizzes()} disabled={isPending}>Refresh</Button>
        </div>
      </div>
      {isPending && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      )}
      {isError && (
        <div className="text-red-500 text-sm">Failed to load quizzes: {error.message}</div>
      )}
      {!isPending && !isError && quizzes.length === 0 && (
        <div className="text-muted-foreground">No quizzes found for this team.</div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((q, idx) => {
          const questionsCount = (q as any).quiz_questions?.length || 0;
          const quizTitle = (q as any).quiz_title || q.quiz_name || "Untitled Quiz";
          const quizId = (q as any).quiz_id || q.id;
          return (
            <Card key={quizId || `quiz-${idx}`} className="p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-lg truncate" title={quizTitle}>{quizTitle}</h3>
                <p className="text-sm text-muted-foreground">Questions: {questionsCount}</p>
              </div>
              <Button className="mt-4" onClick={() => navigate(`/teams/${teamId}/quizzes/${quizId}/solve`)}>Solve</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
