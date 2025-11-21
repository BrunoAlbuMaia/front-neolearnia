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
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências de estudo
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações do Perfil
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Preferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Informações do Perfil</CardTitle>
              </div>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    placeholder="seu@email.com"
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isProfileSaving}>
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

        <TabsContent value="personal">
          <PersonalDataSettings />
        </TabsContent>

        <TabsContent value="preferences">
          <OnboardingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
