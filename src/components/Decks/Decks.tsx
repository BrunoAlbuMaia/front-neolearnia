import { useState, useMemo } from "react";
import { useLocation } from "wouter";
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
import type { FlashcardSet, Quiz } from "../../types";
import { BookOpen, Search, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import DeckItem from "./DeckItem";
import { Spinner } from "../ui/spinner";
import { DeckManager } from "../DeckManager";
import { useDebounce } from "../../hooks/useDebounce";
import { EmptyState } from "../ui/empty-state";
import { SkeletonCard } from "../ui/skeleton-card";
import { H3 } from "../ui/typography";

interface DecksProps {
  onStartStudy?: (flashcards: Flashcard[]) => void; // Opcional para compatibilidade
  onStartQuiz?: (quizzes: Quiz[], deckColor?: string) => void; // Opcional para compatibilidade
}

const DECKS_PER_PAGE = 5;

export default function Decks({ onStartStudy, onStartQuiz }: DecksProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const deleteDeck = useDeleteFlashcardSet();
  const updateDeck = useUpdateFlashcardSet();
  
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [managingDeckId, setManagingDeckId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Debounce da busca para melhor performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filtrar decks por nome (com debounce)
  const filteredDecks = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return decks;
    }
    return decks.filter((deck: FlashcardSet) =>
      deck.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [decks, debouncedSearchQuery]);

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

      // Verificar se é quiz ou flashcard
      const isQuiz = deck.type === 'quiz';
      
      if (isQuiz) {
        // Buscar quizzes para validar
        const quizzes = await quizzesApi.getQuizzesBySetId(deckId);
        
        if (quizzes.length === 0) {
          toast({
            title: "Nenhum quiz encontrado",
            description: "Este deck não contém quizzes ainda.",
            variant: "destructive",
          });
          return;
        }
        
        // Usar rota diretamente - StudyPage vai detectar que é quiz e renderizar QuizMode
        setLocation(`/study/${deckId}`);
        
        // Se houver callback específico para quiz (compatibilidade), também chamar
        if (onStartQuiz) {
          onStartQuiz(quizzes, deck?.color || "#3B82F6");
        }
      } else {
        // Buscar flashcards para validar
        const flashcards = await flashcardsApi.getFlashcardsBySetId(deckId);
        
        if (flashcards.length === 0) {
          toast({
            title: "Nenhum flashcard encontrado",
            description: "Este deck não contém flashcards ainda.",
            variant: "destructive",
          });
          return;
        }
        
        // Usar rota diretamente - StudyPage vai detectar que é flashcard e renderizar StudyMode
        setLocation(`/study/${deckId}`);
        
        // Se houver callback (compatibilidade), também chamar
        if (onStartStudy) {
          onStartStudy(flashcards);
        }
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
      <Card className="border-2 border-primary/20 shadow-xl hover-lift w-full bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden">
        {/* Efeito de brilho sutil */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-50" />
        
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-6 relative z-10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center">
            <div className="p-2 rounded-lg bg-primary mr-3">
              <BookOpen className="text-primary-foreground h-5 w-5 shrink-0" />
            </div>
            <H3>Seus Decks</H3>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="shrink-0 gradient-primary text-white shadow-lg hover:shadow-xl glow-primary hover-lift"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Deck
            </Button>
            {searchQuery && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                {filteredDecks.length} de {decks.length}
              </span>
            )}
            <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {/* Barra de Pesquisa - Mais Vibrante */}
          {!isLoadingDecks && decks.length > 0 && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                  <Search className="h-4 w-4 text-primary" />
                </div>
              </div>
              <Input
                type="text"
                placeholder="Pesquisar decks por nome..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-10 border-2 border-primary/20 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 bg-gradient-to-r from-background to-primary/5"
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
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : decks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhum deck criado ainda"
              description="Comece criando seu primeiro deck de flashcards ou quiz para começar a estudar!"
              action={{
                label: "Criar Primeiro Deck",
                onClick: () => setShowCreateDialog(true)
              }}
            />
          ) : filteredDecks.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum deck encontrado"
              description="Tente pesquisar com outros termos ou criar um novo deck."
              action={{
                label: "Criar Novo Deck",
                onClick: () => setShowCreateDialog(true)
              }}
            />
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
