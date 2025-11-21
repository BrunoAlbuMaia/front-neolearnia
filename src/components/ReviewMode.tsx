import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useReviews } from "../hooks/useReviews";
import { useFlashcardSets } from "../hooks/useFlashcards";
import { reviewApi } from "../api/reviewApi";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useToast } from "../hooks/use-toast";
import type { ReviewCard } from "../types";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  X,
  Minus,
  Check,
  Filter,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function ReviewMode() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [reviewMode, setReviewMode] = useState<"all" | "difficult" | "overdue">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"easy" | "medium" | "difficult" | undefined>(undefined);
  
  // Construir opções de filtro baseado no modo selecionado
  const reviewOptions = useMemo(() => {
    const options: {
      onlyDifficult?: boolean;
      onlyOverdue?: boolean;
      difficulty?: "easy" | "medium" | "difficult";
    } = {};

    if (reviewMode === "difficult") {
      options.onlyDifficult = true;
    } else if (reviewMode === "overdue") {
      options.onlyOverdue = true;
    }

    if (difficultyFilter) {
      options.difficulty = difficultyFilter;
    }

    // Retornar undefined apenas se não houver nenhum filtro (para usar cache de "todas")
    return Object.keys(options).length > 0 ? options : undefined;
  }, [reviewMode, difficultyFilter]);

  // Buscar todas as revisões para ter o summary completo (sempre sem filtros)
  const { data: allReviewsData } = useReviews(undefined);
  const summary = allReviewsData?.summary;
  
  // Buscar revisões filtradas baseado no modo selecionado
  const { data: reviewsData, isLoading, error } = useReviews(reviewOptions);
  const flashcards = reviewsData?.cards || [];
  const { data: decks } = useFlashcardSets();
  const { toast } = useToast();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ easy: 0, medium: 0, difficult: 0 });

  const navigateToHome = () => setLocation("/");

  // Garantir que decks seja sempre um array (proteção contra cache limpo)
  const safeDecks = useMemo(() => {
    if (!decks || !Array.isArray(decks)) {
      return [];
    }
    return decks;
  }, [decks]);

  // Enriquecer flashcards com a cor do deck baseado no nome
  const flashcardsWithColor = useMemo(() => {
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) return [];
    
    return flashcards.map((card: ReviewCard) => {
      // Buscar o deck pelo nome para pegar a cor
      const deck = safeDecks.find((d: any) => d.title === card.name_deck);
      return {
        ...card,
        color: deck?.color || "#7CFC00", // Cor padrão
      };
    });
  }, [flashcards, safeDecks]);

  // Pega a cor do deck do card atual
  const currentCard = flashcardsWithColor[currentCardIndex];
  const deckColor = currentCard?.color || "#7CFC00";
  const cardStyle = {
    backgroundColor: deckColor,
    borderColor: deckColor,
  };

  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar revisões:", error);
      toast({
        title: "Erro ao carregar revisões",
        description: "Não foi possível carregar os flashcards. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Resetar índice quando os flashcards mudarem ou quando o índice estiver inválido
  useEffect(() => {
    if (flashcardsWithColor && flashcardsWithColor.length > 0) {
      // Se o índice atual está fora do range, resetar para 0
      if (currentCardIndex >= flashcardsWithColor.length) {
        setCurrentCardIndex(0);
      }
      setIsFlipped(false);
    } else if (flashcardsWithColor.length === 0) {
      // Se não há flashcards, resetar índice
      setCurrentCardIndex(0);
    }
  }, [flashcardsWithColor, currentCardIndex]);

  // Resetar índice quando mudar o filtro
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [reviewMode, difficultyFilter]);

  // Loading state com UI melhor
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando revisões...</p>
        </div>
      </div>
    );
  }

  // Estado vazio com UI melhor
  if (!flashcardsWithColor || flashcardsWithColor.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-6 text-center">
        <Card className="max-w-md w-full shadow-lg border border-border/50 p-8 animate-fade-in">
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md animate-pulse"></div>
              <Lightbulb className="text-primary h-12 w-12 relative" />
            </div>
  
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Nenhuma revisão pendente 🎉
            </h2>
            <p className="text-muted-foreground mb-6">
              Você está em dia com todas as suas revisões!  
              Aproveite o momento para descansar ou criar novos flashcards.
            </p>
  
            <Button
              onClick={() => setLocation("/")}
              className="px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Voltar para a tela inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  
  // Proteção: garantir que temos dados válidos antes de renderizar
  // Se não há card atual mas há flashcards, pode ser índice inválido ou dados ainda carregando
  if (!currentCard && flashcardsWithColor.length > 0) {
    // Se o índice está fora do range, o useEffect acima vai corrigir
    // Mas enquanto isso, mostrar loading para evitar tela preta
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparando revisão...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentCardIndex + 1) / flashcardsWithColor.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleDifficulty = async (difficulty: "easy" | "medium" | "difficult") => {
    try {
      if (!currentCard) return;
      
      await reviewApi.recordCardReview({
        flashcardId: currentCard.flashcard_id,
        difficulty: difficulty,
      });

      setStats((prev) => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

      // Invalidar cache para atualizar dados após revisão
      queryClient.invalidateQueries({ queryKey: ['reviews-today'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'gamification'] });

      if (currentCardIndex < flashcardsWithColor.length - 1) {
        setTimeout(() => {
          setCurrentCardIndex((i) => i + 1);
          setIsFlipped(false);
        }, 300);
      } else {
        toast({
          title: "Revisão concluída!",
          description: `Você revisou ${flashcardsWithColor.length} flashcards.`,
        });
        navigateToHome();
      }
    } catch (err) {
      toast({
        title: "Erro ao registrar revisão",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={navigateToHome}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
              </Button>
              <h2 className="text-lg font-semibold text-foreground">Modo de Revisão</h2>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {currentCardIndex + 1} / {flashcardsWithColor.length}
              </span>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Filtros Visuais */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtrar revisões:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Botão: Todas */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reviewMode === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setReviewMode("all");
                        setDifficultyFilter(undefined);
                      }}
                      className={reviewMode === "all" ? "bg-primary text-primary-foreground" : ""}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Todas
                      {summary && (
                        <span className="ml-2 px-1.5 py-0.5 bg-background/50 rounded text-xs">
                          {summary.totalDue}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Todas as revisões devidas para hoje</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Botão: Atrasadas */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reviewMode === "overdue" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setReviewMode("overdue");
                        setDifficultyFilter(undefined);
                      }}
                      className={
                        reviewMode === "overdue" 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : "border-red-300 text-red-600 hover:bg-red-50"
                      }
                    >
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Atrasadas
                      {summary && summary.overdue > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-background/50 rounded text-xs font-bold">
                          {summary.overdue}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cards que passaram da data de revisão</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Botão: Difíceis */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={reviewMode === "difficult" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setReviewMode("difficult");
                        setDifficultyFilter(undefined);
                      }}
                      className={
                        reviewMode === "difficult" 
                          ? "bg-amber-500 text-white hover:bg-amber-600" 
                          : "border-amber-300 text-amber-600 hover:bg-amber-50"
                      }
                    >
                      <X className="mr-1 h-3 w-3" />
                      Difíceis
                      {summary && summary.byDifficulty?.difficult > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-background/50 rounded text-xs">
                          {summary.byDifficulty.difficult}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cards que você marcou como difíceis recentemente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Filtro por Dificuldade (opcional, quando não está em modo específico) */}
            {reviewMode === "all" && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Por dificuldade:</span>
                <div className="flex gap-1">
                  <Button
                    variant={difficultyFilter === "easy" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDifficultyFilter(difficultyFilter === "easy" ? undefined : "easy")}
                    className={`h-7 px-2 text-xs ${difficultyFilter === "easy" ? "bg-emerald-500 text-white" : ""}`}
                  >
                    Fácil
                  </Button>
                  <Button
                    variant={difficultyFilter === "medium" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDifficultyFilter(difficultyFilter === "medium" ? undefined : "medium")}
                    className={`h-7 px-2 text-xs ${difficultyFilter === "medium" ? "bg-amber-500 text-white" : ""}`}
                  >
                    Médio
                  </Button>
                  <Button
                    variant={difficultyFilter === "difficult" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDifficultyFilter(difficultyFilter === "difficult" ? undefined : "difficult")}
                    className={`h-7 px-2 text-xs ${difficultyFilter === "difficult" ? "bg-red-500 text-white" : ""}`}
                  >
                    Difícil
                  </Button>
                </div>
              </div>
            )}

            {/* Info sobre o filtro atual */}
            {flashcardsWithColor.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {reviewMode === "all" && !difficultyFilter && (
                  <>Mostrando <strong>{flashcardsWithColor.length}</strong> revisões devidas para hoje</>
                )}
                {reviewMode === "all" && difficultyFilter && (
                  <>Mostrando <strong>{flashcardsWithColor.length}</strong> revisões marcadas como <strong>{difficultyFilter === "easy" ? "fáceis" : difficultyFilter === "medium" ? "médias" : "difíceis"}</strong></>
                )}
                {reviewMode === "overdue" && (
                  <>Mostrando <strong>{flashcardsWithColor.length}</strong> revisões <strong className="text-red-600">atrasadas</strong></>
                )}
                {reviewMode === "difficult" && (
                  <>Mostrando <strong>{flashcardsWithColor.length}</strong> cards que você está tendo <strong className="text-amber-600">dificuldade</strong></>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col justify-center items-center px-4 py-6">
        <div className="w-full max-w-2xl text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Deck: <span className="font-medium text-foreground">{currentCard?.name_deck}</span>
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="flip-card w-full aspect-video mb-6 perspective-1000">
            <div
              className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              <Card 
                className="flip-card-front absolute w-full h-full backface-hidden shadow-xl"
                style={{ borderColor: deckColor, borderWidth: '2px' }}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4" style={{ color: deckColor }}>
                    <HelpCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                    {currentCard?.question}
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
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 drop-shadow-lg">
                    {currentCard?.answer}
                  </h3>
                </CardContent>
              </Card>
            </div>
          </div>

          {isFlipped && (
            <TooltipProvider>
              <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                <span className="text-sm font-medium text-foreground mr-2">Como foi?</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      size="sm"
                      onClick={() => handleDifficulty("difficult")}
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
                      className="bg-amber-500 text-white hover:bg-amber-600"
                      size="sm"
                      onClick={() => handleDifficulty("medium")}
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
                      className="bg-emerald-500 text-white hover:bg-emerald-600"
                      size="sm"
                      onClick={() => handleDifficulty("easy")}
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

          <div className="flex items-center justify-center space-x-3 mb-6">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setCurrentCardIndex((i) => Math.max(i - 1, 0))}
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button onClick={handleFlip} className="px-6 min-w-[200px]">
              <RotateCcw className="mr-2 h-4 w-4" />
              {isFlipped ? "Ocultar Resposta" : "Mostrar Resposta"}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setCurrentCardIndex((i) => Math.min(i + 1, flashcardsWithColor.length - 1))}
              disabled={currentCardIndex === flashcardsWithColor.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
