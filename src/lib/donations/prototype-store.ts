import type { Donation } from "@/types/database";

const STORAGE_KEY = "funmiaven.donations.prototype";
const CHANGE_EVENT = "funmiaven-donations-change";

export type DonationInput = {
  amount: number;
  currency: string;
  donated_at: string;
  method: string | null;
  concept: string | null;
  notes: string | null;
};

let cachedRaw: string | null = null;
let cachedList: Donation[] = [];
let cachedSorted: Donation[] = [];
const EMPTY_SNAPSHOT: Donation[] = [];

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readRaw(): string {
  if (!canUseStorage()) return "[]";
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function parseList(raw: string): Donation[] {
  try {
    const parsed = JSON.parse(raw) as Donation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function refreshCache(raw: string) {
  cachedRaw = raw;
  cachedList = parseList(raw);
  cachedSorted = cachedList
    .slice()
    .sort((a, b) => b.donated_at.localeCompare(a.donated_at));
}

function getCachedList(): Donation[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    refreshCache(raw);
  }
  return cachedList;
}

function writeAll(donations: Donation[]) {
  if (!canUseStorage()) return;
  const raw = JSON.stringify(donations);
  localStorage.setItem(STORAGE_KEY, raw);
  refreshCache(raw);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeDonations(onStoreChange: () => void) {
  if (!canUseStorage()) return () => {};

  const handle = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}

export function getDonationsSnapshot(): Donation[] {
  getCachedList();
  return cachedSorted;
}

export function getDonationsServerSnapshot(): Donation[] {
  return EMPTY_SNAPSHOT;
}

export function listDonations(): Donation[] {
  return getDonationsSnapshot();
}

export function getDonation(id: string): Donation | null {
  return getCachedList().find((donation) => donation.id === id) ?? null;
}

export function createDonation(input: DonationInput): Donation {
  const now = new Date().toISOString();
  const donation: Donation = {
    id: crypto.randomUUID(),
    donor_id: null,
    amount: input.amount,
    currency: input.currency,
    donated_at: input.donated_at,
    method: input.method,
    concept: input.concept,
    notes: input.notes,
    created_by: null,
    updated_by: null,
    created_at: now,
    updated_at: now,
  };

  writeAll([donation, ...getCachedList()]);
  return donation;
}

export function updateDonation(
  id: string,
  input: DonationInput,
): Donation | null {
  const all = getCachedList().slice();
  const index = all.findIndex((donation) => donation.id === id);
  if (index < 0) return null;

  const updated: Donation = {
    ...all[index],
    amount: input.amount,
    currency: input.currency,
    donated_at: input.donated_at,
    method: input.method,
    concept: input.concept,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  };

  all[index] = updated;
  writeAll(all);
  return updated;
}

export function removeDonation(id: string): boolean {
  const all = getCachedList();
  const next = all.filter((donation) => donation.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);
  return true;
}
