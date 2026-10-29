import { describe, expect, it, vi } from "vitest";
import { saveConfirmedOrder } from "./checkout";

describe("confirmed checkout", () => {
  it("creates a local history record only after persistence succeeds", async () => {
    const saveOrder = vi.fn().mockResolvedValue("firestore-order-id");
    const items = [{ id: 1, qty: 2 }];

    await expect(
      saveConfirmedOrder(saveOrder, "student-uid", items, 156, "2026-10-30T10:00:00.000Z"),
    ).resolves.toEqual({
      id: "firestore-order-id",
      items,
      total: 156,
      placedAt: "2026-10-30T10:00:00.000Z",
      status: "received",
    });
  });

  it("propagates persistence failures instead of creating a phantom order", async () => {
    const failure = new Error("Firestore permission denied");
    const saveOrder = vi.fn().mockRejectedValue(failure);

    await expect(
      saveConfirmedOrder(saveOrder, "student-uid", [{ id: 1, qty: 1 }], 93),
    ).rejects.toBe(failure);
  });
});
