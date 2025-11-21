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
import { Wand2, Loader2, Plus, Sparkles, Palette, HelpCircle, CheckCircle2, BookOpen, RotateCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonCard } from "./ui/skeleton-card";
import { H2, H3, H4, Lead, Body, Small, Muted } from "./ui/typography";
import { useReviewSummary } from "../hooks/useReviews";
import { useLocation } from "wouter";

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
  const [, setLocation] = useLocation();
  const { data: reviewSummary, isLoading: isLoadingReview } = useReviewSummary();
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

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header - Design Limpo e Profissional */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-10 shadow-lg"
        >
          <div className="relative z-10">
            <H2 className="mb-2">
              Bem-vindo de volta! 👋
            </H2>
            <Lead className="font-medium">
              Continue de onde parou ou crie novos decks de estudo
            </Lead>
          </div>
        </motion.div>

        {/* Card de Revisão Diária - Destaque Proeminente */}
        {!isLoadingReview && reviewSummary && (reviewSummary.totalDue > 0 || reviewSummary.overdue > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Card className={`border-2 shadow-lg transition-all hover:shadow-xl ${
              reviewSummary.overdue > 0 
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                : 'border-primary bg-primary/5'
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      reviewSummary.overdue > 0 
                        ? 'bg-red-500 text-white' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {reviewSummary.overdue > 0 ? (
                        <AlertCircle className="h-6 w-6" />
                      ) : (
                        <RotateCcw className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <H3 className="mb-1">
                        {reviewSummary.overdue > 0 
                          ? `⚠️ ${reviewSummary.overdue} revis${reviewSummary.overdue > 1 ? 'ões' : 'ão'} atrasada${reviewSummary.overdue > 1 ? 's' : ''}!`
                          : `📚 ${reviewSummary.dueToday} revis${reviewSummary.dueToday !== 1 ? 'ões' : 'ão'} para hoje`
                        }
                      </H3>
                      <Muted className="text-sm">
                        {reviewSummary.totalDue > 0 && (
                          <>
                            {reviewSummary.dueToday > 0 && `${reviewSummary.dueToday} hoje`}
                            {reviewSummary.dueToday > 0 && reviewSummary.overdue > 0 && ' • '}
                            {reviewSummary.overdue > 0 && `${reviewSummary.overdue} atrasada${reviewSummary.overdue > 1 ? 's' : ''}`}
                            {reviewSummary.dueThisWeek > 0 && ` • ${reviewSummary.dueThisWeek} esta semana`}
                          </>
                        )}
                      </Muted>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation("/review")}
                    size="lg"
                    className={`${
                      reviewSummary.overdue > 0
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    } shadow-md`}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Iniciar Revisão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Formulário de Criação - Melhorado */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="shadow-md border border-border hover:shadow-lg transition-shadow">
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
                      <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
                      <Body className="font-semibold">Gerando {cardType === 'quiz' ? 'quiz' : 'flashcards'}...</Body>
                      <Small className="mt-2 block">Isso pode levar alguns segundos</Small>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center">
                  <Sparkles className="text-primary mr-2 h-5 w-5" />
                  <H3>Criar Novos Flashcards</H3>
                </CardTitle>
                <CardDescription className="mt-2">
                  <Muted>Cole seu conteúdo e deixe a IA criar flashcards personalizados para você</Muted>
                </CardDescription>
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
                      className="space-y-4 pt-4 border-t border-border"
                    >
                    {/* Seletor de Tipo de Flashcard - Mais Vibrante */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-md bg-primary">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <H4 className="text-base">Tipo de Conteúdo</H4>
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
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md transition-all ${
                              cardType === 'standard'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <HelpCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm mb-1 ${
                                cardType === 'standard' ? 'text-primary' : 'text-foreground'
                              }`}>
                                Flashcard
                              </h4>
                              <Small>Pergunta e resposta tradicional</Small>
                            </div>
                            {cardType === 'standard' && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
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
                          className={`relative p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                            cardType === 'quiz'
                              ? 'border-accent bg-accent/10 shadow-sm'
                              : 'border-border bg-card hover:border-accent/50 hover:bg-accent/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md transition-all ${
                              cardType === 'quiz'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm mb-1 ${
                                cardType === 'quiz' ? 'text-accent' : 'text-foreground'
                              }`}>
                                Quiz
                              </h4>
                              <Small>Múltipla escolha (A, B, C, D)</Small>
                            </div>
                            {cardType === 'quiz' && (
                              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            )}
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Seletor de Cores */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-md bg-primary">
                          <Palette className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <H4 className="text-base">Personalização Visual</H4>
                      </div>
                      <ColorPicker
                        value={selectedColor}
                        onChange={setSelectedColor}
                      />
                    </div>

                    {/* Seleção de Deck */}
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <H4 className="mb-3 flex items-center gap-2">
                        <span className="p-1.5 rounded-md bg-primary">
                          <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
                        </span>
                        Onde salvar os flashcards?
                      </H4>

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
