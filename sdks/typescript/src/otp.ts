export class OtpExtractionError extends Error {
  readonly code = "EXTRACTION_FAILED";
  constructor() {
    super("A unique contextual six-digit OTP was not found");
    this.name = "OtpExtractionError";
  }
}

export function extractContextualSixDigitOtp(text: string): string {
  const matches = new Set<string>();
  const patterns = [
    /(?:verification\s+code|security\s+code|login\s+code|one[- ]time\s+(?:password|code)|otp|验证码|驗證碼)[^0-9]{0,32}([0-9]{6})(?![0-9])/giu,
    /(?<![0-9])([0-9]{6})[^a-z0-9\p{Script=Han}]{0,32}(?:is\s+your\s+(?:verification|security|login)\s+code|验证码|驗證碼)/giu,
  ];
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) if (match[1]) matches.add(match[1]);
  if (matches.size !== 1) throw new OtpExtractionError();
  return [...matches][0]!;
}
