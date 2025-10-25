// src/components/Sidebar.tsx
import { Button } from "./button";
import { ThemeToggle } from "../ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "./sheet"; 
import { Brain, BarChart3, LogOut, Menu, Home, Settings } from "lucide-react";
import React, { useState } from "react";

interface SidebarProps {
  user: any;
  onLogout: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToHome: () => void;
  onNavigateToSettings: () => void;
}

// Navegação
const navigationItems = [
  { name: "Início", icon: Home, action: 'onNavigateToHome', dataTestId: 'sidebar-link-home' },
  { name: "Analytics", icon: BarChart3, action: 'onNavigateToAnalytics', dataTestId: 'sidebar-link-analytics' },
  { name: "Configurações", icon: Settings, action: 'onNavigateToSettings', dataTestId: 'sidebar-link-settings' },
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
  onNavigateToAnalytics, 
  onNavigateToHome,
  onNavigateToSettings
}: SidebarProps) {
  const actionsMap = {
    onNavigateToHome,
    onNavigateToAnalytics,
    onNavigateToSettings
  };

  // Estado para o item ativo
  const [activeItem, setActiveItem] = useState('Início');

  const sidebarContent = (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-6 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Brain className="text-primary-foreground text-sm" />
        </div>
        <h1 className="text-xl font-bold text-foreground">NeoLearnIA</h1>
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
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-lg font-bold text-foreground">NeoLearnIA</h1>
        </div>

        {/* Botões Tema e Menu */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
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
        </div>
      </header>
    </>
  );
}
