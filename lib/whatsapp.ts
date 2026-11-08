export function whatsappLink(number: string, message?: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  const text = message?.trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
