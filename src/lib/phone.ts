// Normalizes an Indian mobile number to +91XXXXXXXXXX, or returns undefined
// if it isn't one. Accepts the ways people actually type numbers: spaces,
// dashes, parentheses, a leading 0, or a +91 / 91 prefix.
export function normalizeIndianMobile(raw: string): string | undefined {
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);

  // Indian mobile numbers are 10 digits and start with 6-9.
  if (!/^[6-9]\d{9}$/.test(digits)) return undefined;
  return `+91${digits}`;
}

// Display form for the admin console: +91 98765 43210
export function formatIndianMobile(phone: string): string {
  const digits = phone.replace(/^\+91/, "");
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
