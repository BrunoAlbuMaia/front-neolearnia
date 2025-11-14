import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import type { Flashcard } from "../types";

interface QuizCardProps {
  flashcard: Flashcard;
  deckColor: string;
  onAnswerSelected: (isCorrect: boolean, timeSpent: number) => void;
  disabled?: boolean;
}

export default function QuizCard({ 
  flashcard, 
  deckColor, 
  onAnswerSelected,
  disabled = false 
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(new Date());

  // Reset quando o flashcard mudar
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setStartTime(new Date());
  }, [flashcard.id]);

  if (!flashcard.alternatives || !flashcard.correct_answer) {
    return null;
  }

  const handleAnswerClick = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (disabled || showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const isCorrect = answer === flashcard.correct_answer;
    
    // Aguarda um pouco para mostrar o feedback antes de chamar o callback
    setTimeout(() => {
      onAnswerSelected(isCorrect, timeSpent);
    }, 1500);
  };

  const getAnswerClass = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!showResult) {
      return selectedAnswer === answer 
        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
        : "hover:bg-accent hover:text-accent-foreground";
    }
    
    // Depois de mostrar resultado
    if (answer === flashcard.correct_answer) {
      return "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600";
    }
    
    if (answer === selectedAnswer && answer !== flashcard.correct_answer) {
      return "bg-red-500 text-white hover:bg-red-600 border-red-600";
    }
    
    return "bg-muted text-muted-foreground opacity-60";
  };

  const getAnswerIcon = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!showResult) return null;
    
    if (answer === flashcard.correct_answer) {
      return <Check className="h-5 w-5" />;
    }
    
    if (answer === selectedAnswer && answer !== flashcard.correct_answer) {
      return <X className="h-5 w-5" />;
    }
    
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Card com a pergunta */}
      <Card 
        className="shadow-xl border-2"
        style={{ borderColor: deckColor }}
      >
        <CardContent className="p-6 text-center">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            {flashcard.question}
          </h3>
          {showResult && (
            <div className={`mt-4 text-sm font-medium ${
              selectedAnswer === flashcard.correct_answer 
                ? 'text-emerald-600' 
                : 'text-red-600'
            }`}>
              {selectedAnswer === flashcard.correct_answer 
                ? '✓ Resposta correta!' 
                : `✗ Resposta incorreta. A resposta correta é: ${flashcard.correct_answer}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternativas */}
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((option) => (
          <Button
            key={option}
            variant="outline"
            className={`w-full justify-start h-auto py-4 px-4 text-left transition-all ${
              getAnswerClass(option)
            }`}
            onClick={() => handleAnswerClick(option)}
            disabled={disabled || showResult}
            style={!showResult && selectedAnswer === option ? { 
              borderColor: deckColor,
              borderWidth: '2px'
            } : undefined}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className={`font-bold text-lg min-w-[32px] h-8 flex items-center justify-center rounded ${
                  showResult && option === flashcard.correct_answer
                    ? 'bg-emerald-600 text-white'
                    : showResult && option === selectedAnswer && option !== flashcard.correct_answer
                    ? 'bg-red-600 text-white'
                    : 'bg-muted text-foreground'
                }`}>
                  {option}
                </span>
                <span className="text-sm md:text-base">{flashcard.alternatives![option]}</span>
              </div>
              {getAnswerIcon(option)}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

