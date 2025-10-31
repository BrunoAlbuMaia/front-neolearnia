import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { type UserState } from "../../../types";
import StepFocusArea from "./StepFocusArea";
import StepLearningStyle from "./StepLearningStyle";
import StepAILevel from "./StepAILevel";
import StepMotivation from "./StepMotivation";
import StepPreferredSchedule from "./StepPreferredSchedule";
import { useUser } from "../../../hooks/useUser";

const OnboardingScreen: React.FC = () => {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<UserState>({
    focus_area: "",
    learning_style: "",
    ai_level: "",
    motivation: "",
    preferred_schedule: "",
  });
  const { saveUserState } = useUser();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => (prev > 0 ? prev - 1 : 0));
  const navigateToHome = () => setLocation("/");
  
  const handleFinish = async (updatedData: UserState) => {
    await saveUserState.mutateAsync({ ...updatedData });
    navigateToHome();
  };

  const steps = [
    <StepFocusArea key="focus" data={data} setData={setData} nextStep={nextStep} />,
    <StepLearningStyle key="learning" data={data} setData={setData} nextStep={nextStep} />,
    <StepAILevel key="ai" data={data} setData={setData} nextStep={nextStep} />,
    <StepMotivation key="motivation" data={data} setData={setData} nextStep={nextStep} />,
    <StepPreferredSchedule key="schedule" data={data} setData={setData} onFinish={handleFinish} />,
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      
      {/* Fundo animado suave */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_60%)]"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg backdrop-blur-xl bg-white/80 dark:bg-gray-900/60 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 relative z-10"
      >
        {/* Header / Branding */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg mb-4"
          >
            <GraduationCap className="text-white h-7 w-7 sm:h-8 sm:w-8" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800 dark:text-white">
            Bem-vindo ao  Memorize<span className="text-indigo-500">My</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vamos personalizar sua experiência de estudos com IA
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4 mb-6">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Etapas animadas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Botão de voltar */}
        {step > 0 && (
          <button
            onClick={prevStep}
            className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        )}

        {/* Rodapé */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
          Etapa {step + 1} de {steps.length}
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;