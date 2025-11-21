import { useState, useEffect, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Loader2, Save } from "lucide-react";
import { Spinner } from "./ui/spinner";

interface UserSettingsForm {
  focus_area: string;
  learning_style: string;
  ai_level: string;
  motivation: string;
  preferred_schedule: string;
}

export default function OnboardingSettings() {
  const { toast } = useToast();
  const { userSettings, isLoading, updateSettings } = useSettings();

  // Função auxiliar para converter userSettings em formato do formulário
  const convertUserSettingsToForm = (settings: typeof userSettings): UserSettingsForm => {
    if (!settings) {
      return {
        focus_area: "",
        learning_style: "",
        ai_level: "",
        motivation: "",
        preferred_schedule: "",
      };
    }
    return {
      focus_area: settings.focus_area || "",
      learning_style: settings.learning_style || "",
      ai_level: settings.ai_level || "",
      motivation: settings.motivation || "",
      preferred_schedule: settings.preferred_schedule || "",
    };
  };

  // Usar useMemo para sempre derivar os dados base do userSettings
  // Isso garante que sempre temos os dados atualizados como fonte de verdade
  const baseData = useMemo(() => {
    return convertUserSettingsToForm(userSettings || null);
  }, [userSettings]);

  // Estado local para rastrear mudanças do usuário
  // Inicializa sempre com baseData para garantir sincronização na montagem
  const [data, setData] = useState<UserSettingsForm>(baseData);

  // Sincronizar estado local com baseData sempre que baseData mudar
  // Isso garante que ao montar o componente, os dados sejam sempre carregados
  useEffect(() => {
    setData(baseData);
  }, [baseData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings.mutateAsync({ ...data });
      toast({
        title: "Preferências salvas",
        description: "Suas preferências de estudo foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar preferências",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isSaving = updateSettings.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" text="Carregando preferências..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <CardTitle>Preferências de Estudo</CardTitle>
        </div>
        <CardDescription>
          Configure suas preferências para personalizar sua experiência de estudos com IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="focus_area">Objetivo de Estudo</Label>
            <Select
              value={data.focus_area ? data.focus_area : undefined}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, focus_area: value }))
              }
            >
              <SelectTrigger id="focus_area">
                <SelectValue placeholder="Selecione seu objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enem">Enem</SelectItem>
                <SelectItem value="Concurso">Concurso</SelectItem>
                <SelectItem value="Faculdade">Faculdade</SelectItem>
                <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning_style">Estilo de Aprendizado</Label>
            <Select
              value={data.learning_style ? data.learning_style : undefined}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, learning_style: value }))
              }
            >
              <SelectTrigger id="learning_style">
                <SelectValue placeholder="Selecione seu estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visual">Visual</SelectItem>
                <SelectItem value="Auditivo">Auditivo</SelectItem>
                <SelectItem value="Leitura">Leitura</SelectItem>
                <SelectItem value="Escrita">Escrita</SelectItem>
                <SelectItem value="Cinestésico">Cinestésico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_level">Nível de Experiência com IA</Label>
            <Select
              value={data.ai_level ? data.ai_level : undefined}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, ai_level: value }))
              }
            >
              <SelectTrigger id="ai_level">
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Motivação Principal</Label>
            <Select
              value={data.motivation ? data.motivation : undefined}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, motivation: value }))
              }
            >
              <SelectTrigger id="motivation">
                <SelectValue placeholder="Selecione sua motivação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Passar em prova">Passar em prova</SelectItem>
                <SelectItem value="Desenvolver habilidades">Desenvolver habilidades</SelectItem>
                <SelectItem value="Está em dias com os estudos">Está em dias com os estudos</SelectItem>
                <SelectItem value="Revisar conteúdos">Revisar conteúdos</SelectItem>
                <SelectItem value="Curiosidade pessoal">Curiosidade pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_schedule">Horário Preferido de Estudo</Label>
            <Select
              value={data.preferred_schedule ? data.preferred_schedule : undefined}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, preferred_schedule: value }))
              }
            >
              <SelectTrigger id="preferred_schedule">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manhã">Manhã</SelectItem>
                <SelectItem value="Tarde">Tarde</SelectItem>
                <SelectItem value="Noite">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

