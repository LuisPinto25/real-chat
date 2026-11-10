import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export function formatMessageTime(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  return format(date, "h:mm a");
}

export function formatChatListItemDate(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Ayer";
  }
  return format(date, "dd/MM/yyyy", { locale: es });
}
