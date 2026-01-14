import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { DtoSolveQuizResponse } from "@/api";

interface ReadQuizQuestionResponse {
  quiz_question_id: string;
  question: string;
  quiz_options: string[];
}

interface QuizResultsProps {
  teamId?: string | null;
  questions: ReadQuizQuestionResponse[];
  userAnswers: Record<string, string[]>;
  result: DtoSolveQuizResponse;
}

export default function QuizResults({ teamId, questions, userAnswers, result }: QuizResultsProps) {
  const navigate = useNavigate();

  const correctCount = result.questions_answers?.filter(q => q.is_correct).length || 0;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quiz Results</h2>
        <Button onClick={() => navigate(`/teams/${teamId}`)}>Back to Team</Button>
      </div>

      <Card className="p-6">
        <div className="text-center space-y-2">
          <h3 className="text-4xl font-bold">{percentage}%</h3>
          <p className="text-lg text-muted-foreground">
            {correctCount} out of {totalQuestions} correct
          </p>
          {percentage === 100 && <p className="text-green-500 font-semibold">Perfect Score! 🎉</p>}
          {percentage >= 80 && percentage < 100 && <p className="text-blue-500 font-semibold">Great Job! 👏</p>}
          {percentage >= 60 && percentage < 80 && <p className="text-yellow-500 font-semibold">Good Effort! 👍</p>}
          {percentage < 60 && <p className="text-orange-500 font-semibold">Keep Practicing! 💪</p>}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Review Answers</h3>
        {questions.map((q, idx) => {
          const questionResult = result.questions_answers?.find(
            r => r.quiz_question_id === q.quiz_question_id
          );
          const isCorrect = questionResult?.is_correct || false;
          const correctAnswers = questionResult?.correct_fields || [];
          const userAnswersForQ = userAnswers[q.quiz_question_id || ""] || [];

          return (
            <Card key={q.quiz_question_id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">Question {idx + 1}: {q.question}</h4>
                  {isCorrect ? (
                    <span className="text-green-500 font-semibold">✓ Correct</span>
                  ) : (
                    <span className="text-red-500 font-semibold">✗ Incorrect</span>
                  )}
                </div>
                <div className="space-y-2">
                  {q.quiz_options?.map((option: string) => {
                    const isUserAnswer = userAnswersForQ.includes(option);
                    const isCorrectAnswer = correctAnswers.includes(option);
                    return (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : isUserAnswer
                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && <span className="text-green-500">✓</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-red-500">✗</span>}
                          <span>{option}</span>
                          {isCorrectAnswer && <span className="text-xs text-muted-foreground ml-auto">(Correct)</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-xs text-muted-foreground ml-auto">(Your answer)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
