import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useToast } from "../hooks/use-toast";
import { useStudySession } from "../hooks/useStudySession";
// import { useUpdateFlashcardDifficulty } from "../hooks/useFlashcards";
import type { Flashcard } from "../types";
import QuizCard from "./QuizCard";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  HelpCircle, 
  Lightbulb,
  X,
  Minus,
  Check
} from "lucide-react";
import { TooltipProvider } from "./ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

interface StudyModeProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export default function StudyMode({ flashcards, onBack }: StudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(new Date());
  
  const { toast } = useToast();
  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;
  
  // Pega a cor do deck do primeiro flashcard (todos do mesmo deck têm a mesma cor)
  const deckColor = flashcards[0]?.color || "#3B82F6"; // Azul padrão
  const cardStyle = {
    backgroundColor: deckColor,
    borderColor: deckColor,
  };

  const {
    sessionId,
    stats,
    updateStats,
    recordReview,
    finalizeSession,
    isCreatingSession,
    isRecordingReview,
  } = useStudySession(
    flashcards[0]?.set_id,
    flashcards.length
  );

  // const updateFlashcardDifficulty = useUpdateFlashcardDifficulty();

  const resetCard = () => {
    setIsFlipped(false);
    setCardStartTime(new Date());
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'difficult') => {
    if (!sessionId) {
      toast({
        title: "Aguarde...",
        description: "Preparando sessão de estudo.",
        variant: "destructive"
      });
      return;
    }

    const timeSpent = Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000);
    
    recordReview.mutate({
      flashcardId: currentCard.id,
      sessionId,
      difficulty,
      timeSpent
    });

    updateStats(difficulty);

    // updateFlashcardDifficulty.mutate({
    //   flashcardId: currentCard.id,
    //   difficulty
    // });
    
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        handleNext();
      } else {
        const completedCards = stats.easy + stats.medium + stats.difficult + 1;
        finalizeSession(completedCards);
        toast({
          title: "Estudo concluído!",
          description: `Você revisou ${completedCards} flashcards.`,
        });
      }
    }, 500);
  };

  const handleQuizAnswer = (isCorrect: boolean, timeSpent: number) => {
    if (!sessionId) {
      toast({
        title: "Aguarde...",
        description: "Preparando sessão de estudo.",
        variant: "destructive"
      });
      return;
    }

    // Determina a dificuldade baseado se acertou ou errou
    const difficulty: 'easy' | 'medium' | 'difficult' = isCorrect ? 'easy' : 'difficult';
    
    recordReview.mutate({
      flashcardId: currentCard.id,
      sessionId,
      difficulty,
      timeSpent
    });

    updateStats(difficulty);
    
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        handleNext();
      } else {
        const completedCards = stats.easy + stats.medium + stats.difficult + 1;
        finalizeSession(completedCards);
        toast({
          title: "Estudo concluído!",
          description: `Você revisou ${completedCards} flashcards.`,
        });
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      resetCard();
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      resetCard();
    }
  };

  const handleExit = () => {
    if (sessionId) {
      const completedCards = stats.easy + stats.medium + stats.difficult;
      finalizeSession(completedCards);
    }
    onBack();
  };

  useEffect(() => {
    resetCard();
  }, [currentCardIndex]);

  if (!currentCard) {
    return <div>Nenhum flashcard disponível</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
            <Button
              variant="ghost"
              onClick={handleExit}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <h2 className="text-lg font-semibold text-foreground">Modo de Estudo</h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground" data-testid="text-card-counter">
              {currentCardIndex + 1} / {flashcards.length}
            </span>
            <div className="w-full sm:w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-4xl w-full mx-auto p-4 flex flex-col justify-center">
        <div className="w-full max-w-2xl mx-auto">
          {/* Renderiza QuizCard se for do tipo quiz, senão renderiza o card padrão */}
          {currentCard.type === 'quiz' && currentCard.alternatives && currentCard.correct_answer ? (
            <div className="mb-6">
              <QuizCard
                flashcard={currentCard}
                deckColor={deckColor}
                onAnswerSelected={handleQuizAnswer}
                disabled={!sessionId || isCreatingSession || isRecordingReview}
              />
            </div>
          ) : (
            <>
              <div className="flip-card w-full aspect-video mb-6 perspective-1000">
                <div 
                  className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                  <Card 
                    className="flip-card-front absolute w-full h-full backface-hidden shadow-xl"
                    style={{ borderColor: deckColor, borderWidth: '2px' }}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4" style={{ color: deckColor }}>
                        <HelpCircle className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" data-testid="text-question">
                        {currentCard.question}
                      </h3>
                      <p className="text-sm text-muted-foreground">Clique para revelar a resposta</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 shadow-xl"
                    style={cardStyle}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4">
                        <Lightbulb className="text-white h-8 w-8 drop-shadow-lg" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-white mb-4 drop-shadow-lg" data-testid="text-answer">
                        {currentCard.answer}
                      </h3>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                {isFlipped && (
                  <TooltipProvider>
                    <div className="flex flex-wrap justify-center items-center gap-2">
                      <span className="text-sm font-medium text-foreground mr-2">Como foi?</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={!sessionId || isCreatingSession || isRecordingReview}
                            onClick={() => handleDifficulty('difficult')}
                            data-testid="button-difficult"
                          >
                            <X className="mr-1 h-3 w-3" /> Difícil
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Não lembrei bem. Vou revisar amanhã.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="bg-amber-500 text-white hover:bg-amber-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                            size="sm"
                            disabled={!sessionId || isCreatingSession || isRecordingReview}
                            onClick={() => handleDifficulty('medium')}
                            data-testid="button-medium"
                          >
                            <Minus className="mr-1 h-3 w-3" /> Médio
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lembrei com dificuldade. Vou revisar em alguns dias.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                            size="sm"
                            disabled={!sessionId || isCreatingSession || isRecordingReview}
                            onClick={() => handleDifficulty('easy')}
                            data-testid="button-easy"
                          >
                            <Check className="mr-1 h-3 w-3" /> Fácil
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lembrei facilmente! Próxima revisão em mais tempo.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}

                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                    data-testid="button-previous"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={handleFlip}
                    className="px-6 min-w-[200px]"
                    data-testid="button-flip"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {isFlipped ? 'Ocultar Resposta' : 'Mostrar Resposta'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentCardIndex === flashcards.length - 1}
                    data-testid="button-next"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Botões de navegação para modo quiz */}
          {currentCard.type === 'quiz' && currentCard.alternatives && currentCard.correct_answer && (
            <div className="flex items-center justify-center space-x-3 mt-6">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrevious}
                disabled={currentCardIndex === 0}
                data-testid="button-previous"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNext}
                disabled={currentCardIndex === flashcards.length - 1}
                data-testid="button-next"
                aria-label="Próximo"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

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
