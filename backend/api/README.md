# API Design

This file defines the backend HTTP contract only. It does not implement routes.

## Endpoints

### `POST /review`

Starts a review run for a pull request.

Request model:
- `repository`: string
- `pullRequestNumber`: number
- `pullRequestUrl?`: string
- `source`: `"webhook" | "manual"`
- `priority?`: `"low" | "normal" | "high"`
- `metadata?`: object

Response model:
- `reviewId`: string
- `status`: `"queued" | "running" | "completed" | "failed"`
- `message`: string
- `timelineUrl?`: string

### `POST /github/webhook`

Receives GitHub webhook events and routes supported pull request events into the review pipeline.

Request model:
- `eventType`: string
- `deliveryId`: string
- `signature`: string
- `payload`: object

Response model:
- `accepted`: boolean
- `reviewId?`: string
- `reason?`: string

### `GET /review/:id`

Returns the current state of a review run.

Response model:
- `reviewId`: string
- `status`: string
- `repository`: string
- `pullRequestNumber`: number
- `summary`: object
- `findings`: array
- `timeline`: array

### `GET /findings`

Returns findings across review runs.

Query model:
- `repository?`
- `severity?`
- `agent?`
- `status?`

Response model:
- `items`: array
- `pageInfo`: object

### `GET /history`

Returns prior review history for a repository or pull request.

Response model:
- `items`: array
- `pageInfo`: object

### `GET /timeline`

Returns a chronological event stream for a review.

Response model:
- `reviewId`: string
- `events`: array

### `GET /metrics`

Returns aggregate system metrics.

Response model:
- `uptime`: number
- `reviewCounts`: object
- `agentHealth`: object
- `evaluationStats`: object

### `GET /health`

Returns operational health of the backend.

Response model:
- `status`: `"ok" | "degraded" | "down"`
- `dependencies`: object
- `timestamp`: string

## Request and response principles

- Responses should be stable and versionable.
- All review objects should include trace references.
- Errors should be structured and machine-readable.
