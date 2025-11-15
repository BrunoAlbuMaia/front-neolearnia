# 📚 NeoLearnIA - Plataforma de Estudo Inteligente

Uma plataforma moderna de estudo que utiliza Inteligência Artificial para gerar flashcards e quizzes personalizados, ajudando estudantes a otimizar seu aprendizado através de técnicas de repetição espaçada e análise de progresso.

## 🎯 Visão Geral

O **NeoLearnIA** é uma aplicação web completa que permite aos usuários:
- **Gerar flashcards e quizzes automaticamente** usando IA a partir de qualquer conteúdo de texto
- **Criar e gerenciar decks manualmente** sem depender de IA
- **Estudar de forma interativa** com feedback de dificuldade e acompanhamento de progresso
- **Visualizar analytics detalhados** sobre seu desempenho e tempo de estudo
- **Gerenciar conteúdo** com edição e exclusão de flashcards e quizzes

## ✨ Funcionalidades Principais

### 🤖 Geração com IA
- Geração automática de flashcards a partir de texto
- Geração automática de quizzes com múltipla escolha
- Personalização de quantidade de cards/perguntas
- Seleção de cor personalizada para cada deck

### 📝 Criação Manual
- Criação de decks vazios (flashcards ou quizzes)
- Adição manual de flashcards (pergunta e resposta)
- Adição manual de quizzes (pergunta com 4 opções)
- Edição completa de conteúdo existente
- Exclusão de decks, flashcards e quizzes

### 📖 Modo de Estudo
- **Modo Flashcard**: Estudo interativo com feedback de dificuldade (fácil, médio, difícil)
- **Modo Quiz**: Responda perguntas de múltipla escolha e veja seu desempenho
- Acompanhamento de tempo de estudo
- Sistema de revisão espaçada
- Registro automático de sessões de estudo

### 📊 Analytics e Progresso
- Dashboard com estatísticas de estudo
- Gráficos de progresso ao longo do tempo
- Análise de dificuldade dos cards
- Tempo total de estudo
- Metas semanais e streaks

### 👤 Autenticação e Perfil
- Login e registro com Firebase Authentication
- Onboarding personalizado para novos usuários
- Gerenciamento de perfil e preferências
- Sincronização de dados entre dispositivos

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para maior segurança de código
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Animações fluidas e interativas

### Gerenciamento de Estado
- **TanStack Query (React Query)** - Gerenciamento de estado do servidor e cache
- **React Context API** - Gerenciamento de estado global (autenticação, loading)

### Roteamento e Navegação
- **Wouter** - Roteador leve e rápido para React

### Autenticação
- **Firebase Authentication** - Autenticação de usuários
- **Firebase Firestore** - Banco de dados NoSQL (opcional)

### Backend
- API REST externa (Railway)
- Integração com OpenAI para geração de conteúdo

## 📁 Estrutura do Projeto

```
front-neolearnia/
├── src/
│   ├── api/                    # Camada de serviços HTTP
│   │   ├── client.ts          # Cliente HTTP base com autenticação
│   │   ├── flashcardsApi.ts   # Endpoints de flashcards
│   │   ├── quizzesApi.ts      # Endpoints de quizzes
│   │   ├── studyApi.ts        # Endpoints de sessões de estudo
│   │   ├── analyticsApi.ts    # Endpoints de analytics
│   │   └── authApi.ts         # Endpoints de autenticação
│   │
│   ├── components/            # Componentes React (UI)
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── Dashboard.tsx     # Painel principal
│   │   ├── StudyMode.tsx     # Modo de estudo flashcards
│   │   ├── QuizMode.tsx      # Modo de estudo quizzes
│   │   ├── DeckManager.tsx   # Gerenciador de conteúdo do deck
│   │   ├── FlashcardForm.tsx # Formulário de flashcard
│   │   ├── QuizForm.tsx      # Formulário de quiz
│   │   └── AnalyticsPage.tsx # Página de analytics
│   │
│   ├── hooks/                # Hooks customizados
│   │   ├── useFlashcards.ts # Lógica de flashcards
│   │   ├── useQuizzes.ts    # Lógica de quizzes
│   │   ├── useStudySession.ts # Sessões de estudo
│   │   ├── useAnalytics.ts  # Analytics
│   │   └── useAuth.ts       # Autenticação
│   │
│   ├── pages/                # Páginas da aplicação
│   │   └── Home/            # Páginas principais
│   │
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts        # Interfaces centralizadas
│   │
│   ├── lib/                 # Utilitários
│   │   ├── firebase/       # Configuração Firebase
│   │   └── utils.ts        # Funções auxiliares
│   │
│   └── context/            # Contextos React
│       ├── AuthContext.tsx # Contexto de autenticação
│       └── LoadingContext.tsx # Contexto de loading
│
├── public/                 # Arquivos estáticos
├── package.json           # Dependências do projeto
└── vite.config.ts         # Configuração do Vite
```

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Separation of Concerns**:

### Camadas da Aplicação

1. **Camada de Apresentação (UI)**
   - Componentes React puros
   - Apenas renderização e interação do usuário
   - Sem lógica de negócio

2. **Camada de Hooks**
   - Lógica de negócio isolada
   - Gerenciamento de estado
   - Integração com APIs

3. **Camada de API**
   - Serviços HTTP centralizados
   - Tratamento de erros
   - Autenticação e sessão

### Princípios Aplicados

- ✅ **Nenhuma chamada de API diretamente nos componentes**
- ✅ **Lógica de estado isolada em hooks customizados**
- ✅ **Serviços API centralizados**
- ✅ **Componentes puros (apenas UI + props)**
- ✅ **Types compartilhados e tipados**

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta Firebase configurada
- Acesso à API backend

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd front-neolearnia
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_APP_ID=seu-app-id
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_LINK_API=https://sua-api.com
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Executa o linter
```

## 🔑 Funcionalidades Detalhadas

### Geração de Conteúdo com IA

1. **Flashcards**
   - Cole ou digite o conteúdo de estudo
   - Escolha a quantidade de cards desejada
   - Selecione um deck existente ou crie um novo
   - A IA gera flashcards automaticamente

2. **Quizzes**
   - Forneça o conteúdo base
   - Defina a quantidade de perguntas
   - A IA cria perguntas de múltipla escolha com 4 opções

### Criação Manual

1. **Criar Deck**
   - Clique em "Criar Deck" na tela de decks
   - Escolha o tipo (Flashcard ou Quiz)
   - Defina título e cor
   - Adicione conteúdo manualmente depois

2. **Gerenciar Conteúdo**
   - Acesse "Gerenciar" em qualquer deck
   - Adicione, edite ou exclua flashcards/quizzes
   - Organize seu conteúdo como preferir

### Modo de Estudo

1. **Flashcards**
   - Visualize a pergunta
   - Revele a resposta
   - Classifique a dificuldade
   - Acompanhe seu progresso

2. **Quizzes**
   - Responda perguntas de múltipla escolha
   - Veja feedback imediato
   - Acompanhe sua pontuação
   - Revise respostas incorretas

## 🔄 Fluxo de Dados

```
User Action → Component → Hook → API Service → Backend
                 ↑                                ↓
                 └────── React Query Cache ───────┘
```

1. Usuário interage com a interface
2. Componente chama hook customizado
3. Hook faz requisição via API service
4. Dados são armazenados em cache (React Query)
5. Componente re-renderiza com novos dados

## 🎨 Design e UX

- **Design Moderno**: Interface limpa e intuitiva
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Dark Mode**: Suporte completo a tema claro/escuro
- **Animações**: Transições suaves com Framer Motion
- **Acessibilidade**: Componentes acessíveis seguindo padrões WCAG

## 📊 API Endpoints Principais

### Flashcards
- `POST /api/flashcards/generate` - Gerar flashcards com IA
- `GET /api/flashcards/{set_id}` - Buscar flashcards de um deck
- `POST /api/flashcards` - Criar flashcard manualmente
- `PATCH /api/flashcards/{set_id}/{id}` - Editar flashcard
- `DELETE /api/flashcards/{set_id}/{id}` - Deletar flashcard

### Quizzes
- `POST /api/quizzes/generate` - Gerar quiz com IA
- `GET /api/quizzes/{set_id}` - Buscar quizzes de um deck
- `POST /api/quizzes` - Criar quiz manualmente
- `PATCH /api/quizzes/{set_id}/{quiz_id}` - Editar quiz
- `DELETE /api/quizzes/{set_id}/{quiz_id}` - Deletar quiz

### Study Sets
- `GET /api/study-sets` - Listar todos os decks
- `POST /api/study-sets` - Criar novo deck
- `PATCH /api/study-sets/{id}` - Editar deck
- `DELETE /api/study-sets/{id}` - Deletar deck

### Study Sessions
- `POST /api/card-reviews/study` - Registrar revisão de card
- `GET /api/analytics` - Buscar dados de analytics

## 🧪 Testes

Atualmente, o projeto não possui testes automatizados, mas está preparado para:
- Testes unitários de hooks
- Testes de integração de API
- Testes de componentes com React Testing Library

## 🚧 Próximas Melhorias

- [ ] Implementação de algoritmo de repetição espaçada (Spaced Repetition)
- [ ] Modo offline com Service Workers
- [ ] Suporte a PWA (Progressive Web App)
- [ ] Exportação de decks em PDF
- [ ] Compartilhamento de decks entre usuários
- [ ] Modo de estudo colaborativo
- [ ] Suporte a imagens nos flashcards
- [ ] Notificações de revisão programadas

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto privado. Para sugestões ou problemas, entre em contato com a equipe de desenvolvimento.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação da API ou entre em contato com o suporte técnico.

---

Desenvolvido com ❤️ para otimizar o aprendizado através da tecnologia
