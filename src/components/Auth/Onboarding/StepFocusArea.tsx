import React from "react";
import { type UserState } from "../../../types";

interface StepProps {
  data: UserState;
  setData: React.Dispatch<React.SetStateAction<UserState>>;
  nextStep: () => void;
}

const StepFocusArea: React.FC<StepProps> = ({ data, setData, nextStep }) => {
  const options = ["Enem", "Concurso", "Faculdade", "Ensino Médio","Outros"];
  

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
        🎯 Qual o seu objetivo ?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full max-w-md">
        {options.map((opt) => {
          const isSelected = data.focus_area === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                setData((prev) => ({ ...prev, focus_area: opt }));
                setTimeout(nextStep, 250); // animação antes de avançar
              }}
              className={`py-3 px-4 rounded-xl border-2 text-base font-medium transition-all duration-300
                ${
                  isSelected
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-600/30"
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

export default StepFocusArea;