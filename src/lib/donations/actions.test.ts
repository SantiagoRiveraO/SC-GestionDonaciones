import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ from: vi.fn(), insert: vi.fn(), update: vi.fn(), donor: vi.fn(), client: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/supabase/auth", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mock.client }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: () => { throw Object.assign(new Error("redirect"), { digest: "NEXT_REDIRECT" }); } }));
import { createDonation, updateDonation } from "./actions";

const donorId = "9427d8e1-36f6-4d13-811b-44fdf2f820bd";
const donationId = "bfc39ee5-64bc-4983-9cfc-2d7721b53fc2";
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ amount: "25,50", currency: "USD", donated_at: "2024-06-15", donor_mode: "registered", donor_id: donorId, donor_name: "Nombre escrito diferente", ...overrides })) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.clearAllMocks();
  mock.client.mockResolvedValue({ from: mock.from, rpc: mock.rpc });
  mock.donor.mockResolvedValue({ data: { id: donorId }, error: null });
  mock.insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: donationId }, error: null }) }) });
  mock.update.mockReturnValue({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: donationId }, error: null }) }) }) });
  mock.from.mockImplementation((table: string) => table === "donors" ? { select: () => ({ eq: () => ({ maybeSingle: mock.donor }) }) } : { insert: mock.insert, update: mock.update });
});
describe("identidad del donante al guardar", () => {
  it("no crea un donante a partir del texto ni guarda si falta la selección", async () => {
    const result = await createDonation(null, form({ donor_id: "" }));
    expect(result.fieldErrors.donor_id).toBeTruthy();
    expect(result.values.amount).toBe("25,50");
    expect(mock.client).not.toHaveBeenCalled();
  });
  it.each(["create", "update"])("%s conserva el ID elegido aunque cambie el nombre", async (operation) => {
    await expect(operation === "create" ? createDonation(null, form()) : updateDonation(donationId, null, form())).rejects.toThrow("redirect");
    expect(operation === "create" ? mock.insert : mock.update).toHaveBeenCalledWith(expect.objectContaining({ donor_id: donorId, amount: 25.5 }));
    expect(mock.rpc).not.toHaveBeenCalled();
    expect(mock.from.mock.calls.map(([table]) => table)).toEqual(["donors", "donations"]);
    expect(mock.donor).toHaveBeenCalledOnce();
  });
  it("rechaza una ficha inexistente sin escribir la donación", async () => {
    mock.donor.mockResolvedValue({ data: null, error: null });
    const result = await createDonation(null, form());
    expect(result.fieldErrors.donor_id).toBeTruthy();
    expect(mock.insert).not.toHaveBeenCalled();
  });
  it("guarda anónima solo si se marca explícitamente, ignorando el ID anterior", async () => {
    await expect(createDonation(null, form({ donor_mode: "anonymous" }))).rejects.toThrow("redirect");
    expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({ donor_id: null }));
    expect(mock.donor).not.toHaveBeenCalled();
  });
});
