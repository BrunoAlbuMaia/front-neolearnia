import { useState } from "react";
import { loginWithEmail } from "../../lib/firebase/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { loginWithGoogle } from "../../lib/firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { getOrCreateSessionId } from "../../lib/firebase/session";

interface LoginFormProps {
  onAuthSuccess: () => void;
}

export default function LoginForm({ onAuthSuccess }: LoginFormProps) {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Autentica com email/senha (Firebase)
      // O AuthContext vai detectar automaticamente a mudança e sincronizar
      const userCredential = await loginWithEmail(email, password);
      const user = userCredential.user;

      if (!user.email) {
        throw new Error("Não foi possível obter o email do usuário.");
      }

      // 2. Garante que o sessionId existe (será enviado automaticamente via header)
      getOrCreateSessionId();

      // 3. O AuthContext.onAuthChange vai detectar a mudança e sincronizar automaticamente
      // Aguardamos um tempo suficiente para o AuthContext processar tudo
      // O AuthContext precisa: obter token, sincronizar com backend, atualizar estado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Toast de sucesso só após tudo estar sincronizado
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo${user.displayName ? `, ${user.displayName}` : ""} de volta ao MyMemorize`,
      });

      // 5. Só então chama onAuthSuccess após garantir que tudo foi sincronizado
      onAuthSuccess();
    } catch (error: any) {
      let errorMessage =
        error.code === "auth/user-not-found"
          ? "Usuário não encontrado."
          : error.code === "auth/wrong-password"
          ? "Senha incorreta."
          : error.code === "auth/invalid-email"
          ? "Email inválido."
          : error.code === "auth/too-many-requests"
          ? "Muitas tentativas. Aguarde um momento e tente novamente."
          : error.message || "Ocorreu um erro. Tente novamente.";

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5 relative z-10">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-semibold text-foreground">
          Email
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm font-semibold text-foreground">
          Senha
        </Label>
        <Input
          id="login-password"
          type="password"
          className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 font-semibold h-11" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar na Minha Conta"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 h-11 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold transition-all"
        disabled={isLoadingGoogle || isLoading}
        onClick={async () => {
          setIsLoadingGoogle(true);
          
          try {
            // 1. Autentica com Google (Firebase)
            const user = await loginWithGoogle();
            
            if (!user.email) {
              throw new Error("Não foi possível obter o email do Google.");
            }

            // 2. Aguarda o token estar disponível (importante para primeira autenticação)
            // O Firebase pode precisar de um momento para processar o token na primeira vez
            let attempts = 0;
            let token: string | null = null;
            while (!token && attempts < 5) {
              try {
                token = await user.getIdToken();
              } catch {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
              }
            }

            if (!token) {
              throw new Error("Não foi possível obter o token de autenticação. Tente novamente.");
            }

            // 3. Garante que o sessionId existe (será enviado automaticamente via header)
            getOrCreateSessionId();

            // 4. O AuthContext.onAuthChange vai detectar a mudança e sincronizar automaticamente
            // Aguardamos um tempo suficiente para o AuthContext processar tudo
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Toast de sucesso só após tudo estar sincronizado
            toast({
              title: "Login realizado com sucesso!",
              description: `Bem-vindo${user.displayName ? `, ${user.displayName}` : ""} ao MyMemorize`,
            });

            // 6. Só então chama onAuthSuccess após garantir que tudo foi sincronizado
            onAuthSuccess();
          } catch (error: any) {
            console.error("Erro no login com Google:", error);
            
            let errorMessage = "Ocorreu um erro ao fazer login com Google. Tente novamente.";
            
            if (error.code === "auth/popup-closed-by-user") {
              errorMessage = "Login cancelado. Tente novamente quando estiver pronto.";
            } else if (error.code === "auth/popup-blocked") {
              errorMessage = "Popup bloqueado. Permita popups para este site e tente novamente.";
            } else if (error.code === "auth/network-request-failed") {
              errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
            } else if (error.message) {
              errorMessage = error.message;
            }

            toast({
              title: "Erro no login",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsLoadingGoogle(false);
          }
        }}
      >
        {isLoadingGoogle ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Entrando com Google...
          </>
        ) : (
          <>
            <FcGoogle className="h-5 w-5" /> Entrar com Google
          </>
        )}
      </Button>
    </form>
  );
}
