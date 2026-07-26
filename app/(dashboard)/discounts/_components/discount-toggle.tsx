"use client";

import { useTransition } from "react";
import { toggleDiscountCodeActive } from "@/app/actions/discounts";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function DiscountToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleDiscountCodeActive(id, !isActive);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? "..." : isActive ? t("deactivate") : t("activate")}
    </Button>
  );
}
