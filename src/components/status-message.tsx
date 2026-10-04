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

  return (
    <p
      role="status"
      className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
    >
      {STATUS_MESSAGES[status]}
    </p>
  );
}
