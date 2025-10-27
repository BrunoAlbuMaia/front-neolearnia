import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useReviews } from "../hooks/useReviews";
import { reviewApi } from "../api/reviewApi";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
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
  Check,
} from "lucide-react";

export default function ReviewMode() {
  const [, setLocation] = useLocation();
  const { data: flashcards, isLoading, error } = useReviews();
  const { toast } = useToast();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ easy: 0, medium: 0, difficult: 0 });

  const navigateToHome = () => setLocation("/");

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar revisões",
        description: "Não foi possível carregar os flashcards.",
        variant: "destructive",
      });
    }
  }, [error]);

  if (isLoading) return <div className="p-6 text-center">Carregando revisões...</div>;
  if (!flashcards || flashcards.length === 0)
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
  
  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleDifficulty = async (difficulty: "easy" | "medium" | "difficult") => {
    try {
      console.log(currentCard)
      await reviewApi.recordCardReview({
        flashcardId: currentCard.flashcard_id,
        difficulty:difficulty,
      });

      setStats((prev) => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

      if (currentCardIndex < flashcards.length - 1) {
        setTimeout(() => {
          setCurrentCardIndex((i) => i + 1);
          setIsFlipped(false);
        }, 300);
      } else {
        toast({
          title: "Revisão concluída!",
          description: `Você revisou ${flashcards.length} flashcards.`,
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
        <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
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
              {currentCardIndex + 1} / {flashcards.length}
            </span>
            <div className="w-full sm:w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col justify-center items-center px-4 py-6">
        <div className="w-full max-w-2xl text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Deck: <span className="font-medium text-foreground">{currentCard.name_deck}</span>
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="flip-card w-full aspect-video mb-6 perspective-1000">
            <div
              className={`flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              <Card className="flip-card-front absolute w-full h-full backface-hidden shadow-xl">
                <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <HelpCircle className="text-primary h-8 w-8 mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">
                    {currentCard.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">Clique para revelar a resposta</p>
                </CardContent>
              </Card>

              <Card className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 bg-primary border-primary shadow-xl">
                <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <Lightbulb className="text-primary-foreground h-8 w-8 mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-primary-foreground mb-4">
                    {currentCard.answer}
                  </h3>
                </CardContent>
              </Card>
            </div>
          </div>

          {isFlipped && (
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
              <Button
                className="bg-red-500 text-white"
                size="sm"
                onClick={() => handleDifficulty("difficult")}
              >
                <X className="mr-1 h-3 w-3" /> Difícil
              </Button>
              <Button
                className="bg-amber-500 text-white"
                size="sm"
                onClick={() => handleDifficulty("medium")}
              >
                <Minus className="mr-1 h-3 w-3" /> Médio
              </Button>
              <Button
                className="bg-emerald-500 text-white"
                size="sm"
                onClick={() => handleDifficulty("easy")}
              >
                <Check className="mr-1 h-3 w-3" /> Fácil
              </Button>
            </div>
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
              onClick={() => setCurrentCardIndex((i) => Math.min(i + 1, flashcards.length - 1))}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
