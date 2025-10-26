import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, HelpCircle, Lightbulb, X, Minus, Check } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckName: string;
}


const mockFlashcards: Flashcard[] = [
  { id: "1", question: "O que é React?", answer: "Uma biblioteca para UI.", deckName: "Frontend" },
  { id: "2", question: "O que é Node.js?", answer: "Ambiente para JavaScript no servidor.", deckName: "Backend" },
  { id: "3", question: "O que é TypeScript?", answer: "Superset do JavaScript com tipagem.", deckName: "Frontend" },
];

export default function ReviewMode({  }) {
  const [flashcards] = useState(mockFlashcards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ easy: 0, medium: 0, difficult: 0 });

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'difficult') => {
    setStats(prev => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        alert(`Revisão concluída! Você revisou ${flashcards.length} flashcards.`);
        // onBack();
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
  <nav className="bg-card border-b border-border px-4 py-3">
    <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
        <h2 className="text-lg font-semibold text-foreground">Modo de Revisão</h2>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          {currentCardIndex + 1} / {flashcards.length}
        </span>
        <div className="w-full sm:w-32">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  </nav>

  <div className="flex-grow flex flex-col justify-center items-center px-4 py-6">
    <div className="w-full max-w-2xl">
      <p className="text-sm text-muted-foreground mb-2">Deck: <span className="font-semibold">{currentCard.deckName}</span></p>

      <div className="flip-card w-full max-w-full aspect-video mb-6 perspective-1000">
        <div className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <Card className="flip-card-front absolute w-full h-full backface-hidden shadow-xl">
            <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
              <HelpCircle className="text-primary h-8 w-8 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">{currentCard.question}</h3>
              <p className="text-sm text-muted-foreground">Clique para revelar a resposta</p>
            </CardContent>
          </Card>

          <Card className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 bg-primary border-primary shadow-xl">
            <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
              <Lightbulb className="text-primary-foreground h-8 w-8 mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-primary-foreground mb-4">{currentCard.answer}</h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {isFlipped && (
        <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
          <Button className="bg-red-500 text-white" size="sm" onClick={() => handleDifficulty('difficult')}><X className="mr-1 h-3 w-3" /> Difícil</Button>
          <Button className="bg-amber-500 text-white" size="sm" onClick={() => handleDifficulty('medium')}><Minus className="mr-1 h-3 w-3" /> Médio</Button>
          <Button className="bg-emerald-500 text-white" size="sm" onClick={() => handleDifficulty('easy')}><Check className="mr-1 h-3 w-3" /> Fácil</Button>
        </div>
      )}

      <div className="flex items-center justify-center space-x-3 mb-6">
        <Button variant="secondary" size="icon" onClick={handlePrevious} disabled={currentCardIndex === 0}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button onClick={handleFlip} className="px-6 min-w-[200px]">
          <RotateCcw className="mr-2 h-4 w-4" />
          {isFlipped ? 'Ocultar Resposta' : 'Mostrar Resposta'}
        </Button>

        <Button variant="secondary" size="icon" onClick={handleNext} disabled={currentCardIndex === flashcards.length - 1}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-3 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-emerald-600" data-testid="text-stats-easy">
                  {stats.easy}
                </div>
                <div className="text-xs text-muted-foreground">Fáceis</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-amber-500" data-testid="text-stats-medium">
                  {stats.medium}
                </div>
                <div className="text-xs text-muted-foreground">Médios</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-red-500" data-testid="text-stats-difficult">
                  {stats.difficult}
                </div>
                <div className="text-xs text-muted-foreground">Difíceis</div>
              </CardContent>
            </Card>
          </div>
    </div>
  </div>
</div>

  );
}
