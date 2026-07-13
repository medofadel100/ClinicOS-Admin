"use client";

import { useTransition } from "react";
import { toggleDiscountCodeActive } from "@/app/actions/discounts";
import { Button } from "@/components/ui/button";

export function DiscountToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

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
      {isPending ? "..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
