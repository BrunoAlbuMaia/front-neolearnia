import { useState, useEffect } from "react";
import { MapPin, Building2, Search, Loader2, Save } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface PersonalDataForm {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  institution: string;
}

export default function PersonalDataSettings() {
  const { toast } = useToast();
  const { personalData, isLoadingPersonalData, updatePersonalData } = useSettings();

  const [data, setData] = useState<PersonalDataForm>({
    cep: "",
    logradouro: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    institution: "",
  });

  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Preencher com dados existentes
  useEffect(() => {
    if (personalData) {
      setData({
        cep: personalData.cep || "",
        logradouro: personalData.logradouro || "",
        complemento: personalData.complemento || "",
        bairro: personalData.bairro || "",
        localidade: personalData.localidade || "",
        uf: personalData.uf || "",
        institution: personalData.institution || "",
      });
    }
  }, [personalData]);

  // Função para buscar CEP na API ViaCEP
  const searchCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");
    
    // Valida formato do CEP (8 dígitos)
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "O CEP deve conter 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const cepData: ViaCepResponse = await response.json();

      if (cepData.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado. Verifique e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Preenche os campos automaticamente
      setData((prev) => ({
        ...prev,
        logradouro: cepData.logradouro || "",
        complemento: cepData.complemento || "",
        bairro: cepData.bairro || "",
        localidade: cepData.localidade || "",
        uf: cepData.uf || "",
      }));

      toast({
        title: "Endereço encontrado",
        description: "Os dados do endereço foram preenchidos automaticamente.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao buscar CEP",
        description: error.message || "Não foi possível buscar o CEP. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Função para formatar CEP enquanto digita
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 8) {
      if (cleanValue.length <= 5) {
        return cleanValue;
      }
      return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5)}`;
    }
    return value;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setData((prev) => ({ ...prev, cep: formatted }));
  };

  const handleCepBlur = () => {
    // Busca automaticamente quando o usuário sai do campo com CEP completo
    if (data.cep.replace(/\D/g, "").length === 8) {
      searchCep(data.cep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePersonalData.mutateAsync({ ...data });
      toast({
        title: "Dados salvos",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar dados",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isSaving = updatePersonalData.isPending;

  if (isLoadingPersonalData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" text="Carregando dados pessoais..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <CardTitle>Dados Pessoais</CardTitle>
        </div>
        <CardDescription>
          Informe seu endereço e instituição de ensino
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="cep"
                  value={data.cep}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => searchCep(data.cep)}
                  disabled={isSearchingCep || data.cep.replace(/\D/g, "").length !== 8}
                >
                  {isSearchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o CEP e clique no ícone de busca ou aguarde ao sair do campo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={data.logradouro}
                  disabled
                  placeholder="Rua, Avenida, etc."
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Preenchido automaticamente pelo CEP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={data.complemento}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, complemento: e.target.value }))
                  }
                  placeholder="Apartamento, Bloco, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={data.bairro}
                  disabled
                  placeholder="Nome do bairro"
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Preenchido automaticamente pelo CEP
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="localidade">Cidade</Label>
                  <Input
                    id="localidade"
                    value={data.localidade}
                    disabled
                    placeholder="Cidade"
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Preenchido automaticamente pelo CEP
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={data.uf}
                    disabled
                    placeholder="UF"
                    maxLength={2}
                    className="uppercase bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Preenchido automaticamente pelo CEP
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="institution" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Instituição de Ensino
              </Label>
              <Input
                id="institution"
                value={data.institution}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, institution: e.target.value }))
                }
                placeholder="Nome da sua escola, faculdade ou instituição"
              />
            </div>
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
                  Salvar Dados
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

