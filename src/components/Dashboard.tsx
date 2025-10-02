import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { type Flashcard, type FlashcardSet } from "../../shared/schema";
import PdfPreviewer from "./ui/pdfPreviewer"; // Importe o novo componente

import { ClipboardType, Wand2, Trash2, Clock, Loader2, BookOpen, Play, FileUp, FileText } from "lucide-react";
import Navbar from "./ui/navbar";


interface DashboardProps {
  user: any;
  onLogout: () => void;
  onStartStudy: (flashcards: Flashcard[]) => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToDeck?: (deckId: string) => void;
}

export default function Dashboard({ user, onLogout, onStartStudy, onNavigateToAnalytics, onNavigateToDeck }: DashboardProps) {
  const [studyContent, setStudyContent] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckTitle, setNewDeckTitle] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para o fluxo de PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);


  // Fetch decks instead of all flashcards
  const { data: decks = [], isLoading: isLoadingDecks } = useQuery<FlashcardSet[]>({
    queryKey: [`${import.meta.env.VITE_LINK_API}/api/flashcard-sets`],
  });

  // Transform decks to include flashcard count (simplified for now)
  const decksWithStats: DeckWithStats[] = decks.map(deck => ({
    ...deck,
    flashcardCount: 0, // Will be updated by backend later
    lastActivity: deck.createdAt,
  }));

  const generateFlashcards = useMutation({
    mutationFn: async ({ text, setId, title }: { text: string, setId?: string, title?: string }) => {
      const response = await apiRequest("POST", `${import.meta.env.VITE_LINK_API}/api/flashcards/generate`, { text, setId, title });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Flashcards gerados com sucesso!",
        description: `${data.flashcards.length} flashcards foram criados para o deck "${data.flashcardSet.title}".`,
      });
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/flashcard-sets`] });
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/flashcards`] });
      setStudyContent(""); // Clear the text after successful generation
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar flashcards",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteDeck = useMutation({
    mutationFn: async (deckId: string) => {
      const response = await apiRequest("DELETE", `${import.meta.env.VITE_LINK_API}/api/flashcard-sets/${deckId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deck deletado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/flashcard-sets`] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar deck",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
  // A validação do conteúdo de estudo permanece a mesma
  if (!studyContent.trim()) {
    toast({
      title: "Conteúdo necessário",
      description: "Por favor, cole algum conteúdo para gerar flashcards.",
      variant: "destructive",
    });
    return;
  }

  // Validação para garantir que ou um deck foi selecionado ou um novo título foi digitado
  if (!selectedDeckId && !newDeckTitle.trim()) {
    toast({
      title: "Nenhum deck selecionado",
      description: "Por favor, escolha um deck existente ou dê um nome para um novo deck.",
      variant: "destructive",
    });
    return;
  }

  // *** LÓGICA CORRIGIDA PARA O TÍTULO ***
  // 1. Se um novo título foi digitado, use-o.
  // 2. Se nenhum deck existente foi selecionado e nenhum novo título foi digitado, crie um padrão.
  // 3. Se um deck existente foi selecionado, o título é undefined (correto).
  const deckTitle = newDeckTitle.trim() 
    ? newDeckTitle.trim() 
    : (selectedDeckId ? undefined : `Flashcards - ${new Date().toLocaleDateString()}`);

  generateFlashcards.mutate({
    text: studyContent,
    setId: selectedDeckId || undefined, // A lógica aqui já está correta
    title: deckTitle,
  });
};

  const handleClearText = () => {
    setStudyContent("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limpa o texto se um arquivo for selecionado
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
      const response = await apiRequest("GET", `${import.meta.env.VITE_LINK_API}/api/flashcards?setId=${deckId}`);
      const flashcards = await response.json();
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
      deleteDeck.mutate(deckId);
    }
  };
  return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header - Agora responsivo */}
        <Navbar 
              user={user} 
              onLogout={onLogout} 
              onNavigateToAnalytics={onNavigateToAnalytics} 
            />
        {/* Modal PDF */}
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
        {/* Mensagem de Boas Vindas */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
          {/* <p className="text-muted-foreground">
            Cole seu conteúdo de estudo abaixo e gere flashcards inteligentes automaticamente.
          </p> */}
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {/* Coluna da Esquerda (IMPORTAR OU DIGITAR TEXTOS DO FLASHCARDS) */}
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

                {/* Divisor do INPUT para o PDF*/}
                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou</span>
                  </div>
                </div> */}

                {/* Upload PDF */}
                {/* <label htmlFor="pdf-upload" className="w-full cursor-pointer">
                  <div className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                      {pdfFile ? (
                        <>
                          <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="mb-1 text-sm font-semibold">{pdfFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPages.length} páginas selecionadas -{" "}
                            <span className="text-primary font-semibold hover:underline">
                              Alterar seleção
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">2. Clique para enviar</span>{" "}
                            ou arraste um PDF
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <Input
                    id="pdf-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label> */}

                {/* Seleção do Deck */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-medium">Onde salvar os flashcards?</h3>
                  <select
                    id="deck-select"
                    value={selectedDeckId || ""}
                    onChange={(e) => {
                      setSelectedDeckId(e.target.value || null);
                      if (e.target.value) setNewDeckTitle("");
                    }}
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

                  <Input
                    id="new-deck-title"
                    placeholder="Digite o nome do seu novo deck de flashcards"
                    value={newDeckTitle}
                    onChange={(e) => {
                      setNewDeckTitle(e.target.value);
                      if (e.target.value) setSelectedDeckId(null);
                    }}
                  />
                </div>

                {/* Botão para gerar os FLASHCARDS */}
                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={generateFlashcards.isPending}
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
                </div>
              </CardContent>
            </Card>
          </div>
            
                      {/* Coluna da Direita */}
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







                {/* Recent Activity */}
                {/* <div className="max-w-6xl mx-auto p-4 pt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="text-primary mr-2 h-5 w-5" />
                        Atividade Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                          <span className="text-sm text-muted-foreground flex-1">
                            {decks.length > 0 ? `Criou ${decks.length} decks recentemente` : "Nenhuma atividade recente"}
                          </span>
                          <span className="text-xs text-muted-foreground">agora</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div> */}
        </div>
      </div>
      </div>
  );
}
