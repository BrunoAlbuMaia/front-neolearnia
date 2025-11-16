import { type LucideIcon } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-6 p-4 rounded-full bg-muted/50"
      >
        <Icon className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

