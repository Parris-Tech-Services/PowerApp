import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { ACTIVITY_LIBRARY, initialAdultData, mutualYes, safeAdultData } from "../data/adult.js";
import { COVENANT_TOPICS, COVENANT_REFERENCES, normaliseChristianSpace } from "../data/christianNsfw.js";
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

  // Old encrypted v1 data must remain fully readable and be extended additively.
  const prior = {
    version: 1, votes: { A: { oral: "hard_limit" }, B: {} }, ready: { A: true, B: false },
    customActivities: [{ id: "custom", title: "Previously saved" }],
    journal: [{ id: "old", body: "Existing private note" }],
    plans: [{ id: "oldplan", title: "Existing plan" }],
    checkins: [{ id: "oldcheckin", mood: "Fine" }],
  };
  const migrated = safeAdultData(prior);
  assert.deepEqual(migrated.votes, prior.votes);
  assert.deepEqual(migrated.journal, prior.journal);
  assert.deepEqual(migrated.plans, prior.plans);
  assert.deepEqual(migrated.checkins, prior.checkins);
  assert.equal(migrated.christian.safeword, "Red");
  assert.equal(migrated.christian.showScripture, true);
  assert.equal(COVENANT_TOPICS.some((t) => t.title === "Anal sex"), true);
  assert.equal(COVENANT_TOPICS.some((t) => t.title === "Oral sex"), true);
  assert.equal(COVENANT_TOPICS.some((t) => t.risk === "critical"), true);
  assert.ok(COVENANT_TOPICS.length >= 80, "The adult catalogue should include the expanded topics.");
  assert.ok(COVENANT_TOPICS.some((t) => t.title === "Pegging"));
  assert.ok(COVENANT_TOPICS.some((t) => t.title === "STI testing before fluid exchange"));
  assert.ok(COVENANT_REFERENCES.some((r) => r.reference.includes("Song of Songs")));
  assert.deepEqual(normaliseChristianSpace(null), initialAdultData().christian);
  const privateSpace = {
    ...migrated.christian,
    showScripture: false, safeword: "Stop now",
    privateNotes: [{ id: "c-1", title: "Personal", body: "User's confidential notes", date: "2026-11-06", status: "private" }],
    scenePlans: [{ id: "plan-1", title: "Tonight", limits: "No pressure", aftercare: "Talk afterwards", date: "2026-11-06" }],
    debriefs: [{ id: "deb-1", partner: "Partner A", mood: "Connected", date: "2026-11-06", activities: "Sample notes", orgasmIntensity: "7", pleasure: "8", discomfort: "0" }],
  };
  const roundtrip = safeAdultData({ ...prior, christian: privateSpace });
  assert.equal(roundtrip.christian.showScripture, false);
  assert.equal(roundtrip.christian.safeword, "Stop now");
  assert.equal(roundtrip.christian.privateNotes[0].body, "User's confidential notes");
  assert.equal(roundtrip.christian.scenePlans[0].title, "Tonight");
  assert.equal(roundtrip.christian.debriefs[0].mood, "Connected");
  assert.equal(roundtrip.christian.debriefs[0].orgasmIntensity, "7");
  assert.equal(roundtrip.christian.debriefs[0].pleasure, "8");
  assert.equal(roundtrip.christian.debriefs[0].discomfort, "0");
  assert.equal(JSON.stringify(roundtrip).includes("Existing private note"), true);
  assert.equal(normaliseChristianSpace({ privateNotes: [{ body: "x" }], safeword: "" }).safeword, "Red");

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
  const { key: existingKey, record: oldEnvelope } = await createEncryptedVault(secret, prior);
  const unlockedOld = await unlockEncryptedVault(secret, oldEnvelope);
  const modernData = safeAdultData(unlockedOld.data);
  const modernEnvelope = await encryptVaultData(existingKey, oldEnvelope, modernData);
  const reloadedModern = (await unlockEncryptedVault(secret, modernEnvelope)).data;
  assert.deepEqual(reloadedModern.journal, prior.journal);
  assert.equal(reloadedModern.christian.showScripture, true);
  const withPrivateNote = safeAdultData({ ...modernData, christian: privateSpace });
  const encryptedPrivate = await encryptVaultData(existingKey, modernEnvelope, withPrivateNote);
  assert.ok(!JSON.stringify(encryptedPrivate).includes("User\'s confidential notes"));
  assert.equal((await unlockEncryptedVault(secret, encryptedPrivate)).data.christian.privateNotes[0].body, "User\'s confidential notes");
  const tampered = { ...record, data: record.data.slice(0, -2) + "AA" };
  await assert.rejects(() => unlockEncryptedVault(secret, tampered), /Could not unlock/);
  console.log("Adult choices, encryption, tamper detection and backup round-trip tests passed.");
}
run().catch((err) => { console.error(err); process.exitCode = 1; });
