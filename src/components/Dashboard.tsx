import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets, useGenerateFlashcards, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import { flashcardsApi } from "../api";
import type { Flashcard } from "../types";
import PdfPreviewer from "./ui/pdfPreviewer";
import { ClipboardType, Wand2, Trash2, Loader2, BookOpen, Play, Plus } from "lucide-react";
import Navbar from "./ui/navbar";

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onStartStudy: (flashcards: Flashcard[]) => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToDeck?: (deckId: string) => void;
}

export default function Dashboard({ 
  user, 
  onLogout, 
  onStartStudy, 
  onNavigateToAnalytics 
}: DashboardProps) {
  const [studyContent, setStudyContent] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const { toast } = useToast();
  
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const generateFlashcards = useGenerateFlashcards();
  const deleteDeck = useDeleteFlashcardSet();

  const handleGenerate = () => {
    if (!studyContent.trim()) {
      toast({
        title: "Conteúdo necessário",
        description: "Por favor, cole algum conteúdo para gerar flashcards.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDeckId && !newDeckTitle.trim()) {
      toast({
        title: "Nenhum deck selecionado",
        description: "Por favor, escolha um deck existente ou dê um nome para um novo deck.",
        variant: "destructive",
      });
      return;
    }

    const deckTitle = newDeckTitle.trim() 
      ? newDeckTitle.trim() 
      : (selectedDeckId ? undefined : `Flashcards - ${new Date().toLocaleDateString()}`);

    generateFlashcards.mutate(
      {
        text: studyContent,
        setId: selectedDeckId || undefined,
        title: deckTitle,
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Flashcards gerados com sucesso!",
            description: `${data.flashcards.length} flashcards foram criados para o deck "${data.flashcardSet.title}".`,
          });
          setStudyContent("");
          setNewDeckTitle("");
          setSelectedDeckId(null);
          setShowNewDeckInput(false);
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao gerar flashcards",
            description: error.message || "Ocorreu um erro. Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudyContent("");
      setPdfFile(file);
      setIsPdfModalOpen(true);
    }
  };

  const handlePdfConfirm = (pages: number[]) => {
    setSelectedPages(pages);
    setIsPdfModalOpen(false);
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
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onNavigateToAnalytics={onNavigateToAnalytics} 
      />
      
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="w-full max-w-4xl h-[90vh] p-0 flex flex-col">
          {pdfFile && (
            <div className="flex-1 overflow-y-auto">
              <PdfPreviewer
                file={pdfFile}
                onConfirm={handlePdfConfirm}
                onCancel={() => setIsPdfModalOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardType className="text-primary mr-2 h-5 w-5" />
                  Fonte do Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Cole aqui o conteúdo que você está estudando, como artigos, livros, anotações, etc. Vou te dar os melhores flashcards, com base nesse conteúdo!"
                  value={studyContent}
                  onChange={(e) => {
                    setStudyContent(e.target.value);
                    if (e.target.value) {
                      setPdfFile(null);
                      setSelectedPages([]);
                    }
                  }}
                  className="h-40 resize-none text-sm"
                />
                {studyContent.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    {studyContent.length} caracteres
                  </p>
                )}

                {studyContent.trim().length > 0 && (
                  <div className="space-y-3 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-sm font-medium">Onde salvar os flashcards?</h3>

                    {!showNewDeckInput ? (
                      <>
                        <select
                          id="deck-select"
                          value={selectedDeckId || ""}
                          onChange={(e) => setSelectedDeckId(e.target.value || null)}
                          className="w-full p-2 border rounded text-sm bg-background"
                        >
                          <option value="">Adicionar a um deck existente...</option>
                          {decks.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                              {deck.title}
                            </option>
                          ))}
                        </select>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Ou</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowNewDeckInput(true);
                            setSelectedDeckId(null);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar novo deck
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Input
                            id="new-deck-title"
                            placeholder="Digite o nome do seu novo deck"
                            value={newDeckTitle}
                            onChange={(e) => setNewDeckTitle(e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={() => {
                              setShowNewDeckInput(false);
                              setNewDeckTitle('');
                            }}
                          >
                            ← Escolher deck existente
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      !studyContent.trim() ||
                      (!selectedDeckId && !newDeckTitle.trim()) ||
                      generateFlashcards.isPending
                    }
                    className="w-full"
                  >
                    {generateFlashcards.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" /> Gerar Flashcards
                      </>
                    )}
                  </Button>

                  {studyContent.trim() && !selectedDeckId && !newDeckTitle.trim() && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Selecione ou crie um deck para continuar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
            
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
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        data-testid={`card-deck-${deck.id}`}
                      >
                        <div className="flex-1">
                          <h3
                            className="font-medium text-sm text-foreground"
                            data-testid={`text-deck-title-${deck.id}`}
                          >
                            {deck.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Criado em{" "}
                            {new Date(deck.createdAt || "").toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <Button
                            size="sm"
                            onClick={() => handleStudyDeck(deck.id)}
                            data-testid={`button-study-${deck.id}`}
                          >
                            <Play className="h-4 w-4 mr-1" /> Estudar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDeck(deck.id)}
                            data-testid={`button-delete-${deck.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
