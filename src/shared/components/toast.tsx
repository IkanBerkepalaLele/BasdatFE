import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { ToastState } from "@/features/auth/types";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const tones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  const Icon = icons[toast.tone];

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-extrabold shadow-sm ${tones[toast.tone]}`}>
      <span className="flex items-center gap-2">
        <Icon size={18} />
        {toast.message}
      </span>
    </div>
  );
}
