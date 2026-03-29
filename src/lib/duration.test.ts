import { describe, expect, it } from "vitest";
import { compareTargetVsActual } from "./duration";

describe("compareTargetVsActual", () => {
  it("returns on when within default tolerance", () => {
    expect(compareTargetVsActual(20, 19)).toEqual({ deltaMinutes: -1, status: "on" });
    expect(compareTargetVsActual(20, 21)).toEqual({ deltaMinutes: 1, status: "on" });
    expect(compareTargetVsActual(20, 20)).toEqual({ deltaMinutes: 0, status: "on" });
  });

  it("returns under when more than tolerance below target", () => {
    expect(compareTargetVsActual(20, 16)).toEqual({ deltaMinutes: -4, status: "under" });
  });

  it("returns over when more than tolerance above target", () => {
    expect(compareTargetVsActual(15, 18)).toEqual({ deltaMinutes: 3, status: "over" });
  });

  it("respects custom tolerance", () => {
    expect(compareTargetVsActual(20, 18, 2)).toEqual({ deltaMinutes: -2, status: "on" });
    expect(compareTargetVsActual(20, 17, 2)).toEqual({ deltaMinutes: -3, status: "under" });
  });
});
