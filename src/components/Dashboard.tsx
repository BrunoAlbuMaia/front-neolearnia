import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { type Flashcard, type FlashcardSet, type DeckWithStats } from "../../shared/schema";

import { ClipboardType, Wand2, Trash2, Clock, Loader2, BookOpen, Play } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    if (!studyContent.trim()) {
      toast({
        title: "Conteúdo necessário",
        description: "Por favor, cole algum conteúdo para gerar flashcards.",
        variant: "destructive",
      });
      return;
    }
    
    const deckTitle = selectedDeckId ? undefined : `Flashcards - ${new Date().toLocaleDateString()}`;
    generateFlashcards.mutate({
      text: studyContent,
      setId: selectedDeckId || undefined,
      title: deckTitle,
    });
  };

  const handleClearText = () => {
    setStudyContent("");
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

    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
        <p className="text-muted-foreground">
          Cole seu conteúdo de estudo abaixo e gere flashcards inteligentes automaticamente.
        </p>
      </div>

      {/* Main Content Grid - Já responsivo, 'grid-cols-1' é o padrão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna da Esquerda (Input) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardType className="text-primary mr-2 h-5 w-5" />
                Cole seu conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                <label htmlFor="deck-select" className="text-sm font-medium whitespace-nowrap">Deck:</label>
                <select
                  id="deck-select"
                  value={selectedDeckId || ""}
                  onChange={(e) => setSelectedDeckId(e.target.value || null)}
                  className="w-full p-2 border rounded text-sm bg-background"
                  data-testid="select-deck"
                >
                  <option value="">Criar novo deck</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.title}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Cole aqui o texto da sua apostila, resumo ou qualquer conteúdo que você quer transformar em flashcards..."
                value={studyContent}
                onChange={(e) => setStudyContent(e.target.value)}
                className="h-64 resize-none text-sm"
                data-testid="textarea-study-content"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generateFlashcards.isPending || !studyContent.trim()}
                  className="flex-1"
                  data-testid="button-generate"
                >
                  {generateFlashcards.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> {selectedDeckId ? 'Adicionar ao Deck' : 'Criar Novo Deck'}</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearText}
                  data-testid="button-clear"
                  className="sm:size-auto sm:px-4" /* Ajusta tamanho do botão */
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generation Status */}
          {generateFlashcards.isPending && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-center">
              <Loader2 className="animate-spin h-4 w-4 text-accent mr-3" />
              <span className="text-accent font-medium text-sm">Gerando flashcards...</span>
            </div>
          )}
        </div>

        {/* Coluna da Direita (Preview) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="text-primary mr-2 h-5 w-5" />
                Seus Decks
              </CardTitle>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full" data-testid="text-deck-count">
                {decks.length} decks
              </span>
            </CardHeader>
            <CardContent>
              {isLoadingDecks ? (
                <div className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground text-sm">Carregando decks...</p></div>
              ) : decks.length === 0 ? (
                <div className="text-center py-12"><BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground text-sm mb-4">Você ainda não criou nenhum deck.</p><p className="text-xs text-muted-foreground">Cole um conteúdo acima para criar seu primeiro deck!</p></div>
              ) : (
                <div className="space-y-3">
                  {decks.map((deck) => (
                    // Layout do Card do Deck - agora responsivo
                    <div
                      key={deck.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      data-testid={`card-deck-${deck.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-foreground" data-testid={`text-deck-title-${deck.id}`}>{deck.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Criado em {new Date(deck.createdAt || '').toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <Button size="sm" onClick={() => handleStudyDeck(deck.id)} data-testid={`button-study-${deck.id}`}><Play className="h-4 w-4 mr-1" /> Estudar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteDeck(deck.id)} data-testid={`button-delete-${deck.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-6xl mx-auto p-4 pt-0">
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
      </div>
  </div>
  </div>
  );
}
