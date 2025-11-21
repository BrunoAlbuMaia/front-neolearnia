/**
 * COMPONENTES DE TIPOGRAFIA PADRONIZADOS
 * 
 * Sistema de tipografia consistente para toda a aplicação
 * Baseado no design-tokens.ts
 */

import { cn } from "../../lib/utils";
import { type ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

/**
 * H1 - Título Principal
 * Uso: Títulos de páginas principais
 */
export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "text-4xl font-bold tracking-tight text-foreground",
      className
    )}>
      {children}
    </h1>
  );
}

/**
 * H2 - Título de Seção
 * Uso: Títulos de seções principais
 */
export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "text-3xl font-semibold tracking-tight text-foreground",
      className
    )}>
      {children}
    </h2>
  );
}

/**
 * H3 - Subtítulo
 * Uso: Subtítulos e títulos de subseções
 */
export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "text-2xl font-semibold text-foreground",
      className
    )}>
      {children}
    </h3>
  );
}

/**
 * H4 - Título Pequeno
 * Uso: Títulos de cards, modais
 */
export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "text-xl font-semibold text-foreground",
      className
    )}>
      {children}
    </h4>
  );
}

/**
 * Body - Texto Padrão
 * Uso: Texto do corpo principal
 */
export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-base text-foreground",
      className
    )}>
      {children}
    </p>
  );
}

/**
 * BodyLarge - Texto Maior
 * Uso: Texto destacado, descrições importantes
 */
export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg text-foreground",
      className
    )}>
      {children}
    </p>
  );
}

/**
 * Small - Texto Pequeno
 * Uso: Labels, hints, informações secundárias
 */
export function Small({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-sm text-muted-foreground",
      className
    )}>
      {children}
    </span>
  );
}

/**
 * Tiny - Texto Muito Pequeno
 * Uso: Timestamps, badges pequenos
 */
export function Tiny({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-xs text-muted-foreground",
      className
    )}>
      {children}
    </span>
  );
}

/**
 * Lead - Texto de Destaque
 * Uso: Primeira linha de parágrafos, descrições importantes
 */
export function Lead({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg text-muted-foreground",
      className
    )}>
      {children}
    </p>
  );
}

/**
 * Muted - Texto Secundário com Melhor Contraste
 * Uso: Textos secundários que precisam ser legíveis
 */
export function Muted({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-sm text-foreground/70", // Melhor contraste que text-muted-foreground
      className
    )}>
      {children}
    </span>
  );
}

