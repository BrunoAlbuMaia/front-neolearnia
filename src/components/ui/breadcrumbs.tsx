import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [location, setLocation] = useLocation();

  // Se não há items, gerar automaticamente baseado na rota
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const routes: Record<string, BreadcrumbItem[]> = {
      '/dashboard': [
        { label: 'Dashboard', path: '/dashboard' }
      ],
      '/review': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Revisão Diária', path: '/review' }
      ],
      '/analytics': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Analytics', path: '/analytics' }
      ],
      '/plans': [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Planos', path: '/plans' }
      ],
      '/onboarding': [
        { label: 'Onboarding', path: '/onboarding' }
      ],
    };

    // Verificar se é rota de estudo
    if (location.startsWith('/study/')) {
      const deckId = location.split('/study/')[1];
      return [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Estudar', path: location }
      ];
    }

    return routes[location] || [{ label: 'Dashboard', path: '/dashboard' }];
  })();

  if (breadcrumbItems.length <= 1) {
    return null; // Não mostrar breadcrumbs se há apenas um item
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation('/dashboard')}
        className="h-6 px-2 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => item.path && setLocation(item.path)}
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

