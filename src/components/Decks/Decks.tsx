import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import {
  useFlashcardSets,
  useUpdateFlashcardSet,
  useDeleteFlashcardSet,
} from "../../hooks/useFlashcards";
import { flashcardsApi } from "../../api";
import type { Flashcard } from "../../types";
import { BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DeckItem from "./DeckItem";
import { Spinner } from "../ui/spinner";

interface DecksProps {
  onStartStudy: (flashcards: Flashcard[]) => void;
}

export default function Decks({ onStartStudy }: DecksProps) {
  const { toast } = useToast();
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const deleteDeck = useDeleteFlashcardSet();
  const updateDeck = useUpdateFlashcardSet();
  
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

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
      const flashcards = await flashcardsApi.getFlashcardsBySetId(deckId);
      if (flashcards.length === 0) {
        toast({
          title: "Nenhum flashcard encontrado",
          description: "Este deck não contém flashcards ainda.",
          variant: "destructive",
        });
        return;
      }
      onStartStudy(flashcards);
    } catch {
      toast({
        title: "Erro ao carregar flashcards",
        description: "Não foi possível carregar os flashcards do deck.",
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



  return (
    <div className="space-y-5">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold">
            <BookOpen className="text-primary mr-2 h-5 w-5" />
            Seus Decks
          </CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {decks.length} decks
          </span>
        </CardHeader>

        <CardContent>
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
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {decks.map((deck) => (
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
                    isSaving={updateDeck.isLoading}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
