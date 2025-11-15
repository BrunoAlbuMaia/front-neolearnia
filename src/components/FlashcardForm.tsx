import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { flashcardsApi } from "../api";

interface FlashcardFormProps {
  setId: string;
  flashcard?: { id: string; question: string; answer: string };
  onSuccess: () => void;
  onClose: () => void;
}

export function FlashcardForm({ setId, flashcard, onSuccess, onClose }: FlashcardFormProps) {
  const [question, setQuestion] = useState(flashcard?.question || "");
  const [answer, setAnswer] = useState(flashcard?.answer || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a pergunta e a resposta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (flashcard) {
        // Editar flashcard existente
        await flashcardsApi.updateFlashcard(setId, flashcard.id, { question, answer });
        toast({ title: "Flashcard atualizado com sucesso!" });
      } else {
        // Criar novo flashcard
        await flashcardsApi.createFlashcard({ set_id: setId, question, answer });
        toast({ title: "Flashcard criado com sucesso!" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: flashcard ? "Erro ao atualizar" : "Erro ao criar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {flashcard ? "Editar Flashcard" : "Criar Flashcard"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pergunta</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite a pergunta..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Resposta</label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite a resposta..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : flashcard ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

