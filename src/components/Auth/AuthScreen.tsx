import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import logo_mymemorize from "../../assets/logo_mymemorize.png";

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-background via-primary/5 to-accent/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      
      {/* Fundo animado vibrante */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(262,83%,58%,0.15),transparent_60%)]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      {/* Gradiente adicional para profundidade */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(187,85%,55%,0.12),transparent_60%)]"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />
      
      {/* Padrão de grid sutil */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-card/90 dark:bg-card/80 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 border-2 border-primary/20 hover:border-primary/30 transition-all duration-300"
      >
        {/* Efeito de brilho sutil no card */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl opacity-50" />
        {/* Branding - Mais Vibrante */}
        <div className="text-center mt-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 8 }}
            className="mx-auto relative flex items-center justify-center mb-6"
          >
            {/* Glow pulsante vibrante por trás da logo */}
            <motion.div 
              className="absolute w-64 h-64 sm:w-44 sm:h-44 bg-gradient-to-br from-primary/40 to-accent/40 blur-3xl rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Logo em destaque */}
            <img
              src={logo_mymemorize}
              alt="MyMemorize Logo"
              loading="lazy"
              decoding="async"
              className="relative w-48 h-48 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_30px_hsl(262,83%,58%,0.5)] transition-transform duration-500 hover:scale-110 z-10"
            />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              My<span className="text-primary">Memorize</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mt-3 font-medium">
            Flashcards inteligentes com IA
          </p>
        </div>


        {/* Tabs - Mais Modernas */}
        <div className="relative z-10 flex bg-muted/50 rounded-xl p-1.5 text-sm border border-primary/10">
          <motion.button
            onClick={() => setIsLogin(true)}
            className={`relative flex-1 py-2.5 rounded-lg transition-all font-semibold z-10 ${
              isLogin
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
            whileHover={{ scale: isLogin ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.button>
          <motion.button
            onClick={() => setIsLogin(false)}
            className={`relative flex-1 py-2.5 rounded-lg transition-all font-semibold z-10 ${
              !isLogin
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
            whileHover={{ scale: !isLogin ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cadastro
          </motion.button>
        </div>

        {/* Formulário */}
        <div className="mt-4 relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm onAuthSuccess={onAuthSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm onAuthSuccess={onAuthSuccess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Termos */}
        <p className="relative z-10 text-center text-xs text-muted-foreground leading-relaxed">
          Ao continuar, você concorda com nossos{" "}
          <span className="text-primary hover:text-accent hover:underline cursor-pointer font-medium transition-colors">
            termos de uso
          </span>.
        </p>
      </motion.div>
    </div>
  );
}
