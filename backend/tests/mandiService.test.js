import { cleanMandiData } from "../src/services/mandiDataCleaner.js";

describe("Mandi Data Cleaner Service", () => {
  it("should return empty array for invalid input", () => {
    const result = cleanMandiData(null);
    expect(result.cleaned).toHaveLength(0);
    expect(result.skipped).toBe(0);
  });

  it("should normalize crop and mandi strings", () => {
    const rawData = [
      { crop: " Soya Bean ", mandi: " PUNE ", state: "MAHARASHTRA", minPrice: 100, maxPrice: 200, modalPrice: 150 }
    ];
    const { cleaned } = cleanMandiData(rawData);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].crop).toBe("soyabean"); // From ALIAS mapping
    expect(cleaned[0].mandi).toBe("pune");
    expect(cleaned[0].state).toBe("maharashtra");
  });

  it("should drop rows with missing or invalid prices", () => {
    const rawData = [
      { crop: "wheat", mandi: "pune", state: "mh", minPrice: 100, maxPrice: 200, modalPrice: "NaN" },
      { crop: "wheat", mandi: "mumbai", state: "mh", minPrice: -10, maxPrice: 200, modalPrice: 150 }
    ];
    const { cleaned, skipped } = cleanMandiData(rawData);
    expect(cleaned).toHaveLength(0);
    expect(skipped).toBe(2);
  });

  it("should fix inverted min/max prices and clamp modal", () => {
    const rawData = [
      { crop: "wheat", mandi: "pune", state: "mh", minPrice: 500, maxPrice: 200, modalPrice: 100 }
    ];
    const { cleaned } = cleanMandiData(rawData);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].minPrice).toBe(200);
    expect(cleaned[0].maxPrice).toBe(500);
    expect(cleaned[0].modalPrice).toBe(200); // Clamped up to min
  });

  it("should deduplicate by crop, mandi and date", () => {
    const date = new Date().toISOString();
    const rawData = [
      { crop: "wheat", mandi: "pune", state: "mh", date, minPrice: 100, maxPrice: 200, modalPrice: 150 },
      { crop: "wheat", mandi: "pune", state: "mh", date, minPrice: 110, maxPrice: 210, modalPrice: 160 }
    ];
    const { cleaned, skipped } = cleanMandiData(rawData);
    expect(cleaned).toHaveLength(1);
    expect(skipped).toBe(1);
    expect(cleaned[0].modalPrice).toBe(150); // Kept the first one
  });
});
