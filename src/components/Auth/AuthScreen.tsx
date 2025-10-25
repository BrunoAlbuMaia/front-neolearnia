import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

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
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-4"
          >
            <Brain className="text-white h-7 w-7 sm:h-8 sm:w-8" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800 dark:text-white">
            Memorize<span className="text-indigo-500">ME</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
