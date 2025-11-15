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

export default function DeckItem({
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
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 md:p-5 border border-border/50 rounded-xl bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {/* Informações do Deck */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 text-sm"
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
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {deck.title}
              </h3>
              {deck.type && (
                <Badge 
                  variant="outline" 
                  className={`shrink-0 text-xs ${
                    deck.type === 'quiz' 
                      ? 'border-primary/30 bg-primary/5 text-primary' 
                      : 'border-muted-foreground/30 bg-muted/50 text-muted-foreground'
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
            <p className="text-xs text-muted-foreground">
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
      <div className="flex items-center gap-2 shrink-0">
        {/* Botão Principal - Estudar */}
        <Button 
          onClick={onStudy}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow transition-all"
          size="sm"
        >
          <Play className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Estudar</span>
          <span className="sm:hidden">Iniciar</span>
        </Button>

        {/* Dropdown Menu para ações secundárias */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50 hover:bg-accent"
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
