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
  Check,
  ArrowRight,
  ArrowUp,
  Hand
} from "lucide-react";
import { TooltipProvider } from "./ui/tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { motion, useMotionValue, useTransform, AnimatePresence, useMotionValueEvent } from "framer-motion";
import type { PanInfo } from "framer-motion";

interface StudyModeProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export default function StudyMode({ flashcards, onBack }: StudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(new Date());
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showFeedback, setShowFeedback] = useState<'easy' | 'medium' | 'difficult' | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true); // Mostrar dica de swipe inicialmente
  const [hasVoted, setHasVoted] = useState(false); // CRÍTICO: Controla se já votou no card atual
  
  const { toast } = useToast();
  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;
  
  // Pega a cor do deck do primeiro flashcard (todos do mesmo deck têm a mesma cor)
  const deckColor = flashcards[0]?.color || "#3B82F6"; // Azul padrão
  const cardStyle = {
    backgroundColor: deckColor,
    borderColor: deckColor,
  };
  
  // CRÍTICO: Valores de movimento para gestos de swipe
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // CRÍTICO: Transformações baseadas no movimento
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);
  
  // CRÍTICO: Atualizar direção do swipe em tempo real (apenas horizontal)
  // O vertical é tratado no onDrag
  useMotionValueEvent(x, "change", (latest) => {
    // Só atualiza se não houver movimento vertical significativo
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
    // Limpa direção horizontal quando há movimento vertical significativo
    const xValue = x.get();
    if (Math.abs(latest) > 30 && Math.abs(xValue) < 30) {
      setSwipeDirection(null);
    }
  });

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

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'difficult', fromSwipe = false) => {
    // CRÍTICO: Bloquear votos duplicados
    if (hasVoted) {
      return;
    }

    if (!sessionId) {
      toast({
        title: "Aguarde...",
        description: "Preparando sessão de estudo.",
        variant: "destructive"
      });
      return;
    }

    // CRÍTICO: Marcar como votado imediatamente para evitar votos duplicados
    setHasVoted(true);

    // CRÍTICO: Feedback visual imediato
    setShowFeedback(difficulty);
    setTimeout(() => setShowFeedback(null), 600);

    const timeSpent = Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000);
    
    recordReview.mutate({
      flashcardId: currentCard.id,
      sessionId,
      difficulty,
      timeSpent
    });

    updateStats(difficulty);
    
    // Se foi swipe, animar saída antes de mudar
    if (fromSwipe) {
      setIsExiting(true);
      // CRÍTICO: Delay maior para transição mais natural
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
      }, 600); // Aumentado de 300ms para 600ms
    } else {
      // Se foi botão, delay menor
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
    }
  };
  
  // CRÍTICO: Handler para gestos de swipe estilo Tinder
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Thresholds mais baixos para mobile - facilitar swipe para cima
    const swipeThreshold = 80; // Reduzido de 100 para 80
    const velocityThreshold = 400; // Reduzido de 500 para 400
    const verticalSwipeThreshold = 60; // Threshold menor para swipe vertical (mais fácil no mobile)
    
    // Esconder dica após primeiro swipe
    if (showSwipeHint) {
      setShowSwipeHint(false);
    }
    
    // Verifica movimento predominante (vertical ou horizontal)
    const isVerticalSwipe = Math.abs(info.offset.y) > Math.abs(info.offset.x);
    
    if (isVerticalSwipe) {
      // Swipe vertical (para cima ou para baixo)
      if ((Math.abs(info.offset.y) > verticalSwipeThreshold || Math.abs(info.velocity.y) > velocityThreshold) && 
          (info.offset.y < 0 || info.velocity.y < 0)) {
        // Swipe para cima = Médio
        setExitDirection('up');
        handleDifficulty('medium', true);
      } else {
        // Volta para posição original se não passou do threshold
        x.set(0);
        y.set(0);
      }
    } else {
      // Swipe horizontal (para esquerda ou direita)
      if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
        if (info.offset.x > 0 || info.velocity.x > 0) {
          // Swipe para direita = Fácil
          setExitDirection('right');
          handleDifficulty('easy', true);
        } else {
          // Swipe para esquerda = Difícil
          setExitDirection('left');
          handleDifficulty('difficult', true);
        }
      } else {
        // Volta para posição original se não passou do threshold
        x.set(0);
        y.set(0);
      }
    }
  };
  
  // CRÍTICO: Handler para quando começa a arrastar
  const handleDragStart = () => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
    }
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
      // CRÍTICO: Apenas mudar o índice - o useEffect vai resetar tudo automaticamente
      setCurrentCardIndex(currentCardIndex + 1);
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
    // CRÍTICO: Reset completo ao mudar de card - garante que todos os estados são resetados
    resetCard();
    setHasVoted(false);
    setIsExiting(false);
    setExitDirection(null);
    setShowFeedback(null);
    setSwipeDirection(null);
    // CRÍTICO: Reset explícito dos valores de movimento para garantir que voltam ao centro
    // Usa setTimeout para garantir que acontece após o render
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 0);
    // Mostrar dica apenas no primeiro card
    if (currentCardIndex === 0) {
      setShowSwipeHint(true);
    } else {
      setShowSwipeHint(false);
    }
  }, [currentCardIndex, x, y]);

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
              {/* CRÍTICO: Card com gestos de swipe estilo Tinder */}
              <div className="relative w-full aspect-video mb-6 perspective-1000">
                <AnimatePresence mode="wait">
                  {!isExiting && (
                    <motion.div
                      key={currentCardIndex}
                      drag={isFlipped && !hasVoted ? true : false} // CRÍTICO: Permite arrastar em todas as direções após virar o card E se ainda não votou
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.2}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDrag={(_event, info) => {
                        // Atualiza valores de movimento para feedback visual
                        x.set(info.offset.x);
                        y.set(info.offset.y);
                        
                        // Resetar isExiting quando começa a arrastar um novo card
                        if (isExiting) {
                          setIsExiting(false);
                        }
                        
                        // Detecta direção do swipe em tempo real
                        if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
                          // Movimento vertical
                          if (info.offset.y < -30) {
                            setSwipeDirection(null); // Limpa direção horizontal para mostrar indicador vertical
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
                  initial={{ scale: 0.9, opacity: 0, rotate: -10, x: 0, y: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotate: 0, 
                    x: 0,  // CRÍTICO: Sempre força para o centro
                    y: 0   // CRÍTICO: Sempre força para o centro
                  }}
                  exit={{
                    x: exitDirection === 'left' ? -500 : exitDirection === 'right' ? 500 : 0,
                    y: exitDirection === 'up' ? -500 : 0,
                    opacity: 0,
                    scale: 0.8,
                    rotate: exitDirection === 'left' ? -30 : exitDirection === 'right' ? 30 : 0,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, // Reduzido para movimento mais suave e natural
                    damping: 20, // Reduzido para movimento mais suave
                    mass: 1.2, // Adicionado massa para movimento mais pesado/natural
                    duration: 0.8 // Aumentado para transição mais lenta e natural
                  }}
                  // CRÍTICO: Força reset quando a key muda (novo card)
                  key={currentCardIndex}
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
                              {currentCard.question}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isFlipped ? "Arraste para marcar dificuldade" : "Clique para revelar a resposta"}
                            </p>
                            
                            {/* CRÍTICO: Sem indicadores na pergunta - só aparecem na resposta */}
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
                              {currentCard.answer}
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
                                  opacity: swipeDirection === 'left' ? 0.9 : 0.25, // Muito mais transparente quando não ativo
                                  scale: swipeDirection === 'left' ? 1.15 : 0.9,
                                  x: swipeDirection === 'left' ? 5 : 0
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
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
                                  opacity: swipeDirection === 'right' ? 0.9 : 0.25, // Muito mais transparente quando não ativo
                                  scale: swipeDirection === 'right' ? 1.15 : 0.9,
                                  x: swipeDirection === 'right' ? -5 : 0
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
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
                                  opacity: (Math.abs(y.get()) < -30) ? 0.9 : 0.25, // Muito mais transparente quando não ativo
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
                            disabled={!sessionId || isCreatingSession || isRecordingReview || hasVoted}
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
                            disabled={!sessionId || isCreatingSession || isRecordingReview || hasVoted}
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
                            disabled={!sessionId || isCreatingSession || isRecordingReview || hasVoted}
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
