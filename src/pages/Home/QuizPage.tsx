import QuizMode from "../../components/QuizMode";
import { type Quiz } from "../../types";

interface QuizPageProps {
  quizzes: Quiz[];
  onBack: () => void;
  deckColor?: string;
}

export function QuizPage({ quizzes, onBack, deckColor }: QuizPageProps) {
  // Validação de segurança
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">Nenhum quiz disponível.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizMode quizzes={quizzes} onBack={onBack} deckColor={deckColor} />
    </div>
  );
}

