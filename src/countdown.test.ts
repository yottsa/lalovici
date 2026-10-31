import { describe, expect, it } from "vitest";
import {
  daysLabel,
  hoursLabel,
  minutesLabel,
  pad2,
  secondsLabel,
  splitRemaining,
} from "./countdown";

describe("splitRemaining", () => {
  it("splits milliseconds into units", () => {
    const ms = ((2 * 24 + 3) * 60 * 60 + 4 * 60 + 5) * 1000 + 999;
    expect(splitRemaining(ms)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it("clamps negative differences to zero", () => {
    expect(splitRemaining(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("Serbian plural labels", () => {
  it.each([
    [1, "dan"], [2, "dana"], [5, "dana"], [11, "dana"], [21, "dan"], [101, "dan"], [111, "dana"],
  ])("days %i → %s", (n, label) => expect(daysLabel(n)).toBe(label));

  it.each([
    [0, "sati"], [1, "sat"], [2, "sata"], [4, "sata"], [5, "sati"], [11, "sati"],
    [12, "sati"], [21, "sat"], [22, "sata"], [23, "sata"],
  ])("hours %i → %s", (n, label) => expect(hoursLabel(n)).toBe(label));

  it.each([
    [1, "minut"], [2, "minuta"], [11, "minuta"], [21, "minut"], [31, "minut"], [59, "minuta"],
  ])("minutes %i → %s", (n, label) => expect(minutesLabel(n)).toBe(label));

  it.each([
    [0, "sekundi"], [1, "sekund"], [3, "sekunde"], [5, "sekundi"], [12, "sekundi"],
    [14, "sekundi"], [21, "sekund"], [33, "sekunde"], [44, "sekunde"], [57, "sekundi"],
  ])("seconds %i → %s", (n, label) => expect(secondsLabel(n)).toBe(label));
});

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(7)).toBe("07");
    expect(pad2(42)).toBe("42");
  });
});
