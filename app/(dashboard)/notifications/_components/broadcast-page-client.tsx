"use client";

import { useLanguage } from "@/lib/i18n/context";
import { BroadcastForm } from "./broadcast-form";

interface Props {
  hasPermission: boolean;
}

export function BroadcastPageClient({ hasPermission }: Props) {
  const { t } = useLanguage();

  if (!hasPermission) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t("noPermissionBroadcast") || "You do not have permission to broadcast internal notifications."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t("broadcastNotification") || "Broadcast Notification"}</h1>
        <p className="text-slate-600">{t("broadcastDescription") || "Send an internal message to the admin team."}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <BroadcastForm />
      </div>
    </div>
  );
}
