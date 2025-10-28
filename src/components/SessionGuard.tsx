import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogOut } from 'lucide-react';

/**
 * Componente que exibe feedback visual quando uma sessão é invalidada
 * Deve ser incluído no AppProviders ou layout principal
 */
export function SessionGuard() {
  const { user, isSessionValid } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Se há usuário mas sessão está inválida, mostra aviso
    if (user && !isSessionValid) {
      setShowWarning(true);
      
      // Auto-hide após 5 segundos (usuário já será deslogado)
      const timer = setTimeout(() => setShowWarning(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowWarning(false);
    }
  }, [user, isSessionValid]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sessão Encerrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Detectamos um login em outro dispositivo ou navegador. Por segurança, 
            esta sessão foi encerrada automaticamente.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <LogOut className="w-4 h-4" />
          <span>Redirecionando para login...</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 animate-progress"
            style={{ animation: 'progress 5s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}