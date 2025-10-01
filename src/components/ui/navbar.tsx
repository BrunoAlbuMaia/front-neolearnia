// src/components/Navbar.tsx

import { Button } from "./ui/button"; // Certifique-se que o caminho para seus componentes ui está correto
import { ThemeToggle } from "./ThemeToggle"; // E para o ThemeToggle também
import { Brain, BarChart3, LogOut } from "lucide-react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onNavigateToAnalytics?: () => void;
}

export default function Navbar({ user, onLogout, onNavigateToAnalytics }: NavbarProps) {
  return (
    <nav className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
      {/*
        ESTA É A ESTRUTURA CORRETA E DEFINITIVA:
        - 'flex-wrap': Permite que os blocos de Logo e Ações quebrem a linha.
        - 'justify-center': No mobile, centraliza tudo para um visual limpo.
        - 'md:justify-between': No desktop, alinha o logo à esquerda e as ações à direita.
      */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-4">
        
        {/* Seção do Logo (Esquerda) */}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-bold text-foreground">NeoLearnIA</h1>
        </div>

        {/* Seção de Ações (Direita) */}
        <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2">
          {onNavigateToAnalytics && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToAnalytics}
              className="flex items-center gap-2"
              data-testid="button-analytics"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          )}
          
          <ThemeToggle />
          
          <span className="text-sm text-muted-foreground hidden lg:block" data-testid="text-user-name">
            {user?.email || "Usuário"}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}