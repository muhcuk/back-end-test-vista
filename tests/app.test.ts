import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("API", () => {
  it("reports health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects invalid company payloads", async () => {
    const response = await request(app).post("/companies").send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects invalid service ids", async () => {
    const response = await request(app).get("/services/not-a-uuid");
    expect(response.status).toBe(400);
  });
});
