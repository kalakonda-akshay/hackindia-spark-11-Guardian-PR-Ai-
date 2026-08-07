import crypto from "crypto";
import { Request, Response } from "express";
import { env } from "../config/env.js";

/**
 * Handles incoming GitHub webhooks.
 * Validates the signature and queues work for the Orchestrator.
 */
export class WebhookHandler {
  /**
   * Middleware to verify the GitHub webhook signature using HMAC SHA-256.
   * Assumes body-parser.raw or similar has captured the raw body into req.rawBody.
   */
  public verifySignature(req: Request, res: Response, next: Function) {
    const signature = req.headers["x-hub-signature-256"] as string;
    
    if (!signature) {
      return res.status(401).send("Missing X-Hub-Signature-256 header");
    }

    const payload = (req as any).rawBody || JSON.stringify(req.body);
    
    const hmac = crypto.createHmac("sha256", env.GITHUB_WEBHOOK_SECRET || "");
    const digest = "sha256=" + hmac.update(payload).digest("hex");

    if (signature !== digest) {
      return res.status(401).send("Invalid signature");
    }

    next();
  }

  /**
   * Main webhook entrypoint after signature verification.
   */
  public async handleEvent(req: Request, res: Response) {
    const event = req.headers["x-github-event"] as string;
    const action = req.body.action;

    // Acknowledge receipt quickly to avoid GitHub timeout
    res.status(202).send("Accepted");

    try {
      if (event === "pull_request") {
        if (["opened", "synchronize", "reopened", "review_requested"].includes(action)) {
          await this.queueReviewWork(req.body);
        }
      } else if (event === "pull_request_review") {
        // Handle review events if needed
      } else {
        console.info(`[Webhook] Ignored event: ${event}.${action}`);
      }
    } catch (error) {
      console.error("[Webhook Error]", error);
      // We already returned 202, so we just log the processing error.
    }
  }

  /**
   * Queues the PR payload for the Orchestrator Agent.
   */
  private async queueReviewWork(payload: any) {
    console.info(`[Webhook] Queueing work for PR #${payload.pull_request.number} in ${payload.repository.full_name}`);
    
    // In a production system, this would push to an SQS/RabbitMQ queue.
    // For now, we simulate async offload to the Orchestrator Agent.
    
    const reviewRequest = {
      repository: {
        id: payload.repository.id,
        name: payload.repository.name,
        full_name: payload.repository.full_name,
        owner: {
          login: payload.repository.owner.login,
          id: payload.repository.owner.id,
        },
        html_url: payload.repository.html_url,
      },
      pullRequest: {
        id: payload.pull_request.id,
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        body: payload.pull_request.body,
        state: payload.pull_request.state,
        html_url: payload.pull_request.html_url,
        diff_url: payload.pull_request.diff_url,
        base: payload.pull_request.base,
        head: payload.pull_request.head,
        user: payload.pull_request.user,
      },
      action: payload.action,
    };

    // TODO: Trigger OrchestratorAgent.run(reviewRequest)
    // import { orchestratorAgent } from "../agents/orchestrator/index.js";
    // await orchestratorAgent.handleReviewRequest(reviewRequest);
  }
}

export const webhookHandler = new WebhookHandler();
