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
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      
      {/* Fundo animado leve */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.12),transparent_60%)]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-white/80 dark:bg-gray-900/60 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative z-10"
      >
        {/* Branding */}
        <div className="text-center mt-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 8 }}
            className="mx-auto relative flex items-center justify-center mb-6"
          >
            {/* Glow pulsante por trás da logo */}
            <div className="absolute w-64 h-64 sm:w-44 sm:h-44 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />

            {/* Logo em destaque */}
            <img
              src={logo_mymemorize}
              alt="logo_mymemorize"
              className="relative w-48 h-48 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-transform duration-500 hover:scale-110"
            />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              My<span className="text-indigo-500">Memorize</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-3">
            Flashcards inteligentes com IA
          </p>
        </div>


        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 text-sm">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-all font-medium ${
              isLogin
                ? "bg-white dark:bg-gray-700 shadow text-indigo-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-all font-medium ${
              !isLogin
                ? "bg-white dark:bg-gray-700 shadow text-indigo-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Cadastro
          </button>
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
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Ao continuar, você concorda com nossos{" "}
          <span className="text-indigo-500 hover:underline cursor-pointer">
            termos de uso
          </span>.
        </p>
      </motion.div>
    </div>
  );
}
