# NeoLearnIA - Arquitetura do Projeto

## 📁 Estrutura de Pastas

```
src/
├── api/                    # Camada de serviços API
│   ├── client.ts          # Cliente HTTP base
│   ├── flashcardsApi.ts   # Endpoints de flashcards
│   ├── studyApi.ts        # Endpoints de estudo
│   ├── analyticsApi.ts    # Endpoints de analytics
│   ├── authApi.ts         # Endpoints de autenticação
│   └── index.ts           # Exportações centralizadas
│
├── hooks/                  # Hooks customizados
│   ├── useFlashcards.ts   # Lógica de flashcards
│   ├── useStudySession.ts # Lógica de sessão de estudo
│   ├── useAnalytics.ts    # Lógica de analytics
│   ├── useAuth.ts         # Lógica de autenticação
│   ├── use-toast.ts       # Hook de notificações
│   ├── use-mobile.tsx     # Hook de detecção mobile
│   └── index.ts           # Exportações centralizadas
│
├── components/            # Componentes React (UI pura)
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── Dashboard.tsx     # Painel principal
│   ├── StudyMode.tsx     # Modo de estudo
│   ├── AnalyticsPage.tsx # Página de analytics
│   └── AuthScreen.tsx    # Tela de autenticação
│
├── types/                # Tipos TypeScript centralizados
│   └── index.ts         # Interfaces e tipos
│
├── lib/                  # Utilitários e configurações
│   ├── firebase.ts      # Configuração Firebase
│   ├── queryClient.ts   # Cliente React Query
│   └── utils.ts         # Funções auxiliares
│
└── pages/               # Páginas da aplicação
    ├── Home.tsx
    └── not-found.tsx
```

## 🏗️ Princípios de Arquitetura

### Clean Architecture

A aplicação segue os princípios da Clean Architecture com separação clara de responsabilidades:

1. **Camada de Apresentação (UI)**: Componentes React puros que apenas renderizam dados
2. **Camada de Lógica de Negócio**: Hooks customizados que gerenciam estado e regras
3. **Camada de Dados**: Serviços API que fazem comunicação HTTP

### SOLID

- **Single Responsibility**: Cada módulo tem uma única responsabilidade
- **Open/Closed**: Código aberto para extensão, fechado para modificação
- **Liskov Substitution**: Interfaces consistentes
- **Interface Segregation**: APIs específicas por domínio
- **Dependency Inversion**: Componentes dependem de abstrações (hooks)

### Separation of Concerns

- ✅ **Nenhuma chamada de API nos componentes**
- ✅ **Lógica de estado isolada em hooks**
- ✅ **Serviços API centralizados em `src/api/`**
- ✅ **Tipos compartilhados em `src/types/`**

## 🔄 Fluxo de Dados

```
Componente → Hook → Serviço API → Backend
    ↑                                  ↓
    └────────── Estado Atualizado ─────┘
```

### Exemplo: Gerar Flashcards

1. **Componente** (`Dashboard.tsx`): Renderiza UI e chama `generateFlashcards.mutate()`
2. **Hook** (`useFlashcards.ts`): Gerencia estado e invalidação de cache
3. **Serviço** (`flashcardsApi.ts`): Faz request HTTP para backend
4. **Backend**: Processa e retorna dados
5. **React Query**: Atualiza cache automaticamente
6. **Componente**: Re-renderiza com novos dados

## 📦 Camada de API

### Estrutura

Todos os serviços de API estão em `src/api/`:

```typescript
// src/api/flashcardsApi.ts
export const flashcardsApi = {
  generateFlashcards: (payload) => apiRequest('POST', '/api/flashcards/generate', payload),
  getFlashcardsBySetId: (setId) => apiGet(`/api/flashcards?setId=${setId}`),
  // ...
};
```

### Cliente HTTP

O cliente HTTP base (`src/api/client.ts`) gerencia:
- Headers de autenticação
- Tratamento de erros
- Serialização de dados

## 🎣 Hooks Customizados

### useFlashcards

```typescript
const { data: decks, isLoading } = useFlashcardSets();
const generateFlashcards = useGenerateFlashcards();
const deleteDeck = useDeleteFlashcardSet();
```

### useStudySession

```typescript
const {
  sessionId,
  stats,
  updateStats,
  recordReview,
  finalizeSession
} = useStudySession(flashcardSetId, totalCards);
```

### useAnalytics

```typescript
const { 
  progressData, 
  difficultyStats, 
  timeData, 
  isLoading 
} = useAnalytics(view);
```

## 🎨 Componentes

Componentes são **puros** e apenas:
- Renderizam dados recebidos via props ou hooks
- Disparam ações via callbacks
- **Não contêm lógica de negócio**
- **Não fazem chamadas de API diretas**

### Exemplo

```typescript
// ❌ ANTES (lógica no componente)
const Component = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  
  return <div>{data.map(...)}</div>;
};

// ✅ DEPOIS (lógica no hook)
const Component = () => {
  const { data } = useMyData();
  
  return <div>{data.map(...)}</div>;
};
```

## 🔧 Manutenção e Extensão

### Adicionar novo endpoint

1. Criar função em `src/api/[domain]Api.ts`
2. Adicionar tipos em `src/types/index.ts`
3. Criar hook em `src/hooks/use[Domain].ts`
4. Usar no componente

### Modificar lógica de negócio

Editar apenas o hook correspondente em `src/hooks/`

### Adicionar novo componente

Criar em `src/components/` e usar hooks existentes

## 📊 Benefícios da Arquitetura

✅ **Testabilidade**: Hooks e serviços podem ser testados isoladamente
✅ **Manutenibilidade**: Mudanças em uma camada não afetam outras
✅ **Escalabilidade**: Fácil adicionar novos recursos
✅ **Reutilização**: Hooks podem ser compartilhados entre componentes
✅ **Type Safety**: TypeScript garante tipos em toda aplicação
✅ **Performance**: React Query gerencia cache automaticamente
