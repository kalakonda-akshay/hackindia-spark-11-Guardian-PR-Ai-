import { EventEmitter } from "events";
import { AgentRequest, AgentResponse } from "../models/orchestrator.types.js";

/**
 * Internal Message Bus to decouple agent invocation from orchestration logic.
 * Enables future parallel execution by publishing messages and listening for responses.
 */
class MessageBus extends EventEmitter {
  constructor() {
    super();
    // Allow a larger number of listeners since multiple agents might listen concurrently.
    this.setMaxListeners(20);
  }

  /**
   * Publishes a request for an agent to process.
   */
  public publishRequest(agentId: string, request: AgentRequest): void {
    this.emit(`request:${agentId}`, request);
  }

  /**
   * Agents use this to subscribe to their specific requests.
   */
  public subscribeToRequest(agentId: string, handler: (request: AgentRequest) => void): void {
    this.on(`request:${agentId}`, handler);
  }

  /**
   * Agents publish their response back to the bus.
   */
  public publishResponse(agentId: string, response: AgentResponse): void {
    this.emit(`response:${agentId}:${response.sessionId}`, response);
  }

  /**
   * Orchestrator uses this to await a response from a specific agent for a specific session.
   */
  public awaitResponse(agentId: string, sessionId: string, timeoutMs: number = 60000): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      const eventName = `response:${agentId}:${sessionId}`;
      
      const timeout = setTimeout(() => {
        this.removeAllListeners(eventName);
        reject(new Error(`Agent ${agentId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.once(eventName, (response: AgentResponse) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }
}

export const messageBus = new MessageBus();
