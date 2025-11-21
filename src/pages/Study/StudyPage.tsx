import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import StudyMode from "../../components/StudyMode";
import QuizMode from "../../components/QuizMode";
import { flashcardsApi, quizzesApi } from "../../api";
import { useFlashcardSets } from "../../hooks/useFlashcards";
import { Spinner } from "../../components/ui/spinner";
import { useToast } from "../../hooks/use-toast";
import type { Flashcard } from "../../../shared/schema";
import type { Quiz } from "../../types";

interface StudyPageProps {
  deckId: string;
}

export default function StudyPage({ deckId }: StudyPageProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deckColor, setDeckColor] = useState<string>("#3B82F6");
  const [loading, setLoading] = useState(true);
  const [isQuiz, setIsQuiz] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    // Aguardar carregamento dos decks antes de verificar tipo
    if (isLoadingDecks) {
      return;
    }

    const loadDeckContent = async () => {
      try {
        setLoading(true);
        
        // Buscar informações do deck primeiro para verificar o tipo
        const deck = decks.find((d) => d.id === deckId);
        
        if (!deck) {
          toast({
            title: "Deck não encontrado",
            description: "Não foi possível encontrar o deck selecionado.",
            variant: "destructive",
          });
          setLocation("/");
          return;
        }

        // Verificar se é quiz ou flashcard
        const deckIsQuiz = deck.type === 'quiz';
        setIsQuiz(deckIsQuiz);
        setDeckColor(deck.color || "#3B82F6");

        if (deckIsQuiz) {
          // Buscar quizzes
          const quizData = await quizzesApi.getQuizzesBySetId(deckId);
          if (quizData.length === 0) {
            toast({
              title: "Nenhum quiz encontrado",
              description: "Este deck não contém quizzes ainda.",
              variant: "destructive",
            });
            setLocation("/");
            return;
          }
          setQuizzes(quizData);
        } else {
          // Buscar flashcards
          const flashcardData = await flashcardsApi.getFlashcardsBySetId(deckId);
          if (flashcardData.length === 0) {
            toast({
              title: "Nenhum flashcard encontrado",
              description: "Este deck não contém flashcards ainda.",
              variant: "destructive",
            });
            setLocation("/");
            return;
          }
          setFlashcards(flashcardData);
        }
      } catch (error: any) {
        toast({
          title: `Erro ao carregar conteúdo`,
          description: error.message || `Não foi possível carregar o conteúdo do deck.`,
          variant: "destructive",
        });
        setLocation("/");
      } finally {
        setLoading(false);
      }
    };

    if (deckId && decks.length > 0) {
      loadDeckContent();
    }
  }, [deckId, user, setLocation, toast, decks, isLoadingDecks]);

  const handleBack = () => {
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text={`Carregando ${isQuiz ? 'quiz' : 'flashcards'}...`} />
      </div>
    );
  }

  // Renderizar QuizMode se for quiz
  if (isQuiz && quizzes.length > 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <QuizMode quizzes={quizzes} onBack={handleBack} deckColor={deckColor} />
      </div>
    );
  }

  // Renderizar StudyMode se for flashcard
  if (!isQuiz && flashcards.length > 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyMode flashcards={flashcards} onBack={handleBack} />
      </div>
    );
  }

  return null; // Redirecionamento já foi tratado
}

