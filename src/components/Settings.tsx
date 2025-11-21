import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "../hooks/use-toast";
import { useSettings } from "../hooks/useSettings";
import { Spinner } from "./ui/spinner";
import { User, Save, Loader2, Settings as SettingsIcon, GraduationCap, MapPin } from "lucide-react";
import OnboardingSettings from "./OnboardingSettings";
import PersonalDataSettings from "./PersonalDataSettings";

export default function Settings() {
  const { toast } = useToast();
  const { userProfile, isLoading: isLoadingProfile, updateProfile } = useSettings();

  // Estados do formulário de perfil
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || "",
        email: userProfile.email || "",
      });
    }
  }, [userProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync({
        name: profileForm.name,
      });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" text="Carregando configurações..." />
      </div>
    );
  }

  const isProfileSaving = updateProfile.isPending;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <SettingsIcon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie suas informações pessoais e preferências de estudo
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 h-auto sm:h-10">
          <TabsTrigger 
            value="profile" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-3 sm:px-4"
          >
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">Informações do Perfil</span>
          </TabsTrigger>
          <TabsTrigger 
            value="personal" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-3 sm:px-4"
          >
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">Dados Pessoais</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="flex items-center justify-center gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-3 sm:px-4"
          >
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">Preferências</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <CardTitle className="text-lg sm:text-xl">Informações do Perfil</CardTitle>
              </div>
              <CardDescription className="text-sm mt-1">
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Seu nome completo"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    placeholder="seu@email.com"
                    className="h-10 sm:h-11 bg-muted cursor-not-allowed text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <Separator className="my-4 sm:my-6" />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isProfileSaving}
                    className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
                  >
                    {isProfileSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-4 sm:mt-6">
          <PersonalDataSettings />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 sm:mt-6">
          <OnboardingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
