import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import {
  useFlashcardSets,
  useUpdateFlashcardSet,
  useDeleteFlashcardSet,
} from "../../hooks/useFlashcards";
import { CreateDeckDialog } from "../CreateDeckDialog";
import { flashcardsApi, quizzesApi } from "../../api";
import type { FlashcardSet } from "../../types";
import type { Flashcard, Quiz } from "../../types";
import { BookOpen, Search, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import DeckItem from "./DeckItem";
import { Spinner } from "../ui/spinner";
import { DeckManager } from "../DeckManager";

interface DecksProps {
  onStartStudy: (flashcards: Flashcard[]) => void;
  onStartQuiz?: (quizzes: Quiz[], deckColor?: string) => void;
}

const DECKS_PER_PAGE = 5;

export default function Decks({ onStartStudy, onStartQuiz }: DecksProps) {
  const { toast } = useToast();
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const deleteDeck = useDeleteFlashcardSet();
  const updateDeck = useUpdateFlashcardSet();
  
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [managingDeckId, setManagingDeckId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filtrar decks por nome
  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) {
      return decks;
    }
    return decks.filter((deck: any) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [decks, searchQuery]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredDecks.length / DECKS_PER_PAGE);
  const startIndex = (currentPage - 1) * DECKS_PER_PAGE;
  const endIndex = startIndex + DECKS_PER_PAGE;
  const paginatedDecks = filteredDecks.slice(startIndex, endIndex);

  // Resetar página quando a pesquisa mudar
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleEditDeck = (deckId: string, currentTitle: string) => {
    setEditingDeckId(deckId);
    setEditedTitle(currentTitle);
  };

  const handleSaveEdit = async (deckId: string) => {
    try {
      await updateDeck.mutateAsync({ setId: deckId, title: editedTitle });
      toast({ title: "Título atualizado com sucesso!" });
      setEditingDeckId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar título",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleStudyDeck = async (deckId: string) => {
    try {
      // Buscar informações do deck primeiro para verificar o tipo
      const deck = decks.find((d: FlashcardSet) => d.id === deckId);
      
      if (!deck) {
        toast({
          title: "Deck não encontrado",
          description: "Não foi possível encontrar o deck selecionado.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se é quiz ou flashcard e buscar os dados apropriados
      const isQuiz = deck.type === 'quiz';
      
      if (isQuiz) {
        // Buscar quizzes e passar diretamente para QuizMode
        const quizzes = await quizzesApi.getQuizzesBySetId(deckId);
        
        if (quizzes.length === 0) {
          toast({
            title: "Nenhum quiz encontrado",
            description: "Este deck não contém quizzes ainda.",
            variant: "destructive",
          });
          return;
        }
        
        // Se houver callback específico para quiz, usar ele
        if (onStartQuiz) {
          onStartQuiz(quizzes, deck?.color || "#3B82F6");
        } else {
          // Fallback: converter para flashcard (compatibilidade)
          const items = quizzes.map((quiz: Quiz) => ({
            id: quiz.id,
            question: quiz.question,
            answer: quiz.correct_answer,
            set_id: quiz.set_id,
            review_count: 0,
            created_at: quiz.created_at,
            created_by: quiz.created_by || '',
            updated_at: quiz.updated_at,
            updated_by: quiz.updated_by,
            type: 'quiz' as const,
            alternatives: quiz.alternatives,
            correct_answer: quiz.correct_answer,
            color: deck?.color || "#3B82F6",
          }));
          onStartStudy(items);
        }
      } else {
        // Buscar flashcards normalmente
        const flashcards = await flashcardsApi.getFlashcardsBySetId(deckId);
        
        if (flashcards.length === 0) {
          toast({
            title: "Nenhum flashcard encontrado",
            description: "Este deck não contém flashcards ainda.",
            variant: "destructive",
          });
          return;
        }
        
        // Adicionar cor do deck aos flashcards
        const items = flashcards.map(card => ({
          ...card,
          color: deck?.color || "#3B82F6",
        }));
        
        onStartStudy(items);
      }
    } catch (error: any) {
      const deck = decks.find((d: FlashcardSet) => d.id === deckId);
      const isQuiz = deck?.type === 'quiz';
      toast({
        title: `Erro ao carregar ${isQuiz ? 'quizzes' : 'flashcards'}`,
        description: error.message || `Não foi possível carregar os ${isQuiz ? 'quizzes' : 'flashcards'} do deck.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck.mutate(deckId, {
      onSuccess: () => toast({ title: "Deck deletado com sucesso!" }),
      onError: (error: any) =>
        toast({
          title: "Erro ao deletar deck",
          description: error.message || "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        }),
    });
  };

  const handleManageDeck = (deckId: string) => {
    setManagingDeckId(deckId);
  };

  const handleBackFromManage = () => {
    setManagingDeckId(null);
  };

  // Se estiver gerenciando um deck, mostrar o DeckManager
  if (managingDeckId) {
    const deck = decks.find((d: FlashcardSet) => d.id === managingDeckId);
    if (deck) {
      return <DeckManager deck={deck} onBack={handleBackFromManage} />;
    }
  }

  return (
    <div className="space-y-5 w-full">
      <Card className="border-border/50 shadow-sm w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-6">
          <CardTitle className="flex items-center text-lg md:text-xl font-semibold">
            <BookOpen className="text-primary mr-2 h-5 w-5 shrink-0" />
            Seus Decks
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Deck
            </Button>
            {searchQuery && (
              <span className="text-xs text-muted-foreground">
                {filteredDecks.length} de {decks.length}
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6">
          {/* Barra de Pesquisa */}
          {!isLoadingDecks && decks.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar decks por nome..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Lista de Decks */}
          {isLoadingDecks ? (
            <Spinner size="lg" text="Carregando decks..." className="py-10" />
          ) : decks.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Você ainda não criou nenhum deck.
              </p>
              <p className="text-xs text-muted-foreground">
                Cole um conteúdo acima para criar seu primeiro.
              </p>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="text-center py-10">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Nenhum deck encontrado
              </p>
              <p className="text-xs text-muted-foreground">
                Tente pesquisar com outros termos.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {paginatedDecks.map((deck) => (
                    <DeckItem
                      key={deck.id}
                      deck={deck}
                      isEditing={editingDeckId === deck.id}
                      editedTitle={editedTitle}
                      setEditedTitle={setEditedTitle}
                      onSave={() => handleSaveEdit(deck.id)}
                      onCancel={() => setEditingDeckId(null)}
                      onEdit={() => handleEditDeck(deck.id, deck.title)}
                      onDelete={() => handleDeleteDeck(deck.id)}
                      onStudy={() => handleStudyDeck(deck.id)}
                      onManage={() => handleManageDeck(deck.id)}
                      isSaving={updateDeck.isPending}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredDecks.length)} de {filteredDecks.length}
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Página {currentPage} de {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar deck manualmente */}
      <CreateDeckDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setCurrentPage(1); // Reset para primeira página
        }}
      />
    </div>
  );
}
