import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { type Flashcard } from "../../shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
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

interface StudyModeProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

interface StudyStats {
  easy: number;
  medium: number;
  difficult: number;
}

export default function StudyMode({ flashcards, onBack }: StudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDifficultyButtons, setShowDifficultyButtons] = useState(false);
  const [stats, setStats] = useState<StudyStats>({ easy: 0, medium: 0, difficult: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create study session
  const createSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `${import.meta.env.VITE_LINK_API}/api/study-sessions`, {
        flashcardSetId: flashcards[0]?.setId || "unknown",
        totalCards: flashcards.length,
        startedAt: sessionStartTime.toISOString()
      });
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
    onError: (error: any) => {
      console.error("Failed to create study session:", error);
    },
  });

  // Record card review
  const recordReview = useMutation({
    mutationFn: async (data: { flashcardId: string; difficulty: string; timeSpent: number }) => {
      if (!sessionId) return;
      
      const response = await apiRequest("POST", `${import.meta.env.VITE_LINK_API}/api/card-reviews`, {
        flashcardId: data.flashcardId,
        sessionId: sessionId,
        difficulty: data.difficulty,
        timeSpent: data.timeSpent
      });
      return response.json();
    },
    onError: (error: any) => {
      console.error("Failed to record card review:", error);
    },
  });

  // Update study session on completion
  const updateSession = useMutation({
    mutationFn: async (params?: { completedCards?: number }) => {
      if (!sessionId) return;
      
      const completedCards = params?.completedCards !== undefined 
        ? params.completedCards 
        : stats.easy + stats.medium + stats.difficult;
      
      const response = await apiRequest("PATCH", `${import.meta.env.VITE_LINK_API}/api/study-sessions/${sessionId}`, {
        endedAt: new Date().toISOString(),
        completedCards,
        easyCount: stats.easy,
        mediumCount: stats.medium,
        difficultCount: stats.difficult
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate analytics queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/analytics/progress`] });
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/analytics/stats`] });
    },
    onError: (error: any) => {
      console.error("Failed to update study session:", error);
    },
  });

  const [cardStartTime, setCardStartTime] = useState(new Date());

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  // Initialize study session on mount
  useEffect(() => {
    // Only create session if we have valid flashcards with setId
    if (flashcards.length > 0 && flashcards[0]?.setId && flashcards[0].setId !== "unknown") {
      createSession.mutate();
    } else if (flashcards.length === 0 || !flashcards[0]?.setId) {
      toast({
        title: "Erro na sessão de estudo",
        description: "Não foi possível iniciar a sessão. Flashcards inválidos.",
        variant: "destructive"
      });
    }
  }, []);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        // Finalize session with accurate completion count
        const completedCards = stats.easy + stats.medium + stats.difficult;
        updateSession.mutate({ completedCards });
      }
    };
  }, [sessionId, stats]);

  const resetCard = () => {
    setIsFlipped(false);
    setShowDifficultyButtons(false);
    setCardStartTime(new Date()); // Reset timer for new card
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setShowDifficultyButtons(true);
    } else {
      setIsFlipped(false);
      setShowDifficultyButtons(false);
    }
  };

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'difficult') => {
    // Don't allow rating if session isn't ready
    if (!sessionId) {
      toast({
        title: "Aguarde...",
        description: "Preparando sessão de estudo.",
        variant: "destructive"
      });
      return;
    }

    const timeSpent = Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000);
    
    // Record the review in analytics
    recordReview.mutate({
      flashcardId: currentCard.id,
      difficulty,
      timeSpent
    });

    // Update local stats
    const newStats = {
      ...stats,
      [difficulty]: stats[difficulty] + 1
    };
    setStats(newStats);

    // Update flashcard difficulty in database
    apiRequest("PATCH", `${import.meta.env.VITE_LINK_API}/api/flashcards/${currentCard.id}/difficulty`, {
      difficulty
    }).catch(error => {
      console.error("Failed to update flashcard difficulty:", error);
    });
    
    // Auto advance to next card after marking difficulty
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        handleNext();
      } else {
        // Completed all cards, update session with accurate count
        const completedCards = newStats.easy + newStats.medium + newStats.difficult;
        updateSession.mutate({ completedCards });
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
    // Update session with current progress when exiting
    if (sessionId) {
      const completedCards = stats.easy + stats.medium + stats.difficult;
      updateSession.mutate({ completedCards });
    }
    onBack();
  };

  // Reset card state when index changes
  useEffect(() => {
    resetCard();
  }, [currentCardIndex]);

  if (!currentCard) {
    return <div>Nenhum flashcard disponível</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Study Header */}
      <nav className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        {/* Study Card Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-2xl">
            {/* Main Flashcard */}
            <div className="flip-card h-80 mb-8 perspective-1000">
              <div 
                className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                {/* Card Front (Question) */}
                <Card className="flip-card-front absolute w-full h-full backface-hidden shadow-xl">
                  <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4">
                      <HelpCircle className="text-primary text-2xl h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="text-question">
                      {currentCard.question}
                    </h3>
                    <p className="text-sm text-muted-foreground">Clique para revelar a resposta</p>
                  </CardContent>
                </Card>
                
                {/* Card Back (Answer) */}
                <Card className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 bg-primary border-primary shadow-xl">
                  <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4">
                      <Lightbulb className="text-primary-foreground text-2xl h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-4" data-testid="text-answer">
                      {currentCard.answer}
                    </h3>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Study Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {/* Difficulty Feedback */}
              {showDifficultyButtons && (
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                  <span className="text-sm font-medium text-foreground mr-2">Como foi?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!sessionId || createSession.isPending}
                    onClick={() => handleDifficulty('difficult')}
                    data-testid="button-difficult"
                  >
                    <X className="mr-1 h-3 w-3" /> Difícil
                  </Button>
                  <Button
                    className="bg-amber-500 text-white hover:bg-amber-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                    size="sm"
                    disabled={!sessionId || createSession.isPending}
                    onClick={() => handleDifficulty('medium')}
                    data-testid="button-medium"
                  >
                    <Minus className="mr-1 h-3 w-3" /> Médio
                  </Button>
                  <Button
                    className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                    size="sm"
                    disabled={!sessionId || createSession.isPending}
                    onClick={() => handleDifficulty('easy')}
                    data-testid="button-easy"
                  >
                    <Check className="mr-1 h-3 w-3" /> Fácil
                  </Button>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                </Button>
                
                <Button
                  onClick={handleFlip}
                  className="px-6"
                  data-testid="button-flip"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {isFlipped ? 'Ocultar Resposta' : 'Mostrar Resposta'}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleNext}
                  disabled={currentCardIndex === flashcards.length - 1}
                  data-testid="button-next"
                >
                  Próximo <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Study Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600" data-testid="text-stats-easy">
                    {stats.easy}
                  </div>
                  <div className="text-xs text-muted-foreground">Fáceis</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-500" data-testid="text-stats-medium">
                    {stats.medium}
                  </div>
                  <div className="text-xs text-muted-foreground">Médios</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-500" data-testid="text-stats-difficult">
                    {stats.difficult}
                  </div>
                  <div className="text-xs text-muted-foreground">Difíceis</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
