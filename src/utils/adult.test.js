import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { ACTIVITY_LIBRARY, initialAdultData, mutualYes, safeAdultData } from "../data/adult.js";
import { createEncryptedVault, encryptVaultData, parseVaultRecord, unlockEncryptedVault } from "./adultVault.js";

globalThis.crypto ??= webcrypto;

async function run() {
  const catalogue = ACTIVITY_LIBRARY;
  assert.ok(catalogue.some((item) => item.id === "oral"));
  assert.ok(catalogue.some((item) => item.id === "masturbation_together"));
  assert.deepEqual(mutualYes({ A: { oral: "yes" }, B: { oral: "yes" } }, { A: true, B: false }, catalogue), []);
  assert.deepEqual(mutualYes({ A: { oral: "yes", toys: "no" }, B: { oral: "yes", toys: "yes" } }, { A: true, B: true }, catalogue).map((x) => x.id), ["oral"]);
  assert.deepEqual(mutualYes({ A: { oral: "hard_limit" }, B: { oral: "yes" } }, { A: true, B: true }, catalogue), []);
  assert.deepEqual(safeAdultData(null), initialAdultData());
  assert.equal(safeAdultData({ votes: { A: { oral: "hard_limit", fake: "bad" } } }).votes.A.oral, "hard_limit");

  const secret = "Example passphrase chosen for testing, not a real user's passphrase";
  const original = { ...initialAdultData(), journal: [{ id: "j1", body: "not for server logs" }] };
  await assert.rejects(() => createEncryptedVault("short", original), /12 characters/);
  const { key, record } = await createEncryptedVault(secret, original);
  const serialized = JSON.stringify(record);
  assert.ok(!serialized.includes("not for server logs"), "Sensitive plaintext must never appear in encrypted data.");
  assert.equal(parseVaultRecord(serialized).version, 1);
  assert.deepEqual((await unlockEncryptedVault(secret, record)).data, original);
  await assert.rejects(() => unlockEncryptedVault("incorrect passphrase", record), /Could not unlock/);
  const updated = await encryptVaultData(key, record, { ...original, journal: [] });
  assert.notEqual(updated.iv, record.iv, "Every save must use a new random AES-GCM IV.");
  assert.deepEqual((await unlockEncryptedVault(secret, updated)).data.journal, []);
  const tampered = { ...record, data: record.data.slice(0, -2) + "AA" };
  await assert.rejects(() => unlockEncryptedVault(secret, tampered), /Could not unlock/);
  console.log("Adult choices, encryption, tamper detection and backup round-trip tests passed.");
}
run().catch((err) => { console.error(err); process.exitCode = 1; });
