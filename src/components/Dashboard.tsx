import { useState, useMemo, lazy, Suspense } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useFlashcardSets, useGenerateFlashcards, useDeleteFlashcardSet } from "../hooks/useFlashcards";
import { useGenerateQuiz } from "../hooks/useQuizzes";
import type { Flashcard, Quiz } from "../types";
import PdfPreviewer from "./ui/pdfPreviewer";
import { ColorPicker } from "./ui/color-picker";
import { Wand2, Loader2, Plus, Sparkles, Palette, HelpCircle, CheckCircle2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonCard } from "./ui/skeleton-card";

// Lazy load do componente Decks para melhor performance
const Decks = lazy(() => import('./Decks/Decks'));


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

  // Memoizar opções de deck para Select
  const deckOptions = useMemo(() => 
    decks.map(deck => ({ value: deck.id, label: deck.title })),
    [decks]
  );

  const isGenerating = generateFlashcards.isPending || generateQuiz.isPending;
  const estimatedCards = useMemo(() => 
    Math.ceil(studyContent.length / 100),
    [studyContent.length]
  );

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full">
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

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header - Design Limpo e Profissional */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-10 shadow-lg"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Bem-vindo de volta! 👋
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              Continue de onde parou ou crie novos decks de estudo
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Formulário de Criação - Melhorado */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="shadow-2xl border-2 border-primary/20 hover:border-primary/40 hover-lift transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5">
              {/* Efeito de brilho sutil */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-50" />
              
              {/* Overlay de loading durante geração */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center rounded-xl z-10"
                  >
                    <div className="text-center">
                      <div className="relative">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Gerando {cardType === 'quiz' ? 'quiz' : 'flashcards'}...</p>
                      <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-b border-primary/20 relative overflow-hidden">
                {/* Efeito de gradiente animado no header */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
                <div className="relative z-10">
                  <CardTitle className="flex items-center text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <Sparkles className="text-primary mr-2 h-6 w-6 drop-shadow-sm" />
                    Criar Novos Flashcards
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base mt-2 text-muted-foreground">
                    Cole seu conteúdo e deixe a IA criar flashcards personalizados para você
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5 pt-6 relative">
                <div className="relative">
                  <Textarea
                    placeholder="Cole aqui o conteúdo que você está estudando, como artigos, livros, anotações, etc. Vou te dar os melhores flashcards, com base nesse conteúdo!"
                    value={studyContent}
                    onChange={(e) => {
                      setStudyContent(e.target.value);
                      if (e.target.value) {
                        setPdfFile(null);
                      }
                    }}
                    className="h-40 resize-none text-sm min-h-[160px] focus:ring-2 focus:ring-primary/20"
                    disabled={isGenerating}
                  />
                  
                  {/* Contador de caracteres melhorado */}
                  {studyContent.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between mt-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        {studyContent.length.toLocaleString()} {studyContent.length === 1 ? 'caractere' : 'caracteres'}
                      </p>
                      <p className="text-xs font-medium text-accent">
                        ~{estimatedCards} {estimatedCards === 1 ? 'flashcard' : 'flashcards'} estimados
                      </p>
                    </motion.div>
                  )}
                </div>
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
                {/* Contador de caracteres 
                {studyContent.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {studyContent.length} {studyContent.length === 1 ? 'caractere' : 'caracteres'}
                    </p>
                    <p className="text-xs text-accent font-medium">
                      {Math.ceil(studyContent.length / 100)} flashcards estimados
                    </p>
                  </div>
                )}*/}

                {/* Opções de Personalização - Aparece quando há conteúdo */}
                <AnimatePresence>
                  {studyContent.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t"
                    >
                    {/* Seletor de Tipo de Flashcard - Mais Vibrante */}
                    <div className="p-5 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-lg relative overflow-hidden">
                      {/* Efeito de brilho de fundo */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-30" />
                      
                      <div className="relative z-10 flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Tipo de Conteúdo</h3>
                      </div>
                      <div className="relative z-10 grid grid-cols-2 gap-3">
                        {/* Card Padrão */}
                        <motion.button
                          type="button"
                          onClick={() => setCardType('standard')}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCardType('standard');
                            }
                          }}
                          aria-pressed={cardType === 'standard'}
                          aria-label="Selecionar flashcard padrão"
                          className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden ${
                            cardType === 'standard'
                              ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/30 glow-primary'
                              : 'border-border/50 bg-card hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md'
                          }`}
                        >
                          {cardType === 'standard' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                          )}
                          <div className="relative z-10 flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg transition-all ${
                              cardType === 'standard'
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-md'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <HelpCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-bold text-sm mb-1 ${
                                cardType === 'standard' ? 'text-primary' : 'text-foreground'
                              }`}>
                                Flashcard
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Pergunta e resposta tradicional
                              </p>
                            </div>
                            {cardType === 'standard' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                              >
                                <div className="p-1 rounded-full bg-primary text-white">
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.button>

                        {/* Card Quiz */}
                        <motion.button
                          type="button"
                          onClick={() => setCardType('quiz')}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setCardType('quiz');
                            }
                          }}
                          aria-pressed={cardType === 'quiz'}
                          aria-label="Selecionar flashcard tipo quiz"
                          className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 overflow-hidden ${
                            cardType === 'quiz'
                              ? 'border-accent bg-gradient-to-br from-accent/20 to-accent/5 shadow-lg scale-[1.02] ring-2 ring-accent/30 glow-accent'
                              : 'border-border/50 bg-card hover:border-accent/60 hover:bg-gradient-to-br hover:from-accent/5 hover:to-transparent hover:shadow-md'
                          }`}
                        >
                          {cardType === 'quiz' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                          )}
                          <div className="relative z-10 flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg transition-all ${
                              cardType === 'quiz'
                                ? 'bg-gradient-to-br from-accent to-accent/80 text-white shadow-md'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-bold text-sm mb-1 ${
                                cardType === 'quiz' ? 'text-accent' : 'text-foreground'
                              }`}>
                                Quiz
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Múltipla escolha (A, B, C, D)
                              </p>
                            </div>
                            {cardType === 'quiz' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                              >
                                <div className="p-1 rounded-full bg-accent text-white">
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Seletor de Cores - Mais Vibrante */}
                    <div className="p-5 bg-gradient-to-br from-accent/10 via-primary/10 to-accent/5 rounded-xl border-2 border-accent/20 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 opacity-30" />
                      <div className="relative z-10 flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                          <Palette className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Personalização Visual</h3>
                      </div>
                      <div className="relative z-10">
                        <ColorPicker
                          value={selectedColor}
                          onChange={setSelectedColor}
                        />
                      </div>
                    </div>

                    {/* Seleção de Deck - Mais Vibrante */}
                    <div className="p-5 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border-2 border-primary/20 shadow-lg">
                      <h3 className="text-sm font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
                          <BookOpen className="h-3.5 w-3.5 text-white" />
                        </span>
                        Onde salvar os flashcards?
                      </h3>

                    {!showNewDeckInput ? (
                      <>
                        <Select
                          value={selectedDeckId || ""}
                          onValueChange={(value: string) => setSelectedDeckId(value || null)}
                          disabled={isGenerating}
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
                              deckOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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
                    </motion.div>
                  )}
                </AnimatePresence>
                

                {/* Botão de Gerar - Melhorado */}
                <div className="pt-2">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      onClick={handleGenerate}
                      disabled={
                        !studyContent.trim() ||
                        (!selectedDeckId && !newDeckTitle.trim()) ||
                        isGenerating
                      }
                      size="lg"
                      className="w-full gradient-primary text-white hover:opacity-90 shadow-xl hover:shadow-2xl glow-primary hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none keyboard-navigation font-semibold"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          Gerando {cardType === 'quiz' ? 'quiz' : 'flashcards'}...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" /> 
                          Gerar {cardType === 'quiz' ? 'Quiz' : 'Flashcards'} com IA
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {studyContent.trim() && !selectedDeckId && !newDeckTitle.trim() && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-center text-muted-foreground mt-3 p-2 bg-muted/50 rounded-lg"
                    >
                      Selecione ou crie um deck para continuar.
                    </motion.p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Decks - Lazy Loaded */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            }>
              <Decks
                onStartStudy={onStartStudy}
                onStartQuiz={onStartQuiz}
              />
            </Suspense>
          </motion.div>
          
        </div>
      </div>
    </div>
    
  );
}
