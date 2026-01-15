import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/react-query/api";
import type { EntityQuiz, EntityQuestion } from "@/api";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/services/stores/useAuthStore";

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswerIndexes: number[]; // support multiple correct answers
}

export default function CreateQuiz() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: "", options: ["", ""], correctAnswerIndexes: [0] }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error("Maximum 20 questions allowed");
      return;
    }
    setQuestions([...questions, { question: "", options: ["", ""], correctAnswerIndexes: [0] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("At least one question is required");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length >= 4) {
      toast.error("Maximum 4 options allowed");
      return;
    }
    updateQuestion(questionIndex, "options", [...question.options, ""]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, "options", updatedOptions);

    // adjust correctAnswerIndexes: remove any that pointed to removed option,
    // and shift indexes greater than removed one
    const prevCorrect = question.correctAnswerIndexes || [];
    const nextCorrect = prevCorrect
      .map(i => (i > optionIndex ? i - 1 : i))
      .filter(i => i >= 0 && i < updatedOptions.length);
    if (nextCorrect.length === 0) {
      // ensure at least one correct answer remains
      nextCorrect.push(0);
    }
    updateQuestion(questionIndex, "correctAnswerIndexes", nextCorrect);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    const updatedOptions = [...question.options];
    updatedOptions[optionIndex] = value;
    updateQuestion(questionIndex, "options", updatedOptions);
  };

  const validateForm = (): boolean => {
    if (!quizName.trim()) {
      toast.error("Quiz name is required");
      return false;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.options.length < 2 || q.options.length > 4) {
        toast.error(`Question ${i + 1} must have 2-4 options`);
        return false;
      }

        const filledOptions = q.options.filter(opt => opt.trim());
        if (filledOptions.length !== q.options.length) {
          toast.error(`Question ${i + 1} has empty options`);
          return false;
        }
        if (!q.correctAnswerIndexes || q.correctAnswerIndexes.length === 0) {
          toast.error(`Question ${i + 1} must have at least one correct answer`);
          return false;
        }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setSubmitting(true);
    try {
      const entityQuestions: EntityQuestion[] = questions.map(q => ({
        question: q.question,
        options: q.options,
        answers: (q.correctAnswerIndexes || []).map(i => q.options[i]),
        type: "multiple_choice" as const
      }));

      const quizPayload: EntityQuiz = {
        quiz_name: quizName,
        team_id: teamId,
        user_id: user.id,
        questions: entityQuestions
      };

      await api.quizzesPost(quizPayload);
      
      toast.success("Quiz created successfully!");
      navigate(`/teams/${teamId}?tab=quizzes`);
    } catch {
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Quiz</h1>
          <Button variant="outline" onClick={() => navigate(`/teams/${teamId}?tab=quizzes`)}>
            Cancel
          </Button>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Quiz Name</label>
            <Input
              placeholder="Enter quiz name"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              className="max-w-md"
            />
          </div>
        </Card>

        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Question Text</label>
                <Input
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Options (2-4)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    disabled={question.options.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`correct-${qIndex}-${oIndex}`}
                      checked={(question.correctAnswerIndexes || []).includes(oIndex)}
                      onChange={() => {
                        const prev = question.correctAnswerIndexes || [];
                        const exists = prev.includes(oIndex);
                        const next = exists ? prev.filter(i => i !== oIndex) : [...prev, oIndex];
                        updateQuestion(qIndex, "correctAnswerIndexes", next);
                      }}
                      className="h-4 w-4"
                    />
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Select one or more correct answers</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={addQuestion} disabled={questions.length >= 20}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>

          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
