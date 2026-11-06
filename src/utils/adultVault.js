/**
 * Local-only password-encrypted vault for adults' self-authored intimate data.
 * No key, passphrase, plaintext or personal entries are sent to any server.
 * A lost passphrase cannot be recovered. Existing legacy localStorage is NOT encrypted.
 */
export const VAULT_KEY = "powerapp:adult-vault:v1";
const ITERATIONS = 310000;
const AAD = new TextEncoder().encode("PowerApp adult vault v1");
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64 = (bytes) => {
  let result = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    result += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(result);
};
const base64ToBytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

function requireCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("This vault requires a secure HTTPS browser with Web Crypto support.");
  }
}

async function makeKey(passphrase, salt, iterations = ITERATIONS) {
  requireCrypto();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function readVaultRecord(store = localStorage) {
  const raw = store.getItem(VAULT_KEY);
  if (!raw) return null;
  return parseVaultRecord(raw);
}

export function parseVaultRecord(raw) {
  const value = JSON.parse(raw);
  if (value?.version !== 1 || value?.kdf !== "PBKDF2-SHA256" || value?.cipher !== "AES-256-GCM" ||
      !Number.isInteger(value.iterations) || value.iterations < ITERATIONS || value.iterations > 2000000 ||
      !["salt", "iv", "data"].every((field) => typeof value[field] === "string" && value[field].length > 12)) {
    throw new Error("Unsupported or invalid encrypted vault backup.");
  }
  if (base64ToBytes(value.salt).length !== 16 || base64ToBytes(value.iv).length !== 12) {
    throw new Error("Invalid vault cryptography parameters.");
  }
  return value;
}

export async function createEncryptedVault(passphrase, initialData) {
  if (typeof passphrase !== "string" || passphrase.length < 12) {
    throw new Error("Choose a passphrase at least 12 characters long.");
  }
  requireCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await makeKey(passphrase, salt);
  const record = await encryptVaultData(key, {
    version: 1, kdf: "PBKDF2-SHA256", cipher: "AES-256-GCM",
    iterations: ITERATIONS, salt: bytesToBase64(salt),
  }, initialData);
  return { key, record };
}

export async function unlockEncryptedVault(passphrase, record) {
  const parsed = parseVaultRecord(JSON.stringify(record));
  const key = await makeKey(passphrase, base64ToBytes(parsed.salt), parsed.iterations);
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parsed.iv), additionalData: AAD },
      key, base64ToBytes(parsed.data),
    );
    return { key, data: JSON.parse(decoder.decode(decrypted)) };
  } catch {
    throw new Error("Could not unlock. Check the passphrase or restore a valid backup.");
  }
}

export async function encryptVaultData(key, oldRecord, data) {
  requireCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: AAD },
    key, encoder.encode(JSON.stringify(data)),
  );
  return {
    version: 1,
    kdf: "PBKDF2-SHA256",
    cipher: "AES-256-GCM",
    iterations: oldRecord.iterations,
    salt: oldRecord.salt,
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export function saveVaultRecord(record, store = localStorage) {
  store.setItem(VAULT_KEY, JSON.stringify(record));
}

export function removeVaultRecord(store = localStorage) {
  store.removeItem(VAULT_KEY);
}
