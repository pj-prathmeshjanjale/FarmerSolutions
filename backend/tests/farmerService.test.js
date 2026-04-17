import { getFarmerContext } from "../src/services/farmerService.js";
import FarmerProfile from "../src/models/FarmerProfile.js";
import { getCache, setCache } from "../src/utils/redisClient.js";

jest.mock("../src/models/FarmerProfile.js");
jest.mock("../src/utils/redisClient.js");

describe("Farmer Service - Context Gen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return cached profile if available", async () => {
    const mockProfile = { soilType: "black", irrigationType: "drip" };
    getCache.mockResolvedValue(mockProfile);

    const result = await getFarmerContext("user123");

    expect(getCache).toHaveBeenCalledWith("farmer:user123");
    expect(FarmerProfile.findOne).not.toHaveBeenCalled();
    expect(result.soilType).toBe("black");
  });

  it("should fetch from DB and set cache if not in cache", async () => {
    getCache.mockResolvedValue(null);
    const mockDbProfile = { soilType: "red", farmSize: 5 };
    FarmerProfile.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockDbProfile),
    });

    const result = await getFarmerContext("user123");

    expect(getCache).toHaveBeenCalledWith("farmer:user123");
    expect(FarmerProfile.findOne).toHaveBeenCalledWith({ user: "user123" });
    expect(setCache).toHaveBeenCalledWith("farmer:user123", mockDbProfile, 3600);
    expect(result.soilType).toBe("red");
    expect(result.farmSize).toBe("5 acres");
  });

  it("should return clean defaults if profile is missing", async () => {
    getCache.mockResolvedValue(null);
    FarmerProfile.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const result = await getFarmerContext("user123");

    expect(result).toBeNull();
  });
});
