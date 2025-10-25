import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import {
  useFlashcardSets,
  useUpdateFlashcardSet,
  useDeleteFlashcardSet,
} from "../hooks/useFlashcards";
import { flashcardsApi } from "../api";
import type { Flashcard } from "../types";
import { Trash2, Loader2, BookOpen, Play, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    if (
      window.confirm(
        "Tem certeza que deseja deletar este deck? Esta ação não pode ser desfeita."
      )
    ) {
      deleteDeck.mutate(deckId, {
        onSuccess: () => toast({ title: "Deck deletado com sucesso!" }),
        onError: (error: any) =>
          toast({
            title: "Erro ao deletar deck",
            description: error.message || "Ocorreu um erro. Tente novamente.",
            variant: "destructive",
          }),
      });
    }
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
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Loader2 className="animate-spin h-8 w-8 mb-3" />
              <p className="text-sm">Carregando decks...</p>
            </div>
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
                  <motion.div
                    key={deck.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-card/40 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      {editingDeckId === deck.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="flex-1 text-sm"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSaveEdit(deck.id)}
                            disabled={updateDeck.isLoading}
                          >
                            {updateDeck.isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => setEditingDeckId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <h3 className="font-medium text-sm text-foreground">
                            {deck.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Criado em{" "}
                            {new Date(deck.created_at || "").toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() => handleStudyDeck(deck.id)}
                      >
                        <Play className="h-4 w-4 mr-1" /> Estudar
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => handleEditDeck(deck.id, deck.title)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteDeck(deck.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
