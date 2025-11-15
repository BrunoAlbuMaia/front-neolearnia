import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { quizzesApi } from "../api";
import { X, CheckCircle2 } from "lucide-react";

interface QuizFormProps {
  setId: string;
  quiz?: { id: string; question: string; options: Array<{ id?: string; text: string; is_correct: boolean }> };
  onSuccess: () => void;
  onClose: () => void;
}

export function QuizForm({ setId, quiz, onSuccess, onClose }: QuizFormProps) {
  const [question, setQuestion] = useState(quiz?.question || "");
  const [options, setOptions] = useState<Array<{ text: string; is_correct: boolean }>>(
    quiz?.options.map(opt => ({ text: opt.text, is_correct: opt.is_correct })) || [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ]
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectAnswer = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha a pergunta.",
        variant: "destructive",
      });
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      toast({
        title: "Opções incompletas",
        description: "Preencha todas as opções.",
        variant: "destructive",
      });
      return;
    }

    if (!options.some(opt => opt.is_correct)) {
      toast({
        title: "Resposta correta",
        description: "Selecione a resposta correta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (quiz) {
        // Editar quiz existente
        await quizzesApi.updateQuiz(setId, quiz.id, { question, options });
        toast({ title: "Quiz atualizado com sucesso!" });
      } else {
        // Criar novo quiz
        await quizzesApi.createQuiz({ set_id: setId, question, options });
        toast({ title: "Quiz criado com sucesso!" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: quiz ? "Erro ao atualizar" : "Erro ao criar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quiz ? "Editar Quiz" : "Criar Quiz"}
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
            <label className="text-sm font-medium mb-3 block">Opções (clique para marcar como correta)</label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswer(index)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      option.is_correct
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-transparent border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {option.is_correct ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : quiz ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

