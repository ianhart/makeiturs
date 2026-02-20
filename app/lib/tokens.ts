import { randomBytes } from "crypto";

/**
 * Generate a cryptographically secure portal token.
 * 24 random bytes → 32-character base64url string.
 * Entropy: ~192 bits (far more than needed for URL security).
 */
export function generatePortalToken(): string {
  return randomBytes(24).toString("base64url");
}
