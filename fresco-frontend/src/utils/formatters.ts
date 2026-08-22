/**
 * Currency, date, and phone formatting utilities for FRESCO mobile application.
 */

/**
 * Formats a monetary number into Indian Rupee currency format (e.g. ₹249.00).
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats an ISO 8601 date string or Date object into human-readable date (e.g. "19 Aug 2026").
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
};

/**
 * Formats an ISO 8601 date string or Date object into human-readable date & time (e.g. "19 Aug 2026, 02:30 PM").
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(date);
  }
};

/**
 * Formats a 10-digit mobile number into formatted string (e.g. "+91 98765 43210").
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
