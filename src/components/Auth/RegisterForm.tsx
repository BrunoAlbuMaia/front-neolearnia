import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerWithEmail } from "../../lib/firebase/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useSyncUser } from "../../hooks/useAuth";

interface RegisterFormProps {
  onAuthSuccess: () => void;
}

export default function RegisterForm({ onAuthSuccess }: RegisterFormProps) {
  const { toast } = useToast();
  const syncUser = useSyncUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    birthdate: "",
    cep: "",
    rua: "",
    bairro: "",
    cidade: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "cep" && value.replace(/\D/g, "").length === 8) {
      buscarCep(value);
    }
  };
  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.lastname || !formData.birthdate)) {
      toast({ title: "Preencha todos os campos antes de continuar.", variant: "destructive" });
      return;
    }
    if (step === 2 && (!formData.cep || !formData.rua || !formData.bairro || !formData.cidade)) {
      toast({ title: "Complete seu endereço antes de prosseguir.", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const [loadingCep, setLoadingCep] = useState(false);
  const [errorCep, setErrorCep] = useState("");

  

  const buscarCep = async (cep: string) => {
    try {
      setLoadingCep(true);
      setErrorCep("");
      const onlyNumbers = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrorCep("CEP não encontrado.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch {
      setErrorCep("Erro ao buscar o CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(formData.email, formData.password);
      await syncUser.mutateAsync({
        email: formData.email,
        name: `${formData.name} ${formData.lastname}`,
      });
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao MyMemorize 🎉",
      });
      onAuthSuccess();
    } catch (error: any) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Email já cadastrado."
          : error.code === "auth/weak-password"
          ? "Senha muito fraca (mínimo 6 caracteres)."
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

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-10 rounded-full transition-all ${
              step >= i ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Dados pessoais
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Nome <span className="text-red-500">*</span></Label>
                <Input name="name" className="bg-grey-50 text-black" value={formData.name} onChange={handleChange} placeholder="Digite seu nome" required/>
              </div>
              <div>
                <Label>Sobrenome <span className="text-red-500">*</span></Label>
                <Input name="lastname" className="bg-grey-50 text-black" value={formData.lastname} onChange={handleChange} placeholder="Digite seu sobrenome" required/>
              </div>
            </div>

            <div>
              <Label>Data de nascimento <span className="text-red-500">*</span></Label>
              <Input name="birthdate" className="bg-grey-50 text-black" type="date" value={formData.birthdate} onChange={handleChange} required />
            </div>

            <Button type="button" className="w-full" onClick={nextStep}>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Endereço
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>CEP <span className="text-red-500">*</span></Label>
                <Input name="cep"  className="cursor-not-allowed bg-grey-50 text-black" value={formData.cep} onChange={handleChange} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input name="cidade" value={formData.cidade} onChange={handleChange} readOnly />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Bairro</Label>
                <Input name="bairro" value={formData.bairro} onChange={handleChange} readOnly />
              </div>
              <div>
                <Label>Rua</Label>
                <Input name="rua"  value={formData.rua} onChange={handleChange}readOnly />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button type="button" onClick={nextStep}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Acesso à plataforma
            </h2>

            <div>
              <Label>Email</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Senha</Label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <Label>Confirmar senha</Label>
                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" type="button" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button type="submit" className="flex items-center" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                  </>
                ) : (
                  <>
                    Finalizar <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
