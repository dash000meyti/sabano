/** Converts Persian/Arabic-Indic digits to ASCII. Safe for client and server. */
export function asciiDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts an e-mail address or a phone number (8–15 digits, optional +/00 prefix). */
export function isValidContact(raw: string): boolean {
  const v = asciiDigits(raw).trim();
  if (emailRe.test(v)) return true;
  const digits = v.replace(/[\s\-()]/g, '');
  return /^(\+|00)?\d{8,15}$/.test(digits);
}
