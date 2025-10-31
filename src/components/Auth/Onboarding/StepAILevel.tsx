import React from "react";
import { type UserState } from "../../../types";

interface StepProps {
  data: UserState;
  setData: React.Dispatch<React.SetStateAction<UserState>>;
  nextStep: () => void;
}

const StepAILevel: React.FC<StepProps> = ({ data, setData, nextStep }) => {
  const options = ["Iniciante", "Intermediário", "Avançado"];

  const handleSelect = (opt: string) => {
    setData((prev) => ({ ...prev, ai_level: opt }));
    setTimeout(nextStep, 250); // animação leve antes de avançar
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        🤖 Qual é o seu nível de experiência com IA?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
        {options.map((opt) => {
          const isSelected = data.ai_level === opt;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`py-3 px-4 rounded-xl border-2 text-base font-medium transition-all duration-300
                ${
                  isSelected
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:border-indigo-500 dark:hover:bg-gray-700"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepAILevel;
