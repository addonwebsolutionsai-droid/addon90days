/**
 * P02 ChatBase — AES-256-GCM encryption for WhatsApp access tokens.
 *
 * Key source: P02_ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
 * We use Web Crypto API (available in Node 18+ and Vercel edge runtime).
 */

const IV_BYTES = 12; // 96-bit IV for GCM
const TAG_BYTES = 16;

function getKeyHex(): string {
  const k = process.env["P02_ENCRYPTION_KEY"];
  if (!k || k.length !== 64) {
    throw new Error("P02_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return k;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function importKey(): Promise<CryptoKey> {
  const rawKey = hexToBytes(getKeyHex());
  return crypto.subtle.importKey("raw", rawKey.buffer as ArrayBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Encrypt plaintext string → Buffer containing: IV (12B) + ciphertext + GCM tag (16B) */
export async function encryptToken(plaintext: string): Promise<Buffer> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer, tagLength: TAG_BYTES * 8 },
    key,
    encoded.buffer as ArrayBuffer
  );

  const result = new Uint8Array(IV_BYTES + cipherBuffer.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(cipherBuffer), IV_BYTES);
  return Buffer.from(result);
}

/** Decrypt Buffer (IV + ciphertext+tag) → plaintext string */
export async function decryptToken(encrypted: Buffer): Promise<string> {
  const key = await importKey();
  const bytes = new Uint8Array(encrypted);
  const iv = bytes.slice(0, IV_BYTES);
  const ciphertext = bytes.slice(IV_BYTES);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer, tagLength: TAG_BYTES * 8 },
    key,
    ciphertext.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(plainBuffer);
}

export { bytesToHex, hexToBytes };
