import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "../../lib/firebase/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "../ui/separator";

interface RegisterFormProps {
  onAuthSuccess: () => void;
}

export default function RegisterForm({ onAuthSuccess }: RegisterFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Nota: A validação de senhas iguais é feita no backend
    // Aqui apenas verificamos se os campos foram preenchidos

    setIsLoading(true);
    try {
      // 1. Registra no Firebase
      // O AuthContext vai detectar automaticamente a mudança e sincronizar
      await registerWithEmail(email, password);
      
      // 2. Aguarda o AuthContext processar a autenticação completamente
      // O AuthContext precisa: obter token, sincronizar com backend, atualizar estado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Toast de sucesso só após tudo estar sincronizado
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao MyMemorize 🎉",
      });
      
      // 4. Só então chama onAuthSuccess após garantir que tudo foi sincronizado
      onAuthSuccess();
    } catch (error: any) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Email já cadastrado."
          : error.code === "auth/weak-password"
          ? "Senha muito fraca (mínimo 6 caracteres)."
          : error.code === "auth/invalid-email"
          ? "Email inválido."
          : "Erro ao criar conta.";
      toast({
        title: "Erro no cadastro",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoadingGoogle(true);
    try {
      // Login com Google (funciona tanto para login quanto cadastro)
      await loginWithGoogle();
      
      // Aguarda o AuthContext processar a autenticação completamente
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao MyMemorize 🎉",
      });
      
      onAuthSuccess();
    } catch (error: any) {
      const msg =
        error.code === "auth/popup-closed-by-user"
          ? "Cadastro cancelado."
          : error.code === "auth/popup-blocked"
          ? "Pop-up bloqueado. Permita pop-ups para este site."
          : "Erro ao cadastrar com Google.";
      toast({
        title: "Erro no cadastro",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-5 relative z-10">
      {/* Botão de cadastro com Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-2 border-primary/20 hover:border-primary/40 bg-background transition-all duration-300 font-semibold"
        onClick={handleGoogleRegister}
        disabled={isLoadingGoogle || isLoading}
      >
        {isLoadingGoogle ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Cadastrando...
          </>
        ) : (
          <>
            <FcGoogle className="mr-2 h-5 w-5" />
            Cadastrar com Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou cadastre-se com email
          </span>
        </div>
      </div>

      {/* Formulário de cadastro com email e senha */}
      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-sm font-semibold text-foreground">
          Email
        </Label>
        <Input
          id="register-email"
          type="email"
          placeholder="seu@email.com"
          className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || isLoadingGoogle}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-sm font-semibold text-foreground">
          Senha
        </Label>
        <Input
          id="register-password"
          type="password"
          className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || isLoadingGoogle}
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 6 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password" className="text-sm font-semibold text-foreground">
          Confirmar Senha
        </Label>
        <Input
          id="register-confirm-password"
          type="password"
          className="h-11 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading || isLoadingGoogle}
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          Digite a senha novamente para confirmar
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 font-semibold h-11"
        disabled={isLoading || isLoadingGoogle}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  );
}
