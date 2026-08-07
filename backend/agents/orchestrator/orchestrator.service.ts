import { randomUUID } from "crypto";
import { ReviewRequest } from "../../models/github.types.js";
import { ReviewSession, ReviewStatus } from "../../models/orchestrator.types.js";
import { messageBus } from "../../services/message-bus.js";
import { SessionModel } from "../../db/Session.js";
import { socketService } from "../../services/socket.service.js";
import { githubService } from "../../github/github.service.js";

/**
 * Orchestrator Service manages the lifecycle of a PR review.
 * It is responsible for state transitions, agent invocation order,
 * retry logic, and aggregating the final context.
 */
export class OrchestratorService {

  /**
   * Initializes a new review session from a webhook event.
   */
  public async handleReviewRequest(request: ReviewRequest): Promise<string> {
    const sessionId = randomUUID();
    
    const session = new SessionModel({
      id: sessionId,
      status: "CREATED",
      reviewRequest: request,
      timeline: [],
      contextBundle: {},
    });

    await session.save();
    await this.logTransition(sessionId, "CREATED", "Review session created from webhook");

    // Fire and forget the workflow execution to free up the webhook response
    this.executeWorkflow(sessionId).catch(err => {
      console.error(`[Orchestrator] Fatal workflow error for ${sessionId}:`, err);
    });

    return sessionId;
  }

  /**
   * Main workflow execution loop enforcing the sequential agent order.
   */
  private async executeWorkflow(sessionId: string): Promise<void> {
    try {
      // 1. Triage
      await this.invokeAgent(sessionId, "triage", "TRIAGE_RUNNING", "Context");

      // 2. Context
      await this.invokeAgent(sessionId, "context", "CONTEXT_RUNNING", "Context");

      // 3. Security (Parallelizable in future)
      await this.invokeAgent(sessionId, "security", "SECURITY_RUNNING", "Context");

      // 4. Dependency Intelligence (Parallelizable in future)
      await this.invokeAgent(sessionId, "dependency", "DEPENDENCY_RUNNING", "Context");

      // 5. Review Memory (Parallelizable in future)
      await this.invokeAgent(sessionId, "memory", "MEMORY_RUNNING", "Context");

      // 6. Reporter
      await this.invokeAgent(sessionId, "reporter", "REPORT_RUNNING", "Context");

      // 7. Evaluation
      await this.invokeAgent(sessionId, "evaluation", "EVALUATION_RUNNING", "Context");

      await this.updateStatus(sessionId, "COMPLETED");
      await this.logTransition(sessionId, "COMPLETED", "Workflow completed successfully");

      // Post the final report back to GitHub
      try {
        const finalSession = await this.getSession(sessionId);
        const report = finalSession.contextBundle.reporter;
        const prUrl = finalSession.reviewRequest.pullRequest.html_url;
        
        if (report?.markdownBody && prUrl) {
          await githubService.postComment(prUrl, report.markdownBody);
          await this.logTransition(sessionId, "COMPLETED", `Successfully posted review to GitHub PR: ${prUrl}`);
        }
      } catch (err: any) {
        console.error(`[Orchestrator] Failed to post comment to GitHub: ${err.message}`);
      }

    } catch (error: any) {
      await this.updateStatus(sessionId, "FAILED");
      await this.logTransition(sessionId, "FAILED", `Workflow failed: ${error.message}`);
    }
  }

  /**
   * Invokes an agent via the message bus, handling timeouts and retries.
   */
  private async invokeAgent(
    sessionId: string, 
    agentId: string, 
    runningStatus: ReviewStatus, 
    payloadType: string,
    maxRetries = 2
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    await this.updateStatus(sessionId, runningStatus);
    await this.logTransition(sessionId, runningStatus, `Invoking ${agentId} agent`);

    let attempts = 0;
    
    while (attempts <= maxRetries) {
      attempts++;
      try {
        messageBus.publishRequest(agentId, {
          sessionId,
          agentId,
          payload: session.contextBundle // Share accumulated context
        });

        // Wait for response with a 30s timeout per attempt
        const response = await messageBus.awaitResponse(agentId, sessionId, 30000);

        if (response.status === "SUCCESS") {
          // Merge agent output into the accumulated context bundle
          const updatedSession = await this.getSession(sessionId);
          updatedSession.contextBundle[agentId] = response.data;
          
          // Mongoose needs to be told Mixed types were modified
          updatedSession.markModified('contextBundle');
          await updatedSession.save();
          
          await this.logTransition(sessionId, runningStatus, `Agent ${agentId} completed successfully on attempt ${attempts}`);
          return;
        } else {
          throw new Error(response.error || `Agent ${agentId} failed internally`);
        }
      } catch (error: any) {
        await this.logTransition(sessionId, runningStatus, `Agent ${agentId} failed attempt ${attempts}: ${error.message}`);
        
        if (attempts > maxRetries) {
          throw new Error(`Agent ${agentId} exhausted ${maxRetries} retries. Final error: ${error.message}`);
        }
        
        // Exponential backoff before retry (e.g., 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
  }

  private async updateStatus(sessionId: string, status: ReviewStatus) {
    await SessionModel.findOneAndUpdate({ id: sessionId }, { status });
    socketService.emit("status_update", { sessionId, status });
  }

  private async logTransition(sessionId: string, event: string, details: string) {
    console.info(`[Orchestrator ${sessionId}] [${event}] ${details}`);
    const timelineEvent = {
      timestamp: new Date(),
      event,
      details: { message: details }
    };
    await SessionModel.findOneAndUpdate(
      { id: sessionId },
      { $push: { timeline: timelineEvent } }
    );
    socketService.emit("timeline_update", { sessionId, ...timelineEvent });
  }

  public async getSession(sessionId: string) {
    const session = await SessionModel.findOne({ id: sessionId });
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return session;
  }

  public async getLatestSession() {
    return await SessionModel.findOne().sort({ createdAt: -1 });
  }
}

export const orchestratorService = new OrchestratorService();
