import { memo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { 
  Trash2, 
  Edit2, 
  Play, 
  Check, 
  X, 
  Loader2, 
  HelpCircle, 
  CheckCircle2, 
  Settings,
  MoreVertical
} from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTrigger, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { FlashcardSet } from "../../types";

interface DeckItemProps {
  deck: FlashcardSet;
  isEditing: boolean;
  editedTitle: string;
  setEditedTitle: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStudy: () => void;
  onManage?: () => void;
  isSaving: boolean;
}

function DeckItem({
  deck,
  isEditing,
  editedTitle,
  setEditedTitle,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onStudy,
  onManage,
  isSaving,
}: DeckItemProps) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        // Prevenir que o clique no card interfira com os botões
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="button"]')) {
          return;
        }
      }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-5 md:p-6 border-2 border-primary/20 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 shadow-lg overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {/* Efeito de brilho no hover - Atrás de tudo */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
      
      {/* Borda colorida lateral baseada no tipo */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 z-0 ${
        deck.type === 'quiz' 
          ? 'bg-gradient-to-b from-accent to-accent/50' 
          : 'bg-gradient-to-b from-primary to-primary/50'
      }`} />
      {/* Informações do Deck */}
      <div className="flex-1 min-w-0 relative z-20">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 text-sm border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <div className="flex gap-2 sm:shrink-0">
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 sm:flex-initial"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="flex-1 sm:flex-initial"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-foreground truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {deck.title}
              </h3>
              {deck.type && (
                <Badge 
                  variant="outline" 
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 ${
                    deck.type === 'quiz' 
                      ? 'border-accent/40 bg-gradient-to-br from-accent/20 to-accent/10 text-accent shadow-sm' 
                      : 'border-primary/40 bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm'
                  }`}
                >
                  {deck.type === 'quiz' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Quiz
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Flashcard
                    </>
                  )}
                </Badge>
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Criado em {new Date(deck.created_at || "").toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </>
        )}
      </div>

      {/* Ações - Alinhadas à direita em desktop */}
      <div className="flex items-center gap-2 shrink-0 relative z-30">
        {/* Botão Principal - Estudar - Mais Vibrante */}
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onStudy();
          }}
          aria-label={`Estudar deck ${deck.title}`}
          aria-describedby={`deck-${deck.id}-description`}
          className={`relative z-30 gradient-primary text-white hover:opacity-95 active:opacity-100 shadow-lg hover:shadow-xl glow-primary hover-lift transition-all duration-300 keyboard-navigation min-h-[44px] min-w-[44px] touch-manipulation font-semibold pointer-events-auto [&_span]:text-white [&_span]:font-semibold ${
            deck.type === 'quiz' ? 'gradient-accent glow-accent' : ''
          }`}
          size="sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onStudy();
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Play className="h-4 w-4 mr-2 text-white" aria-hidden="true" />
          <span className="hidden sm:inline text-white font-semibold">Estudar</span>
          <span className="sm:hidden text-white font-semibold">Iniciar</span>
        </Button>
        
        <div id={`deck-${deck.id}-description`} className="sr-only">
          Deck {deck.type === 'quiz' ? 'de quiz' : 'de flashcards'} criado em {new Date(deck.created_at || "").toLocaleDateString('pt-BR')}
        </div>

        {/* Dropdown Menu para ações secundárias */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative z-30 h-9 w-9 border-border/50 hover:bg-accent pointer-events-auto"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Mais opções</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onManage && (
              <>
                <DropdownMenuItem onClick={onManage} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar título
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar deck
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <p className="text-sm font-medium mb-4">
                  Tem certeza que deseja deletar este deck?
                  <br />
                  <span className="text-muted-foreground">Esta ação não pode ser desfeita.</span>
                </p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

// Memoização para evitar re-renders desnecessários
export default memo(DeckItem, (prevProps, nextProps) => {
  return (
    prevProps.deck.id === nextProps.deck.id &&
    prevProps.deck.title === nextProps.deck.title &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editedTitle === nextProps.editedTitle &&
    prevProps.isSaving === nextProps.isSaving
  );
});
