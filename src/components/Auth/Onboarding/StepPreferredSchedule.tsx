import React, { useCallback } from "react";
import type { UserState } from "../../../types";

interface StepProps {
  data: UserState;
  setData: React.Dispatch<React.SetStateAction<UserState>>;
  onFinish: () => void;
}

const StepPreferredSchedule: React.FC<StepProps> = ({ data, setData, onFinish }) => {
  const options = ["Manhã", "Tarde", "Noite"];

  const handleSelect = useCallback(
    (opt: string) => {
      const updatedData = { ...data, preferred_schedule: opt };
      setData(updatedData);
      setTimeout(() => onFinish(updatedData), 250); // passa o state atualizado
    },
    [data, setData, onFinish]
  );

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
        ⏰ Qual horário você prefere estudar?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
        {options.map((opt) => {
          const isSelected = data.preferred_schedule === opt;
          return (
            <button
              key={opt}
              aria-label={`Selecionar horário: ${opt}`}
              className={`py-3 px-4 rounded-xl border-2 text-base font-medium transition-all duration-300
                ${
                  isSelected
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:border-indigo-500 dark:hover:bg-gray-700"
                }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepPreferredSchedule;
