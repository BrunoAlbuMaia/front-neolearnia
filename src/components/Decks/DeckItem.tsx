import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Trash2, Edit2, Play, Check, X, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";

interface DeckItemProps {
  deck: any;
  isEditing: boolean;
  editedTitle: string;
  setEditedTitle: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStudy: () => void;
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
  isSaving,
}: DeckItemProps) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-card/40 hover:bg-muted/30 transition-colors"
    >
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <h3 className="font-medium text-sm text-foreground">{deck.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criado em {new Date(deck.created_at || "").toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="h-8" onClick={onStudy}>
          <Play className="h-4 w-4 mr-1" /> Estudar
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <p className="text-sm font-medium mb-4">
              Tem certeza que deseja deletar este deck?
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Deletar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
