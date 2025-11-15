import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { useFlashcardsBySet, useDeleteFlashcard } from "../hooks/useFlashcards";
import { useQuizzesBySet, useDeleteQuiz } from "../hooks/useQuizzes";
import { FlashcardForm } from "./FlashcardForm";
import { QuizForm } from "./QuizForm";
import { Plus, Edit2, Trash2, ArrowLeft, HelpCircle, CheckCircle2 } from "lucide-react";
import type { Flashcard, Quiz, FlashcardSet } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

interface DeckManagerProps {
  deck: FlashcardSet;
  onBack: () => void;
}

export function DeckManager({ deck, onBack }: DeckManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isQuiz = deck.type === 'quiz';
  
  const { data: flashcards = [], refetch: refetchFlashcards } = useFlashcardsBySet(deck.id);
  const { data: quizzes = [], refetch: refetchQuizzes } = useQuizzesBySet(deck.id);
  const deleteFlashcardMutation = useDeleteFlashcard();
  const deleteQuizMutation = useDeleteQuiz();
  
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const handleCreateFlashcard = () => {
    setEditingFlashcard(null);
    setShowFlashcardForm(true);
  };

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setShowFlashcardForm(true);
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setShowQuizForm(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleSuccess = () => {
    if (isQuiz) {
      queryClient.invalidateQueries({ queryKey: ['quizzes', deck.id] });
      refetchQuizzes();
    } else {
      queryClient.invalidateQueries({ queryKey: ['flashcards', deck.id] });
      refetchFlashcards();
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: deck.id,
        flashcardId,
      });
      
      toast({
        title: "Flashcard deletado",
        description: "O flashcard foi removido com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['flashcards', deck.id] });
      refetchFlashcards();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar o flashcard. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuizMutation.mutateAsync({
        setId: deck.id,
        quizId,
      });
      
      toast({
        title: "Quiz deletado",
        description: "O quiz foi removido com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['quizzes', deck.id] });
      refetchQuizzes();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar o quiz. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const items = isQuiz ? quizzes : flashcards;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">{deck.title}</h1>
              <p className="text-sm text-muted-foreground">
                {isQuiz ? `${quizzes.length} ${quizzes.length === 1 ? 'quiz' : 'quizzes'}` : `${flashcards.length} ${flashcards.length === 1 ? 'flashcard' : 'flashcards'}`}
              </p>
            </div>
          </div>
          <Button 
            onClick={isQuiz ? handleCreateQuiz : handleCreateFlashcard}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar {isQuiz ? "Quiz" : "Flashcard"}
          </Button>
        </div>

        {/* Lista de Itens */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum {isQuiz ? "quiz" : "flashcard"} ainda.
              </p>
              <Button onClick={isQuiz ? handleCreateQuiz : handleCreateFlashcard}>
                <Plus className="h-4 w-4 mr-2" />
                Criar o primeiro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {isQuiz
              ? quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <h3 className="font-semibold text-base leading-snug">{quiz.question}</h3>
                          </div>
                          <div className="space-y-2 ml-7">
                            {quiz.options.map((opt, idx) => (
                              <div
                                key={opt.id || idx}
                                className={`flex items-start gap-2 text-sm ${
                                  opt.is_correct
                                    ? "text-green-600 dark:text-green-400 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span className="font-semibold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                                <span className="flex-1">{opt.text}</span>
                                {opt.is_correct && <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditQuiz(quiz)}
                            className="shrink-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <p className="text-sm font-medium mb-4">
                                Tem certeza que deseja deletar este quiz?
                                <br />
                                <span className="text-muted-foreground">Esta ação não pode ser desfeita.</span>
                              </p>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : flashcards.map((flashcard) => (
                  <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <h3 className="font-semibold text-base leading-snug">{flashcard.question}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground ml-7 leading-relaxed">
                            {flashcard.answer}
                          </p>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditFlashcard(flashcard)}
                            className="shrink-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <p className="text-sm font-medium mb-4">
                                Tem certeza que deseja deletar este flashcard?
                                <br />
                                <span className="text-muted-foreground">Esta ação não pode ser desfeita.</span>
                              </p>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFlashcard(flashcard.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        )}

        {/* Forms */}
        {showFlashcardForm && (
          <FlashcardForm
            setId={deck.id}
            flashcard={editingFlashcard || undefined}
            onSuccess={handleSuccess}
            onClose={() => {
              setShowFlashcardForm(false);
              setEditingFlashcard(null);
            }}
          />
        )}

        {showQuizForm && (
          <QuizForm
            setId={deck.id}
            quiz={editingQuiz || undefined}
            onSuccess={handleSuccess}
            onClose={() => {
              setShowQuizForm(false);
              setEditingQuiz(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

