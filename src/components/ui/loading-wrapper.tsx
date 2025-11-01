import * as React from "react"
import { Spinner, type SpinnerProps } from "./spinner"
import { cn } from "../../lib/utils"

export interface LoadingWrapperProps extends SpinnerProps {
  /** Estado de carregamento - quando true, mostra o spinner */
  isLoading: boolean
  /** Conteúdo a ser exibido quando não estiver carregando */
  children: React.ReactNode
  /** Componente customizado para exibir durante o loading (opcional) */
  fallback?: React.ReactNode
}

/**
 * Wrapper component que exibe um spinner enquanto isLoading é true,
 * caso contrário exibe o children.
 * 
 * Facilita o uso comum do spinner com estados de loading do React Query.
 * 
 * @example
 * // Uso básico
 * <LoadingWrapper isLoading={isLoadingDecks}>
 *   <DecksList decks={decks} />
 * </LoadingWrapper>
 * 
 * @example
 * // Com props customizadas do spinner
 * <LoadingWrapper 
 *   isLoading={isLoading} 
 *   size="lg" 
 *   text="Carregando dados..."
 * >
 *   <DataDisplay data={data} />
 * </LoadingWrapper>
 * 
 * @example
 * // Com fallback customizado
 * <LoadingWrapper 
 *   isLoading={isLoading} 
 *   fallback={<CustomSkeleton />}
 * >
 *   <Content />
 * </LoadingWrapper>
 */
const LoadingWrapper = React.forwardRef<HTMLDivElement, LoadingWrapperProps>(
  ({ isLoading, children, fallback, className, ...spinnerProps }, ref) => {
    if (isLoading) {
      return fallback || (
        <Spinner
          ref={ref}
          className={cn("min-h-[200px]", className)}
          {...spinnerProps}
        />
      )
    }

    return <>{children}</>
  }
)
LoadingWrapper.displayName = "LoadingWrapper"

export { LoadingWrapper }

