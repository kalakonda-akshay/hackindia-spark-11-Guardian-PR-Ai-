import { describe, it, expect, vi } from "vitest";
import { webhookHandler } from "../github/webhook.handler.js";
import crypto from "crypto";

// Mock the environment config so we can test with a stable secret
vi.mock("../config/env.js", () => ({
  env: {
    GITHUB_WEBHOOK_SECRET: "test-secret",
  },
}));

describe("WebhookHandler", () => {
  describe("verifySignature", () => {
    it("should accept valid signature", () => {
      const payload = JSON.stringify({ action: "opened" });
      const hmac = crypto.createHmac("sha256", "test-secret");
      const signature = "sha256=" + hmac.update(payload).digest("hex");

      const req = {
        headers: { "x-hub-signature-256": signature },
        body: { action: "opened" },
        rawBody: payload, // simulated raw body
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const next = vi.fn();

      webhookHandler.verifySignature(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject invalid signature", () => {
      const payload = JSON.stringify({ action: "opened" });
      const req = {
        headers: { "x-hub-signature-256": "sha256=invalidhash" },
        body: { action: "opened" },
        rawBody: payload,
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const next = vi.fn();

      webhookHandler.verifySignature(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Invalid signature");
    });

    it("should reject missing signature header", () => {
      const req = {
        headers: {},
        body: { action: "opened" },
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const next = vi.fn();

      webhookHandler.verifySignature(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
