import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useCreateFlashcardSet } from "../hooks/useFlashcards";
import { ColorPicker } from "./ui/color-picker";
import { HelpCircle, CheckCircle2, Loader2 } from "lucide-react";

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDeckDialog({ open, onOpenChange, onSuccess }: CreateDeckDialogProps) {
  const { toast } = useToast();
  const createDeck = useCreateFlashcardSet();
  
  const [title, setTitle] = useState("");
  const [deckType, setDeckType] = useState<'flashcard' | 'quiz'>('flashcard');
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, digite um título para o deck.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDeck.mutateAsync({
        title: title.trim(),
        type: deckType,
        color: selectedColor,
      });
      
      toast({
        title: "Deck criado com sucesso!",
        description: `Deck ${deckType === 'quiz' ? 'de quiz' : 'de flashcards'} criado. Agora você pode adicionar conteúdo manualmente.`,
      });
      
      setTitle("");
      setDeckType('flashcard');
      setSelectedColor("#3B82F6");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro ao criar deck",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Deck</DialogTitle>
          <DialogDescription>
            Crie um deck vazio para adicionar flashcards ou quizzes manualmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="text-sm font-medium mb-2 block">Título do Deck</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Matemática Básica"
              className="w-full"
              required
            />
          </div>

          {/* Tipo de Deck */}
          <div>
            <label className="text-sm font-medium mb-3 block">Tipo de Deck</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeckType('flashcard')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  deckType === 'flashcard'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <HelpCircle className={`h-5 w-5 ${
                    deckType === 'flashcard' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm font-medium ${
                    deckType === 'flashcard' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    Flashcards
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeckType('quiz')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  deckType === 'quiz'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className={`h-5 w-5 ${
                    deckType === 'quiz' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm font-medium ${
                    deckType === 'quiz' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    Quiz
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cor do Deck</label>
            <ColorPicker value={selectedColor} onChange={setSelectedColor} />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createDeck.isPending}
              className="flex-1"
            >
              {createDeck.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Deck"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


