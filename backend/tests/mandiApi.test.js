import request from "supertest";
import app from "../src/app.js";

jest.mock("../src/services/mandiService.js", () => ({
  getPrices: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getTrends: jest.fn().mockResolvedValue({ success: true, crop: "wheat", state: "mh", trends: [] }),
  getBestMandi: jest.fn().mockResolvedValue({ success: true, data: { crop: "wheat", mandi: "pune" } }),
  getSystemStatus: jest.fn().mockResolvedValue({ success: true, status: "success" })
}));

describe("Mandi API Routes", () => {
  it("GET /api/mandi-prices validation missing query", async () => {
    const res = await request(app).get("/api/mandi-prices");
    expect(res.status).toBe(400); // crop is required
  });

  it("GET /api/mandi-prices with valid query", async () => {
    const res = await request(app).get("/api/mandi-prices").query({ crop: "wheat" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/mandi-prices/trends missing state", async () => {
    const res = await request(app).get("/api/mandi-prices/trends").query({ crop: "wheat" });
    expect(res.status).toBe(400); // state is required
  });

  it("GET /api/mandi-prices/best returns data", async () => {
    const res = await request(app).get("/api/mandi-prices/best").query({ crop: "wheat" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  
  it("GET /api/mandi-prices/status", async () => {
    const res = await request(app).get("/api/mandi-prices/status");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});
