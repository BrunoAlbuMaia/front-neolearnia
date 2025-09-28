import { useState } from "react";
import { loginWithEmail, registerWithEmail } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { Brain, Loader2 } from "lucide-react";
import { useSyncUser } from "../lib/queryClient";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const syncUser = useSyncUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // console.log('Attempting auth operation:', { isLogin, email: formData.email });
      
      let authResult;
      if (isLogin) {
        authResult = await loginWithEmail(formData.email, formData.password);
        // console.log('Login successful:', authResult.user.uid);
      } else {
        authResult = await registerWithEmail(formData.email, formData.password);
        // console.log('Registration successful:', authResult.user.uid);
      }
      
      // Sync user data with backend
      // console.log('Syncing user data with backend...', {
      //   email: formData.email,
      //   name: formData.name || formData.email.split('@')[0],
      //   userUid: authResult.user.uid
      // });
      try {
        const syncResult = await syncUser.mutateAsync({
          email: formData.email,
          name: formData.name || formData.email.split('@')[0]
        });
        // console.log('User data synced successfully:', syncResult);
      } catch (syncError) {
        console.error('Failed to sync user data:', syncError);
        // Don't block the login process if sync fails
      }
      
      onAuthSuccess();
      toast({
        title: isLogin ? "Login realizado com sucesso!" : "Conta criada com sucesso!",
        description: "Bem-vindo ao NeoLearnIA",
      });
    } catch (error: any) {
      console.error('Auth error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = error.message || "Ocorreu um erro. Tente novamente.";
      
      // Handle specific Firebase errors
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Erro de configuração do Firebase. Verifique as variáveis de ambiente.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso. Tente fazer login ou use outro email.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado. Verifique o email ou crie uma conta.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta. Tente novamente.";
      }
      
      toast({
        title: "Erro de Autenticação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id.replace(/^(login|register)-/, "")]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Brain className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">NeoLearnIA</h1>
          <p className="text-muted-foreground mt-2">Gerador inteligente de flashcards para seus estudos</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={isLogin ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setIsLogin(true)}
            data-testid="button-login-tab"
          >
            Entrar
          </Button>
          <Button
            variant={!isLogin ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setIsLogin(false)}
            data-testid="button-register-tab"
          >
            Criar Conta
          </Button>
        </div>

        {/* Auth Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    data-testid="input-name"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-auth-submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  isLogin ? "Entrar" : "Criar Conta"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
