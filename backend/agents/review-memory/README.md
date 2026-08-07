# Review Memory Agent

## Purpose

Surface relevant historical review intelligence and repeated patterns so the system can avoid revisiting known issues.

## Responsibilities

- Retrieve prior findings for the same code paths.
- Highlight recurring issues or repeated guidance.
- Keep memory advisory rather than authoritative.

## Inputs

- Context bundle
- Review history
- Repository conventions

## Outputs

- Memory summary
- Recurring pattern report
- Historical notes

## Communication

- Receives context from the Context Agent.
- Sends memory notes to Reporter.

## Success Criteria

- Useful history is surfaced.
- Stale memory does not override current evidence.

