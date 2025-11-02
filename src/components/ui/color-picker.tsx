import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ColorOption {
  name: string;
  value: string;
  gradient: string;
  textColor: string;
}

const DEFAULT_COLORS: ColorOption[] = [
  {
    name: "Azul",
    value: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    textColor: "text-blue-600",
  },
  {
    name: "Roxo",
    value: "#A855F7",
    gradient: "from-purple-500 to-purple-600",
    textColor: "text-purple-600",
  },
  {
    name: "Verde",
    value: "#10B981",
    gradient: "from-green-500 to-green-600",
    textColor: "text-green-600",
  },
  {
    name: "Rosa",
    value: "#EC4899",
    gradient: "from-pink-500 to-pink-600",
    textColor: "text-pink-600",
  },
  {
    name: "Laranja",
    value: "#F59E0B",
    gradient: "from-orange-500 to-orange-600",
    textColor: "text-orange-600",
  },
  {
    name: "Vermelho",
    value: "#EF4444",
    gradient: "from-red-500 to-red-600",
    textColor: "text-red-600",
  },
  {
    name: "Ciano",
    value: "#06B6D4",
    gradient: "from-cyan-500 to-cyan-600",
    textColor: "text-cyan-600",
  },
  {
    name: "Índigo",
    value: "#6366F1",
    gradient: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-600",
  },
];

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  colors?: ColorOption[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  className,
}: ColorPickerProps) {
  const selectedColor = colors.find((c) => c.value === value) || colors[0];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        Cor dos Flashcards
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange?.(color.value)}
            className={cn(
              "relative w-full aspect-square rounded-lg transition-all duration-200",
              "bg-gradient-to-br",
              color.gradient,
              "hover:scale-110 hover:shadow-lg",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              value === color.value && "ring-2 ring-offset-2 ring-primary scale-110"
            )}
            title={color.name}
            aria-label={`Selecionar cor ${color.name}`}
          >
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Cor selecionada: <span className={cn("font-medium", selectedColor.textColor)}>{selectedColor.name}</span>
      </p>
    </div>
  );
}

