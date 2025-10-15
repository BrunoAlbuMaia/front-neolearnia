import { useState } from "react";
import { loginWithEmail, registerWithEmail } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { useSyncUser } from "../hooks/useAuth";
import { Brain, Loader2 } from "lucide-react";

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
      let authResult;
      if (isLogin) {
        authResult = await loginWithEmail(formData.email, formData.password);
      } else {
        authResult = await registerWithEmail(formData.email, formData.password);
      }
      
      try {
        await syncUser.mutateAsync({
          email: formData.email,
          name: formData.name || formData.email.split('@')[0]
        });
      } catch (syncError) {
        console.error('Failed to sync user data:', syncError);
      }
      
      onAuthSuccess();
      toast({
        title: isLogin ? "Login realizado com sucesso!" : "Conta criada com sucesso!",
        description: "Bem-vindo ao NeoLearnIA",
      });
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = error.message || "Ocorreu um erro. Tente novamente.";
      
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
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Brain className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">NeoLearnIA</h1>
          <p className="text-muted-foreground">Flashcards inteligentes com IA</p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex mb-6 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  isLogin
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  !isLogin
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cadastro
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={isLogin ? "login-email" : "register-email"}>Email</Label>
                <Input
                  id={isLogin ? "login-email" : "register-email"}
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={isLogin ? "login-password" : "register-password"}>Senha</Label>
                <Input
                  id={isLogin ? "login-password" : "register-password"}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  <>{isLogin ? "Entrar" : "Criar Conta"}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  );
}
