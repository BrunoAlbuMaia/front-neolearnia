import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        secondary: "text-secondary-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Texto opcional exibido abaixo do spinner */
  text?: string
  /** Se true, o spinner cobre toda a tela com overlay */
  fullScreen?: boolean
}

/**
 * Componente de Spinner reutilizável para indicar estado de carregamento
 * 
 * @example
 * // Spinner inline simples
 * <Spinner />
 * 
 * @example
 * // Spinner com texto
 * <Spinner size="lg" text="Carregando..." />
 * 
 * @example
 * // Spinner fullscreen
 * {isLoading && <Spinner fullScreen text="Carregando dados..." />}
 * 
 * @example
 * // Spinner pequeno em botão
 * <Button disabled={isLoading}>
 *   {isLoading ? <Spinner size="sm" /> : "Enviar"}
 * </Button>
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, text, fullScreen = false, ...props }, ref) => {
    const spinnerContent = (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
          className
        )}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size, variant }))} />
        {text && (
          <p className={cn(
            "text-sm text-muted-foreground",
            size === "sm" && "text-xs",
            size === "lg" && "text-base",
            size === "xl" && "text-lg"
          )}>
            {text}
          </p>
        )}
      </div>
    )

    return spinnerContent
  }
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }

