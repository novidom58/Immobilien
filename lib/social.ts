// Kontaktwege ohne Telefonat: viele Interessenten schreiben lieber.
export const INSTAGRAM_HANDLE = "novidom.immo";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`;

export function whatsappLink(text: string, number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** WhatsApp-Link an eine bestimmte Telefonnummer (Schweizer Format wird umgewandelt). */
export function whatsappTo(phone: string, text: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `41${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
