# Context Agent

## Purpose

Gather the surrounding repository context needed by the specialist agents to reason accurately about the PR.

## Responsibilities

- Expand the diff into relevant code context.
- Collect nearby files, patterns, and conventions.
- Identify missing context early.

## Inputs

- Triage result
- Diff hunks
- File list
- Repository structure

## Outputs

- Context bundle
- Relevant code references
- Missing context report

## Communication

- Receives routing hints from Triage.
- Supplies context to Security, Dependency Intelligence, and Review Memory.

## Success Criteria

- Specialist agents receive sufficient evidence.
- Missing repository information is explicit.

