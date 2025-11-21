/**
 * DESIGN TOKENS - Sistema de Design MyMemorize
 * 
 * Este arquivo define todos os tokens de design para garantir
 * consistência visual em toda a aplicação.
 * 
 * Baseado nas recomendações da análise profissional.
 */

export const designTokens = {
  /**
   * PALETA DE CORES PROFISSIONAL
   * Cores menos saturadas, mais profissionais e confiáveis
   */
  colors: {
    // Primária - Azul Confiável
    primary: {
      DEFAULT: '#2563EB', // Blue 600 - Confiança, tecnologia
      hover: '#1D4ED8',   // Blue 700
      light: '#DBEAFE',   // Blue 100
      dark: '#1E40AF',    // Blue 800
    },
    
    // Secundária - Roxo Suave
    secondary: {
      DEFAULT: '#7C3AED', // Violet 600 - Criatividade, inovação
      hover: '#6D28D9',   // Violet 700
      light: '#EDE9FE',   // Violet 100
      dark: '#5B21B6',    // Violet 800
    },
    
    // Acento - Verde Sucesso
    accent: {
      DEFAULT: '#10B981', // Emerald 500 - Sucesso, progresso
      hover: '#059669',   // Emerald 600
      light: '#D1FAE5',   // Emerald 100
      dark: '#047857',    // Emerald 700
    },
    
    // Neutras
    neutral: {
      background: '#F9FAFB',  // Gray 50
      card: '#FFFFFF',
      text: '#111827',        // Gray 900
      muted: '#6B7280',      // Gray 500
      border: '#E5E7EB',     // Gray 200
      hover: '#F3F4F6',      // Gray 100
    },
    
    // Estados
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  /**
   * TIPOGRAFIA - Sistema de Hierarquia
   * Escala consistente e profissional
   */
  typography: {
    // Títulos
    h1: {
      fontSize: '2.25rem',    // text-4xl
      fontWeight: 700,       // font-bold
      lineHeight: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',  // text-3xl
      fontWeight: 600,       // font-semibold
      lineHeight: '2.25rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',    // text-2xl
      fontWeight: 600,       // font-semibold
      lineHeight: '2rem',
    },
    h4: {
      fontSize: '1.25rem',   // text-xl
      fontWeight: 600,
      lineHeight: '1.75rem',
    },
    
    // Corpo
    body: {
      fontSize: '1rem',      // text-base
      fontWeight: 400,
      lineHeight: '1.5rem',
    },
    bodyLarge: {
      fontSize: '1.125rem',  // text-lg
      fontWeight: 400,
      lineHeight: '1.75rem',
    },
    
    // Pequeno
    small: {
      fontSize: '0.875rem',  // text-sm
      fontWeight: 400,
      lineHeight: '1.25rem',
    },
    tiny: {
      fontSize: '0.75rem',   // text-xs
      fontWeight: 400,
      lineHeight: '1rem',
    },
  },

  /**
   * ESPAÇAMENTO - Sistema Consistente
   * Baseado em escala de 4px (0.25rem)
   */
  spacing: {
    xs: '0.5rem',   // 8px - space-y-2
    sm: '0.75rem',  // 12px - space-y-3
    md: '1rem',     // 16px - space-y-4 (padrão para elementos relacionados)
    lg: '1.5rem',   // 24px - space-y-6 (padrão para seções)
    xl: '2rem',     // 32px - space-y-8 (padrão para páginas)
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  /**
   * BORDAS E RADIUS
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px - inputs
    md: '0.5rem',    // 8px - botões
    lg: '0.75rem',   // 12px - cards (padrão)
    xl: '1rem',      // 16px
    full: '9999px',
  },

  /**
   * SOMBRAS - Sistema Reduzido
   * Menos sombras, mais sutis
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',           // shadow-sm - cards básicos
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',        // shadow-md - modals
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',      // shadow-lg - elevated
    // Removido: shadow-xl, shadow-2xl, glow-primary
  },

  /**
   * BORDAS
   */
  borders: {
    DEFAULT: '1px solid',  // border (padrão)
    thick: '2px solid',     // border-2 (apenas quando necessário)
  },
} as const;

/**
 * UTILITÁRIOS PARA USO EM COMPONENTES
 */
export const tokens = {
  // Classes Tailwind pré-definidas para tipografia
  typography: {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    body: 'text-base',
    bodyLarge: 'text-lg',
    small: 'text-sm',
    tiny: 'text-xs',
  },
  
  // Espaçamento consistente
  spacing: {
    card: 'p-6',           // Cards padrão
    cardCompact: 'p-4',  // Cards compactos
    section: 'space-y-6', // Seções padrão
    page: 'space-y-8',    // Páginas
  },
  
  // Sombras padronizadas
  shadows: {
    card: 'shadow-sm',    // Cards padrão
    modal: 'shadow-md',   // Modals
    elevated: 'shadow-lg', // Elementos elevados
  },
  
  // Bordas padronizadas
  borders: {
    DEFAULT: 'border',
    thick: 'border-2',
  },
} as const;

