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
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Hand,
} from "lucide-react";
import { motion, useMotionValue, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion";
import type { PanInfo } from "framer-motion";
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
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showFeedback, setShowFeedback] = useState<'easy' | 'medium' | 'difficult' | null>(null);
  const [hasVoted, setHasVoted] = useState(false); // CRÍTICO: Controla se já votou no card atual
  
  // CRÍTICO: Valores de movimento para gestos de swipe
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // CRÍTICO: Transformações baseadas no movimento
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

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
    setHasVoted(false);
    setIsExiting(false);
    setExitDirection(null);
    setShowFeedback(null);
    setSwipeDirection(null);
    x.set(0);
    y.set(0);
  }, [reviewMode, difficultyFilter]);

  // CRÍTICO: Atualizar direção do swipe em tempo real (apenas horizontal)
  useMotionValueEvent(x, "change", (latest) => {
    const yValue = y.get();
    if (Math.abs(yValue) < 30) {
      if (latest < -50) {
        setSwipeDirection('left');
      } else if (latest > 50) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection(null);
      }
    }
  });
  
  // CRÍTICO: Monitorar movimento vertical também
  useMotionValueEvent(y, "change", (latest) => {
    const xValue = x.get();
    if (Math.abs(latest) > 30 && Math.abs(xValue) < 30) {
      setSwipeDirection(null);
    }
  });

  // Resetar estados ao mudar de card
  useEffect(() => {
    setIsFlipped(false);
    setHasVoted(false);
    setIsExiting(false);
    setExitDirection(null);
    setShowFeedback(null);
    setSwipeDirection(null);
    // CRÍTICO: Reset explícito dos valores de movimento para garantir que voltam ao centro
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 0);
  }, [currentCardIndex, x, y]);

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

  // CRÍTICO: Handler para gestos de swipe estilo Tinder
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Thresholds mais baixos para mobile - facilitar swipe para cima
    const swipeThreshold = 80;
    const velocityThreshold = 400;
    const verticalSwipeThreshold = 60;
    
    // Verifica movimento predominante (vertical ou horizontal)
    const isVerticalSwipe = Math.abs(info.offset.y) > Math.abs(info.offset.x);
    
    if (isVerticalSwipe) {
      // Swipe vertical (para cima)
      if ((Math.abs(info.offset.y) > verticalSwipeThreshold || Math.abs(info.velocity.y) > velocityThreshold) && 
          (info.offset.y < 0 || info.velocity.y < 0)) {
        setExitDirection('up');
        handleDifficulty('medium', true);
      } else {
        x.set(0);
        y.set(0);
      }
    } else {
      // Swipe horizontal
      if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
        if (info.offset.x > 0 || info.velocity.x > 0) {
          setExitDirection('right');
          handleDifficulty('easy', true);
        } else {
          setExitDirection('left');
          handleDifficulty('difficult', true);
        }
      } else {
        x.set(0);
        y.set(0);
      }
    }
  };

  const handleDragStart = () => {
    // Pode adicionar lógica aqui se necessário
  };

  const handleDifficulty = async (difficulty: "easy" | "medium" | "difficult", fromSwipe = false) => {
    // CRÍTICO: Bloquear votos duplicados
    if (hasVoted) {
      return;
    }

    if (!currentCard) return;

    // CRÍTICO: Marcar como votado imediatamente
    setHasVoted(true);

    // CRÍTICO: Feedback visual imediato
    setShowFeedback(difficulty);
    setTimeout(() => setShowFeedback(null), 600);

    try {
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

      // Se foi swipe, animar saída antes de mudar
      if (fromSwipe) {
        setIsExiting(true);
        setTimeout(() => {
          if (currentCardIndex < flashcardsWithColor.length - 1) {
            setCurrentCardIndex((i) => i + 1);
          } else {
            toast({
              title: "Revisão concluída!",
              description: `Você revisou ${flashcardsWithColor.length} flashcards.`,
            });
            navigateToHome();
          }
        }, 600);
      } else {
        // Se foi botão, delay menor
        setTimeout(() => {
          if (currentCardIndex < flashcardsWithColor.length - 1) {
            setCurrentCardIndex((i) => i + 1);
          } else {
            toast({
              title: "Revisão concluída!",
              description: `Você revisou ${flashcardsWithColor.length} flashcards.`,
            });
            navigateToHome();
          }
        }, 500);
      }
    } catch (err) {
      toast({
        title: "Erro ao registrar revisão",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      // Resetar estado em caso de erro
      setHasVoted(false);
      setShowFeedback(null);
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
          {/* CRÍTICO: Card com gestos de swipe estilo Tinder */}
          <div className="relative w-full aspect-video mb-6 perspective-1000">
            <AnimatePresence mode="wait">
              {!isExiting && currentCard && (
                <motion.div
                  key={`card-${currentCardIndex}`}
                  drag={isFlipped && !hasVoted ? true : false} // CRÍTICO: Permite arrastar em todas as direções após virar o card E se ainda não votou
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrag={(_event, info) => {
                    // Atualiza valores de movimento para feedback visual
                    x.set(info.offset.x);
                    y.set(info.offset.y);
                    
                    // Detecta direção do swipe em tempo real
                    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
                      // Movimento vertical
                      if (info.offset.y < -30) {
                        setSwipeDirection(null);
                      } else {
                        setSwipeDirection(null);
                      }
                    } else {
                      // Movimento horizontal
                      if (info.offset.x < -50) {
                        setSwipeDirection('left');
                      } else if (info.offset.x > 50) {
                        setSwipeDirection('right');
                      } else {
                        setSwipeDirection(null);
                      }
                    }
                  }}
                  style={{
                    x,
                    y,
                    rotate,
                    opacity,
                  }}
                      initial={{ scale: 0.95, opacity: 0, rotate: -5, x: 0, y: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotate: 0, 
                    x: 0,  // CRÍTICO: Sempre força para o centro
                    y: 0   // CRÍTICO: Sempre força para o centro
                  }}
                  exit={{
                    x: exitDirection === 'left' ? -400 : exitDirection === 'right' ? 400 : 0,
                    y: exitDirection === 'up' ? -400 : 0,
                    opacity: 0,
                    scale: 0.85,
                    rotate: exitDirection === 'left' ? -20 : exitDirection === 'right' ? 20 : 0,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100,  // Mais suave - menor rigidez
                    damping: 25,     // Mais amortecido para movimento mais suave
                    mass: 0.8,       // Mais leve para movimento mais natural
                  }}
                  className={`w-full h-full ${isFlipped ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                >
                  <div 
                    className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={handleFlip}
                  >
                    <Card 
                      className="flip-card-front absolute w-full h-full backface-hidden shadow-xl border-2"
                      style={{ borderColor: deckColor }}
                    >
                      <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center relative">
                        <div className="mb-4" style={{ color: deckColor }}>
                          <HelpCircle className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4" data-testid="text-question">
                          {currentCard?.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isFlipped ? "Arraste para marcar dificuldade" : "Clique para revelar a resposta"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 shadow-xl border-2"
                      style={cardStyle}
                    >
                      <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center relative">
                        <div className="mb-4">
                          <Lightbulb className="text-white h-8 w-8 drop-shadow-lg" />
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-white mb-4 drop-shadow-lg px-4 sm:px-0 mt-8 sm:mt-0" data-testid="text-answer">
                          {currentCard?.answer}
                        </h3>
                        <p className="text-xs text-white/80 mb-2 px-4 sm:px-0">
                          {hasVoted ? "Dificuldade marcada! Aguarde o próximo card..." : "Arraste para marcar dificuldade"}
                        </p>
                        
                        {/* CRÍTICO: Indicadores de swipe nas bordas - mais transparentes e nas extremidades */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {/* Indicador esquerda - Difícil - Nas bordas laterais */}
                          <motion.div
                            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-2"
                            animate={{ 
                              opacity: swipeDirection === 'left' ? 0.9 : 0.25,
                              scale: swipeDirection === 'left' ? 1.15 : 0.9,
                              x: swipeDirection === 'left' ? 5 : 0
                            }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          >
                            <div className="px-2 sm:px-3 py-1 sm:py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg font-semibold text-xs shadow-lg flex items-center gap-1 border border-white/20">
                              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Difícil</span>
                            </div>
                            <motion.div
                              animate={{ x: [-3, 3, -3] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="text-white/60"
                            >
                              <Hand className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                            </motion.div>
                          </motion.div>

                          {/* Indicador direita - Fácil - Nas bordas laterais */}
                          <motion.div
                            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-2"
                            animate={{ 
                              opacity: swipeDirection === 'right' ? 0.9 : 0.25,
                              scale: swipeDirection === 'right' ? 1.15 : 0.9,
                              x: swipeDirection === 'right' ? -5 : 0
                            }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          >
                            <div className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600/90 backdrop-blur-sm text-white rounded-lg font-semibold text-xs shadow-lg flex items-center gap-1 border border-white/20">
                              <span className="hidden sm:inline">Fácil</span>
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <motion.div
                              animate={{ x: [3, -3, 3] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="text-white/60"
                            >
                              <Hand className="h-4 w-4 sm:h-5 sm:w-5 -rotate-90" />
                            </motion.div>
                          </motion.div>

                          {/* Indicador topo - Médio - Mais transparente e menor */}
                          <motion.div
                            className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
                            animate={{ 
                              opacity: (Math.abs(y.get()) < -30) ? 0.9 : 0.25,
                              y: [0, -3, 0],
                              scale: (Math.abs(y.get()) < -30) ? 1.1 : 0.9
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <motion.div
                              className="px-2 sm:px-3 py-1 bg-yellow-500/90 backdrop-blur-sm text-white rounded-lg font-semibold text-xs shadow-lg flex items-center gap-1 border border-white/20"
                              animate={{
                                opacity: (Math.abs(y.get()) < -30) ? 1 : 0.8,
                              }}
                            >
                              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Médio</span>
                              <span className="sm:hidden">Médio</span>
                            </motion.div>
                            <motion.div
                              animate={{ y: [-2, 2, -2] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                              className="text-white/50"
                            >
                              <Hand className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* CRÍTICO: Indicadores de swipe no centro quando arrastando */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                          <motion.div
                            animate={{ 
                              opacity: swipeDirection === 'left' ? 1 : 0,
                              scale: swipeDirection === 'left' ? 1 : 0.8
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-xl flex items-center gap-2"
                          >
                            <ArrowLeft className="h-5 w-5" />
                            Difícil
                          </motion.div>
                          <motion.div
                            animate={{ 
                              opacity: swipeDirection === 'right' ? 1 : 0,
                              scale: swipeDirection === 'right' ? 1 : 0.8
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow-xl flex items-center gap-2"
                          >
                            Fácil
                            <ArrowRight className="h-5 w-5" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* CRÍTICO: Feedback visual ao marcar dificuldade */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <motion.div
                    className={`px-8 py-4 rounded-2xl shadow-2xl text-white font-bold text-2xl ${
                      showFeedback === 'easy' ? 'bg-green-500' :
                      showFeedback === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {showFeedback === 'easy' && <Check className="h-12 w-12 mx-auto mb-2" />}
                    {showFeedback === 'medium' && <Minus className="h-12 w-12 mx-auto mb-2" />}
                    {showFeedback === 'difficult' && <X className="h-12 w-12 mx-auto mb-2" />}
                    {showFeedback === 'easy' ? 'Fácil!' : showFeedback === 'medium' ? 'Médio!' : 'Difícil!'}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
                      disabled={hasVoted}
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
                      disabled={hasVoted}
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
                      disabled={hasVoted}
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

          {/* Estatísticas da sessão de revisão */}
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
