import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets, useGenerateFlashcards, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import { useGenerateQuiz } from "../hooks/useQuizzes";
import Decks from './Decks/Decks'
import type { Flashcard, Quiz } from "../types";
import PdfPreviewer from "./ui/pdfPreviewer";
import { ColorPicker } from "./ui/color-picker";
import { Wand2, Loader2, Plus, Sparkles, Palette, HelpCircle, CheckCircle2 } from "lucide-react";


interface DashboardProps {
  user: any;
  onLogout: () => void;
  onStartStudy: (flashcards: Flashcard[]) => void;
  onStartQuiz?: (quizzes: Quiz[], deckColor?: string) => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToDeck?: (deckId: string) => void;
}

export default function Dashboard({ 
  user, 
  onLogout, 
  onStartStudy, 
  onStartQuiz,
  onNavigateToAnalytics 
}: DashboardProps) {
  const [studyContent, setStudyContent] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6"); // Azul padrão
  const [cardType, setCardType] = useState<'standard' | 'quiz'>('standard'); // Tipo de flashcard
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const { toast } = useToast();
  
  const { data: decks = [], isLoading: isLoadingDecks } = useFlashcardSets();
  const generateFlashcards = useGenerateFlashcards();
  const generateQuiz = useGenerateQuiz();
  const deleteDeck = useDeleteFlashcardSet();

  const handleGenerate = () => {
    if (!studyContent.trim()) {
      toast({
        title: "Conteúdo necessário",
        description: `Por favor, cole algum conteúdo para gerar ${cardType === 'quiz' ? 'quiz' : 'flashcards'}.`,
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
      : (selectedDeckId ? undefined : `${cardType === 'quiz' ? 'Quiz' : 'Flashcards'} - ${new Date().toLocaleDateString()}`);

    // Se for quiz, usa a API de quiz
    if (cardType === 'quiz') {
      generateQuiz.mutate(
        {
          text: studyContent,
          set_id: selectedDeckId || undefined,
          qtd_questions: 10,
          title: deckTitle,
        },
        {
          onSuccess: (data) => {
            toast({
              title: "Quiz gerado com sucesso!",
              description: `Quiz gerado com sucesso!`,
            });
            setStudyContent("");
            setNewDeckTitle("");
            setSelectedDeckId(null);
            setShowNewDeckInput(false);
            setSelectedColor("#3B82F6"); // Reset para cor padrão
            setCardType('standard'); // Reset para tipo padrão
          },
          onError: (error: any) => {
            toast({
              title: "Erro ao gerar quiz",
              description: error.message || "Ocorreu um erro. Tente novamente.",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Se for flashcard padrão, usa a API de flashcards
      generateFlashcards.mutate(
        {
          text: studyContent,
          setId: selectedDeckId || undefined,
          qtdCards: 10,
          title: deckTitle,
          color: selectedColor,
          cardType: cardType,
        },
        {
          onSuccess: (data) => {
            toast({
              title: "Flashcards gerados com sucesso!",
              description: `Flashcards gerados com sucesso!`,
            });
            setStudyContent("");
            setNewDeckTitle("");
            setSelectedDeckId(null);
            setShowNewDeckInput(false);
            setSelectedColor("#3B82F6"); // Reset para cor padrão
            setCardType('standard'); // Reset para tipo padrão
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
    }
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
                    {/* Seletor de Tipo de Flashcard */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Tipo de Flashcard</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Card Padrão */}
                        <button
                          type="button"
                          onClick={() => setCardType('standard')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCardType('standard');
                            }
                          }}
                          aria-pressed={cardType === 'standard'}
                          aria-label="Selecionar flashcard padrão"
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            cardType === 'standard'
                              ? 'border-primary bg-primary/10 shadow-md scale-[1.02] ring-2 ring-primary/20'
                              : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md transition-colors ${
                              cardType === 'standard'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <HelpCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 text-foreground">Flashcard Padrão</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Pergunta e resposta tradicional
                              </p>
                            </div>
                            {cardType === 'standard' && (
                              <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2 animate-in fade-in zoom-in duration-200" />
                            )}
                          </div>
                        </button>

                        {/* Card Quiz */}
                        <button
                          type="button"
                          onClick={() => setCardType('quiz')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCardType('quiz');
                            }
                          }}
                          aria-pressed={cardType === 'quiz'}
                          aria-label="Selecionar flashcard tipo quiz"
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            cardType === 'quiz'
                              ? 'border-primary bg-primary/10 shadow-md scale-[1.02] ring-2 ring-primary/20'
                              : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md transition-colors ${
                              cardType === 'quiz'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 text-foreground">Quiz</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Múltipla escolha (A, B, C, D)
                              </p>
                            </div>
                            {cardType === 'quiz' && (
                              <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2 animate-in fade-in zoom-in duration-200" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

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
                      generateFlashcards.isPending ||
                      generateQuiz.isPending
                    }
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {(generateFlashcards.isPending || generateQuiz.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando {cardType === 'quiz' ? 'quiz' : 'flashcards'}...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" /> Gerar {cardType === 'quiz' ? 'Quiz' : 'Flashcards'} com IA
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
            onStartStudy={onStartStudy}
            onStartQuiz={onStartQuiz}>
          </Decks>
          
        </div>
      </div>
    </div>
  );
}
