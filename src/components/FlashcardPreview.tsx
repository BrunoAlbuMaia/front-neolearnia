import { Card } from "../components/ui/card";
import { type Flashcard } from "../../shared/schema";
import { ChevronRight } from "lucide-react";

interface FlashcardPreviewProps {
  flashcards: Flashcard[];
  onStartStudy: () => void;
}

export default function FlashcardPreview({ flashcards, onStartStudy }: FlashcardPreviewProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-cards-blank text-muted-foreground text-xl"></i>
        </div>
        <p className="text-muted-foreground text-sm mb-4">Nenhum flashcard gerado ainda</p>
        <p className="text-muted-foreground text-xs">Cole um texto e clique em "Gerar Flashcards" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {flashcards.map((flashcard) => (
          <Card
            key={flashcard.id}
            className="p-4 hover:border-primary/30 transition-colors cursor-pointer group bg-secondary/50"
            data-testid={`card-flashcard-${flashcard.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" data-testid={`text-question-${flashcard.id}`}>
                  {flashcard.question}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate" data-testid={`text-answer-preview-${flashcard.id}`}>
                  {flashcard.answer.substring(0, 50)}...
                </p>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors ml-2 h-4 w-4" />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button
          onClick={onStartStudy}
          className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
          data-testid="button-start-study"
        >
          <i className="fas fa-play mr-2"></i>
          Iniciar Modo de Estudo
        </button>
      </div>
    </div>
  );
}
