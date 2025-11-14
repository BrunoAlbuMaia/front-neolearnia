// src/components/Sidebar.tsx
import { Button } from "./button";
import { ThemeToggle } from "../ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "./sheet"; 
import { Brain, BarChart3, LogOut, Menu, Home, Settings, CircleArrowOutDownLeftIcon, Crown } from "lucide-react";
import React, { useState } from "react";
import logo_mymemorize from "../../assets/logo_mymemorize.png";

interface SidebarProps {
  user: any;
  onLogout: () => void;
  onNavigateToReviewMode:() => void;
  onNavigateToDashboard: () => void;
  onNavigateToHome: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPlans: () => void;
}

// Navegação
const navigationItems = [
  { name: "Início", icon: Home, action: 'onNavigateToHome', dataTestId: 'sidebar-link-home' },
  { name: "Dashboard", icon: BarChart3, action: 'onNavigateToDashboard', dataTestId: 'sidebar-link-dasboard' },
  { name: "Revisão Diária", icon: CircleArrowOutDownLeftIcon, action: 'onNavigateToReviewMode', dataTestId: 'sidebar-link-reviewMode' },
 
  //{ name: "Planos", icon: Crown, action: 'onNavigateToPlans', dataTestId: 'sidebar-link-plans' },
  //{ name: "Configurações", icon: Settings, action: 'onNavigateToSettings', dataTestId: 'sidebar-link-settings' },
  
];

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
    className={`w-full justify-start text-base py-2 px-3 rounded-md transition-colors duration-200
      ${isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
    onClick={onClick}
    data-testid={dataTestId}
  >
    <Icon className="h-5 w-5 mr-3" />
    {name}
  </Button>
);

export default function Sidebar({ 
  user, 
  onLogout, 
  onNavigateToReviewMode,
  onNavigateToDashboard, 
  onNavigateToHome,
  onNavigateToSettings,
  onNavigateToPlans
}: SidebarProps) {
  const actionsMap = {
    onNavigateToHome,
    onNavigateToReviewMode,
    onNavigateToDashboard,
    onNavigateToSettings,
    onNavigateToPlans
  };

  // Estado para o item ativo
  const [activeItem, setActiveItem] = useState('Início');

  const sidebarContent = (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 px-2">
      <img
            src={logo_mymemorize}
            alt="logo_mymemorize"
            className="w-32 h-32 drop-shadow-md transition-transform duration-300 hover:scale-105"
          />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground  text-accent">
          MyMemorize
        </h1>
      </div>


      {/* Navegação */}
      <div className="flex flex-col space-y-1 flex-grow">
        {navigationItems.map(item => {
          const actionFn = () => {
            setActiveItem(item.name);
            (actionsMap[item.action as keyof typeof actionsMap])();
          };
          return (
            <NavLink
              key={item.name}
              name={item.name}
              Icon={item.icon}
              onClick={actionFn}
              isActive={activeItem === item.name}
              dataTestId={item.dataTestId}
            />
          );
        })}
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
          className="w-full justify-start text-base text-red-500 hover:text-red-600 hover:bg-muted py-2 px-3 rounded-md"
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
      {/* Navbar Superior */}
      <header className="bg-card border-b border-border p-2 flex items-center justify-between sticky top-0 z-50 shadow-sm" data-testid="navbar">
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
      
      {/* Logo */}
      <div className="flex items-center space-x-3 group">
        {/* Container com leve brilho */}
        <div className="relative flex items-center justify-center">
          {/* Glow por trás */}
          <div className="absolute w-10 h-10 bg-indigo-500/30 blur-md rounded-lg group-hover:blur-lg transition-all duration-300" />
            
            {/* Logo */}
            <img
              src={logo_mymemorize}
              alt="logo_mymemorize"
              className="relative w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.6)] transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Nome com destaque visual */}
          <h1 className="text-xl font-extrabold tracking-tight text-foreground  from-indigo-500 to-purple-500 bg-clip-text text-transparent bg-accent text-accent-foreground hover:bg-accent/90">
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
            className="bg-accent from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hidden sm:flex items-center gap-2"
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
