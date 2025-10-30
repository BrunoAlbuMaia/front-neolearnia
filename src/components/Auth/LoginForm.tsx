import { useState } from "react";
import { loginWithEmail } from "../../lib/firebase/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useSyncUser } from "../../hooks/useAuth";
import { loginWithGoogle } from "../../lib/firebase/auth";
import { FcGoogle } from "react-icons/fc";

interface LoginFormProps {
  onAuthSuccess: () => void;
}

export default function LoginForm({ onAuthSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const syncUser = useSyncUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      await syncUser.mutateAsync({ email, name: email.split("@")[0] });

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao MemorizeMy",
      });
      onAuthSuccess();
    } catch (error: any) {
      let errorMessage =
        error.code === "auth/user-not-found"
          ? "Usuário não encontrado."
          : error.code === "auth/wrong-password"
          ? "Senha incorreta."
          : "Ocorreu um erro. Tente novamente.";

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
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="seu@email.com"
          className="bg-grey-50 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          className="bg-grey-50 text-black"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={async () => {
            try {
              const user = await loginWithGoogle();
              await syncUser.mutateAsync({
                email: user.email,
                name: user.email.split("@")[0],
              });
              
              console.log("Usuário logado:", user);
              onAuthSuccess();
            } catch (error) {
              console.error(error);
            }
          }}
        >
          <FcGoogle className="h-5 w-5" /> Entrar com Google
        </Button>
    </form>
  );
}
