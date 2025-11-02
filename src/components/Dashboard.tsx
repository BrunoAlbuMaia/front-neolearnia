import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets, useGenerateFlashcards, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import Decks from './Decks/Decks'
import type { Flashcard } from "../types";
import PdfPreviewer from "./ui/pdfPreviewer";
import { ColorPicker } from "./ui/color-picker";
import { Wand2, Loader2, Plus, Sparkles, Palette } from "lucide-react";


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
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6"); // Azul padrão
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
        qtdCards: 10,
        title: deckTitle,
        color: selectedColor,
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
          setSelectedColor("#3B82F6"); // Reset para cor padrão
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

  const handlePdfConfirm = () => {
    setIsPdfModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-background w-full">
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

      <div className="max-w-6xl mx-auto p-4 pb-8 space-y-6 w-full">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:p-4">
          {/* Formulário de Criação */}
          <div className="space-y-4">
            <Card className="shadow-lg border-2 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="text-primary mr-2 h-6 w-6" />
                  Criar Novos Flashcards
                </CardTitle>
                <CardDescription>
                  Cole seu conteúdo e deixe a IA criar flashcards personalizados para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <Textarea
                  placeholder="Cole aqui o conteúdo que você está estudando, como artigos, livros, anotações, etc. Vou te dar os melhores flashcards, com base nesse conteúdo!"
                  value={studyContent}
                  onChange={(e) => {
                    setStudyContent(e.target.value);
                    if (e.target.value) {
                      setPdfFile(null);
                    }
                  }}
                  className="h-40 resize-none text-sm"
                />
                  {/* <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("pdf-input")?.click()}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Anexar PDF
                    </Button>
                    {pdfFile && <span className="text-sm text-muted-foreground">{pdfFile.name}</span>}
                  </div>

          
          
                  <input
                    type="file"
                    accept="application/pdf"
                    id="pdf-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPdfFile(file);
                        setIsPdfModalOpen(true); // abre o modal com o preview
                        setStudyContent(""); // limpa o texto se PDF for enviado
                      }
                    }}
                  /> */}
                {/* Contador de caracteres */}
                {studyContent.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {studyContent.length} {studyContent.length === 1 ? 'caractere' : 'caracteres'}
                    </p>
                    <p className="text-xs text-accent font-medium">
                      {Math.ceil(studyContent.length / 100)} flashcards estimados
                    </p>
                  </div>
                )}

                {/* Opções de Personalização - Aparece quando há conteúdo */}
                {studyContent.trim().length > 0 && (
                  <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Seletor de Cores */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Personalização Visual</h3>
                      </div>
                      <ColorPicker
                        value={selectedColor}
                        onChange={setSelectedColor}
                      />
                    </div>

                    {/* Seleção de Deck */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-foreground">Onde salvar os flashcards?</h3>

                    {!showNewDeckInput ? (
                      <>
                        <Select
                          value={selectedDeckId || ""}
                          onValueChange={(value: string) => setSelectedDeckId(value || null)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Adicionar a um deck existente..." />
                          </SelectTrigger>
                          <SelectContent>
                            {decks.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Nenhum deck disponível
                              </SelectItem>
                            ) : (
                              decks.map((deck) => (
                                <SelectItem key={deck.id} value={deck.id}>
                                  {deck.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>

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
                  </div>
                )}

                {/* Botão de Gerar */}
                <div className="pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      !studyContent.trim() ||
                      (!selectedDeckId && !newDeckTitle.trim()) ||
                      generateFlashcards.isPending
                    }
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {generateFlashcards.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando flashcards...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" /> Gerar Flashcards com IA
                      </>
                    )}
                  </Button>

                  {studyContent.trim() && !selectedDeckId && !newDeckTitle.trim() && (
                    <p className="text-xs text-center text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
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
