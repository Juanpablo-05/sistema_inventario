import Swal, { type SweetAlertOptions } from "sweetalert2";

type ConfirmDangerActionInput = {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function getAlertThemeOptions(): SweetAlertOptions {
  return {
    background: readCssVar("--color-surface", "#ffffff"),
    color: readCssVar("--color-text", "#111827"),
    confirmButtonColor: readCssVar("--color-btn-primary", "#16c2e0"),
    cancelButtonColor: readCssVar("--color-secondary", "#6e6a6a"),
    customClass: {
      popup: "app-alert-popup",
      title: "app-alert-title",
      htmlContainer: "app-alert-text",
    },
  };
}

async function fireAlert(options: SweetAlertOptions) {
  return Swal.fire({
    ...getAlertThemeOptions(),
    ...options,
  } as SweetAlertOptions);
}

export async function confirmDangerAction({
  title,
  text,
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "Cancelar",
}: ConfirmDangerActionInput): Promise<boolean> {
  const result = await fireAlert({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export async function showSuccessAlert(
  title: string,
  text?: string,
): Promise<void> {
  await fireAlert({
    title,
    text,
    icon: "success",
    timer: 1700,
    showConfirmButton: false,
  });
}

export async function showErrorAlert(
  error: unknown,
  title = "Ocurrió un error",
): Promise<void> {
  await fireAlert({
    title,
    text: error instanceof Error ? error.message : "Error inesperado.",
    icon: "error",
  });
}

export async function showStateActiveAlert(
  title: string,
  text = "Tu cuenta está inactiva, no tienes acceso a este módulo.",
): Promise<void> {
  await fireAlert({
    title,
    text,
    icon: "info",
    confirmButtonText: "Entendido",
  });
}
