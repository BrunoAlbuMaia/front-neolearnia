// src/components/Sidebar.tsx
import { Button } from "./button";
import { ThemeToggle } from "../ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "./sheet"; 
import { BarChart3, LogOut, Menu, Home, CircleArrowOutDownLeftIcon, Crown } from "lucide-react";
import React, { useMemo } from "react";
import { useLocation } from "wouter";
import logo_mymemorize from "../../assets/logo_mymemorize.png";

interface SidebarProps {
  user: any;
  onLogout: () => void;
  onNavigateToReviewMode:() => void;
  onNavigateToDashboard: () => void;
  onNavigateToHome: () => void;
  onNavigateToPlans: () => void;
  onNavigateToAnalytics?: () => void;
}

// Mapeamento de rotas para nomes de navegação
const routeToName: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/': 'Home',
  '/review': 'Revisão Diária',
  '/analytics': 'Analytics',
  '/plans': 'Planos',
  '/settings': 'Configurações',
};

interface NavLinkProps {
  name: string;
  Icon: React.ElementType;
  onClick: () => void;
  isActive?: boolean;
  dataTestId: string;
}

const NavLink = ({ name, Icon, onClick, isActive, dataTestId }: NavLinkProps) => (
  <Button
    variant="ghost"
    className={`w-full justify-start text-base py-2.5 px-4 rounded-lg transition-all duration-300 font-medium
      ${isActive 
        ? 'bg-primary text-primary-foreground shadow-md' 
        : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-l-2 hover:border-primary'
      }`}
    onClick={onClick}
    data-testid={dataTestId}
  >
    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-foreground' : ''}`} />
    {name}
  </Button>
);

export default function Sidebar({ 
  user, 
  onLogout, 
  onNavigateToReviewMode,
  onNavigateToDashboard, 
  onNavigateToHome,
  onNavigateToPlans,
  onNavigateToAnalytics
}: SidebarProps) {
  const [location] = useLocation();
  
  // Determinar item ativo baseado na rota atual
  const activeItem = useMemo(() => {
    // Verificar rotas específicas primeiro
    if (location.startsWith('/study')) {
      return null; // Não destacar nada durante estudo
    }
    return routeToName[location] || 'Dashboard';
  }, [location]);

  // Navegação com mapeamento de rotas
  interface NavItem {
    name: string;
    icon: React.ElementType;
    action: () => void;
    route: string;
    dataTestId: string;
  }

  const navigationItems: NavItem[] = useMemo(() => [
  
    { 
      name: "Home", 
      icon: Home, 
      action: onNavigateToHome, 
      route: '/',
      dataTestId: 'sidebar-link-dashboard' 
    },
    { 
      name: "Daily review", 
      icon: CircleArrowOutDownLeftIcon, 
      action: onNavigateToReviewMode, 
      route: '/review',
      dataTestId: 'sidebar-link-reviewMode' 
    },
    ...(onNavigateToAnalytics ? [{
      name: "Analytics",
      icon: BarChart3,
      action: onNavigateToAnalytics,
      route: '/analytics',
      dataTestId: 'sidebar-link-analytics'
    }] : []),
  ] as NavItem[], [onNavigateToDashboard, onNavigateToReviewMode, onNavigateToAnalytics]);

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Logo - Mais Vibrante */}
      <div className="flex flex-col items-center mb-8 px-2 relative">
        {/* Glow por trás da logo */}
        <div className="absolute top-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl rounded-full opacity-50" />
        
        <img
          src={logo_mymemorize}
          alt="MyMemorize Logo"
          loading="lazy"
          decoding="async"
          className="relative w-32 h-32 drop-shadow-[0_0_20px_hsl(262,83%,58%,0.4)] transition-transform duration-300 hover:scale-105 z-10"
        />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          MyMemorize
        </h1>
      </div>


      {/* Navegação */}
      <div className="flex flex-col space-y-1 flex-grow">
        {navigationItems.map((item: NavItem) => (
          <NavLink
            key={item.name}
            name={item.name}
            Icon={item.icon}
            onClick={item.action}
            isActive={activeItem === item.name}
            dataTestId={item.dataTestId}
          />
        ))}
      </div>

      {/* Rodapé */}
      <div className="mt-auto border-t border-border pt-4 flex flex-col space-y-2">
        <div className="px-2">
          <p className="text-sm font-semibold text-foreground truncate" data-testid="text-user-name">
            {user?.email || "Usuário"}
          </p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>

        <ThemeToggle />

        <Button
          variant="ghost"
          className="w-full justify-start text-base text-destructive hover:text-destructive/90 hover:bg-destructive/10 py-2.5 px-4 rounded-lg transition-all duration-300 font-medium border border-destructive/20 hover:border-destructive/40"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Navbar Superior - Mais Moderna */}
      <header className="bg-card/95 backdrop-blur-md border-b-2 border-primary/20 p-3 flex items-center justify-between sticky top-0 z-50 shadow-lg" data-testid="navbar">
      <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-2 w-64 overflow-y-auto">
              {sidebarContent}
            </SheetContent>
          </Sheet>
      
      {/* Logo - Mais Vibrante */}
      <div className="flex items-center space-x-3 group">
        {/* Container com brilho vibrante */}
        <div className="relative flex items-center justify-center">
          {/* Glow por trás - Cores vibrantes */}
          <div className="absolute w-10 h-10 bg-gradient-to-br from-primary/40 to-accent/40 blur-md rounded-lg group-hover:blur-lg transition-all duration-300" />
            
            {/* Logo */}
            <img
              src={logo_mymemorize}
              alt="MyMemorize Logo"
              loading="lazy"
              decoding="async"
              className="relative w-12 h-12 object-contain drop-shadow-[0_0_15px_hsl(262,83%,58%,0.5)] transition-transform duration-300 group-hover:scale-110 z-10"
            />
          </div>

          {/* Nome com gradiente vibrante */}
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            MyMemorize
          </h1>
        </div>

        {/* Botões Tema, Planos e Menu */}
        <div className="flex items-center space-x-2">
          {/* Botão Planos destacado - sempre visível */}
          <Button
            variant="default"
            size="sm"
            onClick={onNavigateToPlans}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 hidden sm:flex items-center gap-2 font-semibold"
            data-testid="navbar-button-plans"
          >
            <Crown className="h-4 w-4" />
            <span>Planos</span>
          </Button>
          
          <ThemeToggle />
         
        </div>
      </header>
    </>
  );
}
