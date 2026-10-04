import { Alert } from "@/components/ui/alert";

const STATUS_MESSAGES = {
  creada: "Donación registrada.",
  actualizada: "Cambios guardados.",
  eliminada: "Donación eliminada.",
} as const;

type StatusKey = keyof typeof STATUS_MESSAGES;

export function readEstado(
  value: string | string[] | undefined,
): StatusKey | null {
  const estado = Array.isArray(value) ? value[0] : value;
  if (estado === "creada" || estado === "actualizada" || estado === "eliminada") {
    return estado;
  }

  return null;
}

export function StatusMessage({
  estado,
}: {
  estado: string | string[] | undefined;
}) {
  const status = readEstado(estado);
  if (!status) {
    return null;
  }

  return <Alert variant="success">{STATUS_MESSAGES[status]}</Alert>;
}
