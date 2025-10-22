import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets,useUpdateFlashcardSet, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import { flashcardsApi } from "../api";
import type { Flashcard } from "../types";
import {  Trash2, Loader2, BookOpen, Play,Edit2 } from "lucide-react";


interface DecksProps {
    onStartStudy: (flashcards: Flashcard[]) => void;
}
  

export default function Decks({ 
    onStartStudy, 
  }: DecksProps) {

    const { toast } = useToast();
    const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
    const deleteDeck = useDeleteFlashcardSet();

    const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState("");
    const updateDeck = useUpdateFlashcardSet();

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
        } catch (error) {
        toast({
            title: "Erro ao carregar flashcards",
            description: "Não foi possível carregar os flashcards do deck.",
            variant: "destructive",
        });
        }
    };
    const handleDeleteDeck = (deckId: string) => {
        if (window.confirm("Tem certeza que deseja deletar este deck? Esta ação não pode ser desfeita.")) {
        deleteDeck.mutate(deckId, {
            onSuccess: () => {
            toast({
                title: "Deck deletado com sucesso!",
            });
            },
            onError: (error: any) => {
            toast({
                title: "Erro ao deletar deck",
                description: error.message || "Ocorreu um erro. Tente novamente.",
                variant: "destructive",
            });
            },
        });
        }
    };
  

    return (
        <div className="space-y-4">
        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
            <BookOpen className="text-primary mr-2 h-5 w-5" />
            Seus Decks
            </CardTitle>
            <span
            className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full"
            data-testid="text-deck-count"
            >
            {decks.length} decks
            </span>
        </CardHeader>
        <CardContent>
            {isLoadingDecks ? (
            <div className="text-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                Carregando decks...
                </p>
            </div>
            ) : decks.length === 0 ? (
            <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-4">
                Você ainda não criou nenhum deck.
                </p>
                <p className="text-xs text-muted-foreground">
                Cole um conteúdo acima para criar seu primeiro deck!
                </p>
            </div>
            ) : (
                <div className="space-y-3">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      {editingDeckId === deck.id ? (
                        <>
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(deck.id)}
                              disabled={updateDeck.isLoading}
                            >
                              {updateDeck.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingDeckId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-foreground">{deck.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Criado em {new Date(deck.created_at || "").toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
              
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                      
                      <Button size="sm" onClick={() => handleStudyDeck(deck.id)}>
                        <Play className="h-4 w-4 mr-1" /> Estudar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDeck(deck.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {editingDeckId !== deck.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDeck(deck.id, deck.title)}
                        >
                        <Edit2></Edit2>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
            )}
        </CardContent>
        </Card>
    </div>


    )
}