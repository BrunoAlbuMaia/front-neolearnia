// import { useState, useEffect } from "react";
// import { Button } from "./ui/button";
// import { Card, CardContent } from "./ui/card";
// import { Progress } from "./ui/progress";
// import { useToast } from "../hooks/use-toast";
// import { useStudySession } from "../hooks/useStudySession";
// import { useUpdateFlashcardDifficulty } from "../hooks/useFlashcards";
// import type { Flashcard } from "../types";
// import { 
//   ArrowLeft, 
//   ChevronLeft, 
//   ChevronRight, 
//   RotateCcw, 
//   HelpCircle, 
//   Lightbulb,
//   X,
//   Minus,
//   Check
// } from "lucide-react";

// interface ReviewModeProps {
//     reviewCards: Flashcard[];  // Apenas cards agendados para revisão
//     onBack: () => void;
//   }
  
//   export default function ReviewMode({ reviewCards, onBack }: ReviewModeProps) {
//     const [currentCardIndex, setCurrentCardIndex] = useState(0);
//     const [isFlipped, setIsFlipped] = useState(false);
//     const [cardStartTime, setCardStartTime] = useState(new Date());
  
//     const currentCard = reviewCards[currentCardIndex];
//     const progress = ((currentCardIndex + 1) / reviewCards.length) * 100;
  
//     // Aqui você pode usar hooks de revisão, se houver
//     const { recordReview, updateStats, finalizeReview } = useStudySession(
//       currentCard?.set_id,
//       reviewCards.length
//     );
  
//     const handleDifficulty = (difficulty: 'easy' | 'medium' | 'difficult') => {
//       const timeSpent = Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000);
  
//       recordReview.mutate({
//         flashcardId: currentCard.id,
//         sessionId: '', // pode criar uma sessão temporária ou usar sessão global de revisão
//         difficulty,
//         timeSpent
//       });
  
//       updateStats(difficulty);
  
//       setTimeout(() => {
//         if (currentCardIndex < reviewCards.length - 1) {
//           setCurrentCardIndex(currentCardIndex + 1);
//           setIsFlipped(false);
//           setCardStartTime(new Date());
//         } else {
//           finalizeReview();
//           onBack();
//         }
//       }, 500);
//     };
  
//     return (
//       <div className="min-h-screen flex flex-col">
//         <nav> {/* Navegação igual ao StudyMode */} </nav>
  
//         <div className="flex-grow flex flex-col items-center justify-center">
//           <div className="text-xs text-muted-foreground mb-2">{currentCard?.deck_title}</div>
//           <h3>{currentCard?.question}</h3>
//           {isFlipped && <p>{currentCard?.answer}</p>}
  
//           <div className="flex gap-2 mt-4">
//             <button onClick={() => handleDifficulty('difficult')}>Difícil</button>
//             <button onClick={() => handleDifficulty('medium')}>Médio</button>
//             <button onClick={() => handleDifficulty('easy')}>Fácil</button>
//           </div>
//         </div>
//       </div>
//     );
//   }
  