# NeoLearnIA - Flashcards Inteligentes com IA

## 📋 Visão Geral

Aplicação web de flashcards inteligentes que usa IA para gerar cards de estudo a partir de conteúdo fornecido pelo usuário. O sistema acompanha o progresso do estudante e fornece analytics detalhados.

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture**, **SOLID** e **Separation of Concerns**.

### Estrutura de Pastas

```
src/
├── api/          # Camada de serviços HTTP (flashcards, study, analytics, auth)
├── hooks/        # Hooks customizados com lógica de negócio
├── components/   # Componentes React puros (apenas UI)
├── types/        # Tipos e interfaces TypeScript
├── lib/          # Utilitários (firebase, queryClient)
└── pages/        # Páginas da aplicação
```

### Princípios Aplicados

- ✅ Nenhuma chamada de API nos componentes
- ✅ Lógica de estado isolada em hooks customizados
- ✅ Serviços API centralizados em `src/api/`
- ✅ Componentes puros (apenas UI + props)
- ✅ Types compartilhados

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter
- **Auth**: Firebase Authentication
- **Build Tool**: Vite
- **Backend API**: Railway (external)

## 🔑 Variáveis de Ambiente

```
GOOGLE_API_KEY         # Firebase API Key
OPENAI_API_KEY         # OpenAI para gerar flashcards
VITE_LINK_API          # URL da API backend
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_PROJECT_ID
```

## 🚀 Funcionalidades Principais

1. **Geração de Flashcards**: IA gera flashcards a partir de texto
2. **Gestão de Decks**: Criar, visualizar e deletar decks
3. **Modo de Estudo**: Revisar flashcards com feedback de dificuldade
4. **Analytics**: Progresso, dificuldade, tempo de estudo
5. **Autenticação**: Login/Registro com Firebase

## 📦 Camadas da Aplicação

### API Layer (`src/api/`)

Responsável por toda comunicação HTTP:

```typescript
// flashcardsApi.ts - Endpoints de flashcards
// studyApi.ts - Sessões de estudo
// analyticsApi.ts - Dados de analytics
// authApi.ts - Sincronização de usuários
// client.ts - Cliente HTTP base
```

### Hooks Layer (`src/hooks/`)

Gerencia lógica de negócio e estado:

```typescript
// useFlashcards.ts - Gerencia flashcards e decks
// useStudySession.ts - Controla sessões de estudo
// useAnalytics.ts - Busca dados de analytics
// useAuth.ts - Sincronização de usuários
```

### Components Layer (`src/components/`)

Componentes React puros (apenas UI):

```typescript
// Dashboard.tsx - Tela principal
// StudyMode.tsx - Modo de revisão
// AnalyticsPage.tsx - Dashboard de analytics
// AuthScreen.tsx - Login/Registro
```

## 📝 Exemplo de Uso

### Buscar Flashcard Sets

```typescript
// Hook
const { data: decks, isLoading } = useFlashcardSets();

// Componente
{decks.map(deck => <DeckCard key={deck.id} {...deck} />)}
```

### Gerar Flashcards

```typescript
// Hook
const generateFlashcards = useGenerateFlashcards();

// Componente
<Button onClick={() => generateFlashcards.mutate({ text, title })}>
  Gerar
</Button>
```

## 🔄 Fluxo de Dados

```
User Action → Component → Hook → API Service → Backend
                 ↑                                ↓
                 └────── React Query Cache ───────┘
```

## 🧪 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Lint do código
```

## 📚 Documentação Adicional

Consulte `src/README.md` para detalhes completos da arquitetura.

## 🎯 Próximos Passos

- [ ] Testes unitários para hooks
- [ ] Testes de integração para API
- [ ] PWA support
- [ ] Modo offline
- [ ] Spaced repetition algorithm
