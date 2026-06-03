# Workflows — serverless service orchestration (≈ AWS Step Functions)

## What it is
- **Serverless** and **stateful** orchestrator: chains steps in a defined order, keeps state and guarantees durable execution. Zero infra.
- Steps described in **YAML** (or JSON). Unlike Step Functions, execution is **sequential by default** (no need to declare the `next` of each state). YAML accepts comments.
- Orchestrates anything that speaks HTTP: Cloud Run, Cloud Functions, Google APIs (BigQuery, Vision...) and external APIs.
- **Connectors**: a shortcut to call Google services without building the request/auth by hand; they already bring retry and long-running operation handling.

## When to use
- Coordinate **multiple services** in a flow with logic, ordering, conditionals and retries.
- Microservice chaining, ETL pipelines, infra automation (start/stop VM), integration with external systems.
- Wait for long-running processes via **polling** or **callback** (callback + Eventarc for external events).
- Do NOT use for: pure messaging/fan-out (→ Pub/Sub), one controlled task to one endpoint (→ Cloud Tasks), complex data DAGs with Airflow (→ Cloud Composer).

## Key points
- Trigger: API, **Cloud Scheduler** (cron/recurring), **Eventarc** (event-driven, e.g. a file in GCS).
- Flow control: `assign` (variables) · `switch` (≈ Choice) · `for` (≈ Map) · `sys.sleep` (≈ Wait) · `next` (jump step).
- Errors: `try`/`except` block; inside the try, a `retry` policy.
- Built-in retry policies: **default (idempotent)** auto on GET; **non-idempotent** on the other methods. Customizable: predicate + max_retries + backoff (initial_delay, max_delay, multiplier).
- Data passing between steps via variables; `params` receives the execution input.

## Command/CLI (reference)
```bash
# Deploy
gcloud workflows deploy MY_WF --source=workflow.yaml --location=us-central1

# Run and see the result
gcloud workflows run MY_WF --data='{"arg":"value"}'
gcloud workflows executions describe EXEC_ID --workflow=MY_WF
```
```yaml
# YAML skeleton (retry + call)
main:
  params: [input]
  steps:
    - call_step:
        try:
          call: http.get
          args: { url: https://api.example/x }
          result: r
        retry: ${http.default_retry}     # default idempotent for GET
        except:
          as: e
          steps:
            - log: { call: sys.log, args: { text: ${e.message} } }
    - end_step:
        return: ${r.body}
```

## Exam traps
- **Workflows vs Cloud Tasks vs Pub/Sub:**
  - **Workflows** = stateful orchestration, controls the ORDER of multiple services with logic/retries.
  - **Cloud Tasks** = EXPLICIT invocation: pushes 1 task to 1 endpoint; rate/scheduling/dedupe control; at-least-once delivery. Sender controls when/where it runs.
  - **Pub/Sub** = event bus, IMPLICIT fan-out; publisher doesn't know the consumers; N subscribers receive the same message (broadcast/decoupling).
- Rule: flow of steps → Workflows; control when/where 1 task runs → Cloud Tasks; decouple and broadcast → Pub/Sub.
- Eventarc → Workflows: an event larger than the maximum argument size **fails** the execution.
- `${...}` wraps expressions; don't confuse it with YAML literals.
- Step Functions uses JSON and requires `next` in every state; Workflows is YAML and sequential by default.

## Sources
- https://docs.cloud.google.com/workflows/docs/overview
- https://docs.cloud.google.com/workflows/docs/migrate-from-step-functions
- https://docs.cloud.google.com/workflows/docs/reference/syntax/retrying
- https://docs.cloud.google.com/pubsub/docs/choosing-pubsub-or-cloud-tasks
