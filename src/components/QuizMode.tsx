import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useToast } from "../hooks/use-toast";
import { useStudySession } from "../hooks/useStudySession";
import type { Quiz } from "../types";
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2,
  XCircle,
  Circle
} from "lucide-react";

interface QuizModeProps {
  quizzes: Quiz[];
  onBack: () => void;
  deckColor?: string;
}

export default function QuizMode({ quizzes, onBack, deckColor = "#3B82F6" }: QuizModeProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizStartTime, setQuizStartTime] = useState(new Date());
  
  const { toast } = useToast();
  
  // Validação: se não há quizzes, mostrar mensagem (depois dos hooks)
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Nenhum quiz encontrado.</p>
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;
  const isLastQuiz = currentQuizIndex === quizzes.length - 1;

  // Converter options para formato A, B, C, D (se o quiz tiver options)
  const options = currentQuiz?.options ? currentQuiz.options.map((option, index) => {
    const letter = ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
    return {
      key: letter,
      label: option.text,
      isCorrect: option.is_correct,
      id: option.id
    };
  }) : [];

  // Encontrar a resposta correta
  const correctAnswer = options.find(opt => opt.isCorrect)?.key || 'A';

  const {
    sessionId,
    stats,
    updateStats,
    recordReview,
    finalizeSession,
    isCreatingSession,
    isRecordingReview,
  } = useStudySession(
    currentQuiz?.set_id,
    quizzes.length
  );

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (showResult) return; // Não permite mudar resposta após mostrar resultado
    
    setSelectedAnswer(answer);
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Atualizar estatísticas baseado na resposta
    if (sessionId) {
      const timeSpent = Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000);
      // Para quiz, consideramos fácil se acertou, difícil se errou
      const difficulty = correct ? 'easy' : 'difficult';
      
      recordReview.mutate({
        flashcardId: currentQuiz.id,
        sessionId,
        difficulty,
        timeSpent
      });

      updateStats(difficulty);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setQuizStartTime(new Date()); // Reset tempo para próxima questão
    } else {
      // Último quiz - finalizar sessão
      const completedCards = stats.easy + stats.medium + stats.difficult + 1;
      finalizeSession(completedCards);
      toast({
        title: "Quiz concluído!",
        description: `Você acertou ${score.correct} de ${score.total} questões.`,
      });
    }
  };

  const handleFinish = () => {
    const completedCards = stats.easy + stats.medium + stats.difficult + (selectedAnswer ? 1 : 0);
    finalizeSession(completedCards);
    onBack();
  };

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Erro ao carregar quiz.</p>
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validação: verificar se o quiz tem todas as propriedades necessárias
  if (!currentQuiz.options || currentQuiz.options.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Quiz com dados incompletos.</p>
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Questão {currentQuizIndex + 1} de {quizzes.length}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {score.correct}/{score.total} corretas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <Card className="shadow-lg border-2" style={{ borderColor: deckColor }}>
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed">
                  {currentQuiz.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mt-6">
                {options.map((option) => {
                  const isSelected = selectedAnswer === option.key;
                  const isCorrectOption = option.isCorrect;
                  const showCorrect = showResult && isCorrectOption;
                  const showIncorrect = showResult && isSelected && !isCorrectOption;

                  return (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerSelect(option.key)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        showResult
                          ? showCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-950'
                            : isSelected
                            ? 'border-primary/50 bg-accent/50'
                            : 'border-border bg-card'
                          : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          showResult
                            ? showCorrect
                              ? 'bg-green-500 text-white'
                              : showIncorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-muted text-muted-foreground'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {showResult && showCorrect && <CheckCircle2 className="h-5 w-5" />}
                          {showResult && showIncorrect && <XCircle className="h-5 w-5" />}
                          {!showResult && <Circle className="h-5 w-5 fill-current" />}
                        </div>
                        <span className="font-medium text-foreground flex-1">
                          <span className="font-bold mr-2">{option.key}.</span>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result Message */}
              {showResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isCorrect 
                    ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`font-medium ${
                    isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {isCorrect 
                      ? '✓ Resposta correta!' 
                      : `✗ Resposta incorreta. A resposta correta é ${correctAnswer}.`
                    }
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {isLastQuiz ? (
                  <Button
                    onClick={handleFinish}
                    className="flex-1"
                    size="lg"
                    style={{ backgroundColor: deckColor }}
                  >
                    Finalizar Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!showResult}
                    className="flex-1"
                    size="lg"
                    style={{ backgroundColor: deckColor }}
                  >
                    Próxima Questão
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

