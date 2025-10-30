// src/components/Sidebar.tsx

import { Button } from "./button"; // Certifique-se que o caminho para seus componentes ui está correto
import { ThemeToggle } from "../ThemeToggle"; // E para o ThemeToggle também
import { SidebarTrigger, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "./sidebar"; // Import Sidebar components
import { Brain, BarChart3, LogOut, Menu, Home, Settings } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";

interface SidebarProps {
  user: any;
  onLogout: () => void;
  onNavigateToAnalytics: () => void; // Tornando obrigatório para o exemplo
  onNavigateToHome: () => void;
  onNavigateToSettings: () => void;
}

// Definição dos links de navegação
const navigationItems = [
  { 
    name: "Início", 
    icon: Home, 
    action: 'onNavigateToHome',
    dataTestId: 'sidebar-link-home'
  },
  { 
    name: "Analytics", 
    icon: BarChart3, 
    action: 'onNavigateToAnalytics', 
    dataTestId: 'sidebar-link-analytics'
  },
  { 
    name: "Configurações", 
    icon: Settings, 
    action: 'onNavigateToSettings', 
    dataTestId: 'sidebar-link-settings'
  },
];

// Componente para um único item de navegação
interface NavLinkProps {
  name: string;
  Icon: React.ElementType; // Tipo correto para um componente Lucide
  onClick: () => void;
  dataTestId: string;
  isActive: boolean; // Add isActive prop
}

const NavLink = ({ name, Icon, onClick, dataTestId, isActive }: NavLinkProps) => (
  <Button
    variant="ghost"
    className={`w-full justify-start text-base py-6 transition-colors duration-200 ${
      isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary hover:bg-muted"
    }`}
    onClick={onClick}
    data-testid={dataTestId}
  >
    <Icon className="h-5 w-5 mr-3" />
    {name}
  </Button>
);


// ----------------------------------------------------
// Componente principal da Sidebar
// ----------------------------------------------------

export default function Header({ 
  user, 
  onLogout, 
  onNavigateToAnalytics, 
  onNavigateToHome,
  onNavigateToSettings
}: SidebarProps) {
  const [location] = useLocation(); // Get current location from wouter

  // Mapeamento das ações para ser passado para NavLink
  const actionsMap = {
    onNavigateToHome,
    onNavigateToAnalytics,
    onNavigateToSettings
  }

  // Helper to determine if a link is active
  const isLinkActive = (path: string) => {
    // For home, check if path is exactly '/'
    if (path === '/') {
      return location === '/';
    }
    // For other paths, check if the location starts with the path
    return location.startsWith(path);
  };

  // O conteúdo do Sidebar, usado tanto no modo desktop quanto no Sheet
  const sidebarContent = (
    <div className="flex flex-col h-full p-4">
      
      {/* Logo/Título */}
      <div className="flex items-center space-x-3 mb-8 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Brain className="text-primary-foreground text-sm" />
        </div>
        <h1 className="text-xl font-bold text-foreground">MemorizeMy</h1>
      </div>

      {/* Navegação Principal */}
      <div className="flex flex-col space-y-2 flex-grow">
        {navigationItems.map(item => {
          // Acessa a função de ação correta do objeto actionsMap
          const actionFn = actionsMap[item.action as keyof typeof actionsMap]; 
          const path = item.name === "Início" ? "/" : `/${item.name.toLowerCase()}`; // Determine path based on item name
          return (
            <NavLink
              key={item.name}
              name={item.name}
              Icon={item.icon}
              onClick={actionFn}
              dataTestId={item.dataTestId}
              isActive={isLinkActive(path)} // Pass isActive prop
            />
          );
        })}
      </div>

      {/* Rodapé com Infos do Usuário, Theme e Logout */}
      <div className="mt-auto border-t border-border pt-4 space-y-3">
        {/* Informação do Usuário */}
        <div className="px-2">
            <p className="text-sm font-semibold text-foreground truncate" data-testid="text-user-name">
                {user?.email || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground">Admin</p>
        </div>

        {/* Botão de Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start text-base text-red-500 hover:text-red-600 hover:bg-muted py-6"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
        
        {/* Toggle do Tema (Alinhado à esquerda no sidebar) */}
        {/* <div className="flex justify-start px-2 pt-2">
            <ThemeToggle />
        </div> */}
      </div>
    </div>
  );


  return (
    <React.Fragment>
      {/* ----------------------------------------------------
          1. Sidebar Fixo (Desktop/md e acima)
          ---------------------------------------------------- */}
      <nav
        className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed top-0 left-0 z-40"
        data-testid="sidebar-desktop"
      >
        {sidebarContent}
      </nav>
  
      {/* ----------------------------------------------------
          2. Navbar Superior com Menu Hamburger (Todas as telas)
          ---------------------------------------------------- */}
      <header
        className="bg-card border-b border-border p-3 flex items-center justify-between sticky top-0 z-50 shadow-md md:hidden" // Hide on desktop
        data-testid="navbar"
      >
        {/* Logo/Título */}
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-lg font-bold text-foreground">MemorizeMy</h1>
        </div>
  
        {/* Botão do Menu Hamburger (Sidebar Trigger) */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <SidebarTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SidebarTrigger>
        </div>
      </header>
    </React.Fragment>
  );
  
}
