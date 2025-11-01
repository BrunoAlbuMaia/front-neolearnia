import { useLoading } from "../context/LoadingContext";
import { Spinner } from "./ui/spinner";

/**
 * Componente que exibe um spinner global quando há requisições em andamento
 * É controlado automaticamente pelo client.ts
 */
export function GlobalSpinner() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return <Spinner fullScreen text="Carregando..." />;
}

