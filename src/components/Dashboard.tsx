import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets, useGenerateFlashcards, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import Decks from './Decks'
import type { Flashcard } from "../types";
import PdfPreviewer from "./ui/pdfPreviewer";
import { ClipboardType, Wand2, Trash2, Loader2, BookOpen, Play, Plus } from "lucide-react";
import Navbar from "./ui/navbar";
import { onLog } from "firebase/app";

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

  const handlePdfConfirm = (pages: number[]) => {
    setIsPdfModalOpen(false);
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

          <Decks
            onStartStudy={onStartStudy}>
          </Decks>
          
        </div>
      </div>
    </div>
  );
}
