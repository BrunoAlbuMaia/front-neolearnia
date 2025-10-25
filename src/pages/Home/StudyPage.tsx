import StudyMode from "../../components/StudyMode";
import { type Flashcard } from "../../../shared/schema";

interface StudyPageProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export function StudyPage({ flashcards, onBack }: StudyPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyMode flashcards={flashcards} onBack={onBack} />
    </div>
  );
}
