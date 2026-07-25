import { Resend } from "resend";

/** Returns null when RESEND_API_KEY isn't set yet. */
export function createResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
