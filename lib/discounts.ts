import { Database } from "@/types/database";

type DiscountCode = Database["public"]["Tables"]["discount_codes"]["Row"];

export function validateDiscountCode(
  code: DiscountCode,
  context: "new_subscription" | "renewal"
): { isValid: boolean; error?: string } {
  if (!code.is_active) {
    return { isValid: false, error: "Discount code is inactive." };
  }

  const now = new Date();
  const validFrom = new Date(code.valid_from);
  if (now < validFrom) {
    return { isValid: false, error: "Discount code is not active yet." };
  }

  if (code.valid_until) {
    const validUntil = new Date(code.valid_until);
    if (now > validUntil) {
      return { isValid: false, error: "Discount code has expired." };
    }
  }

  if (code.max_uses !== null && code.times_used >= code.max_uses) {
    return { isValid: false, error: "Discount code usage limit reached." };
  }

  if (code.applies_to !== "both" && code.applies_to !== context) {
    return {
      isValid: false,
      error: `Discount code is only valid for ${
        code.applies_to === "new_subscription" ? "new subscriptions" : "renewals"
      }.`,
    };
  }

  return { isValid: true };
}

export function calculateDiscountedPrice(
  basePrice: number,
  code: DiscountCode
): number {
  if (code.discount_type === "percentage") {
    const percentage = Number(code.discount_value);
    const multiplier = 1 - percentage / 100;
    return Math.max(0, basePrice * multiplier);
  } else if (code.discount_type === "fixed_amount") {
    const amount = Number(code.discount_value);
    return Math.max(0, basePrice - amount);
  }

  return basePrice;
}
