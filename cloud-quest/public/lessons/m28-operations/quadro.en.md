# 28 — Operations (Cloud Logging, Monitoring, Trace, Profiler, Error Reporting)

## What it is

**Cloud Operations** (formerly **Stackdriver**, today also "Google Cloud Observability") is the umbrella for logs, metrics, traces, and profiling.

AWS anchor: **Cloud Operations ≈ Amazon CloudWatch** (+ X-Ray).

| GCP | Function | AWS |
|-----|--------|-----|
| Cloud Logging | centralized logs | CloudWatch Logs |
| Cloud Monitoring | metrics, alerts, dashboards | CloudWatch Metrics/Alarms |
| Error Reporting | groups exceptions | (no 1:1) |
| Cloud Trace | distributed tracing | AWS X-Ray |
| Cloud Profiler | CPU/memory profiling | CodeGuru Profiler |

## When to use

- App went down → alert me: **uptime check** + **alerting policy** (Cloud Monitoring).
- Count how many times a pattern appears in the log → **log-based metric** (counter).
- Grouped exceptions/errors from a microservice → **Error Reporting**.
- Latency of a request crossing multiple services → **Cloud Trace**.
- CPU/memory bottleneck in production code → **Cloud Profiler**.
- Long retention / compliance / SQL query → **sink** export to Cloud Storage / BigQuery / Pub/Sub.

## Key points

- **Stackdriver → Cloud Operations** (renaming): Stackdriver Monitoring = Cloud Monitoring, etc. Shows up on the exam under the old name.
- Managed services (**GKE, App Engine, Cloud Run, Cloud Functions**) send logs **automatically**. A **Compute Engine VM** needs an agent.
- **Ops Agent** = current and recommended agent (logs + metrics in one, YAML config). **Logging Agent (fluentd)** = legacy. Without an agent, the VM doesn't send memory/disk.
- **Log Router + sinks**: every log goes through the Router; sinks define destination/inclusion/exclusion.
- **Log buckets**:
  - `_Required`: Admin Activity, System Event, Access Transparency. **Fixed 400 days**, can't be deleted or changed. No cost.
  - `_Default`: everything else. **30 days** default, adjustable from **1 day to 10 years (3650)**. Billed.
- **Log-based metrics**: `counter` (counts entries matching the filter) vs `distribution` (captures a numeric value). Only apply to logs generated **in the project itself**.
- **Cloud Profiler**: statistical, low overhead, continuous in prod. Java, Go, Node.js, Python.
- **Error Reporting**: only fires with a stack trace sent to Logging (or via API). Go, Java, .NET, Node.js, PHP, Python, Ruby.

## Command/CLI (reference)

```bash
# Logs — read and filter
gcloud logging read 'severity>=ERROR AND resource.type="gce_instance"' --limit=20

# Write a test log
gcloud logging write my-log "test message" --severity=WARNING

# Sink: export logs to a Cloud Storage bucket (long retention)
gcloud logging sinks create my-sink \
  storage.googleapis.com/my-logs-bucket \
  --log-filter='resource.type="cloud_run_revision"'

# List log buckets (_Required / _Default)
gcloud logging buckets list --location=global

# Adjust _Default retention (30 -> 90 days)
gcloud logging buckets update _Default --location=global --retention-days=90

# Install the Ops Agent on a VM (recommended; replaces fluentd)
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent.sh
sudo bash add-google-cloud-ops-agent.sh --also-install

# Monitoring — list uptime checks
gcloud monitoring uptime list-configs
```

## Exam traps

- **Stackdriver = Cloud Operations.** The old name in the question stem is the same thing. Don't get confused.
- **A VM doesn't send logs/metrics on its own** → it needs an **agent** (Ops Agent today; fluentd Logging Agent is legacy). Managed services send on their own.
- `_Required` = **400 days, immutable**; `_Default` = **30 days, adjustable (1 day–10 years)**. Don't swap the numbers.
- "App is down, alert me" → **uptime check**, not a log-based metric.
- "Count occurrences of a string in the log" → **log-based metric (counter)**, then alert in Monitoring.
- Trace ≠ Profiler: **Trace** = latency between services; **Profiler** = CPU/memory consumption in code.
- Error Reporting **only groups** what reaches Logging with a stack trace (or via API).
- **Cloud Debugger was discontinued** (deprecated May 16, 2022, shut down May 31, 2023) — may appear in old material; it's not the current answer.
- To retain logs beyond 30 days for compliance → **sink** to Cloud Storage (or BigQuery to query). Don't rely on `_Default`.

## Sources

- https://cloud.google.com/logging/docs/buckets
- https://cloud.google.com/logging/docs/agent/ops-agent
- https://cloud.google.com/stackdriver/docs/release-notes
- https://cloud.google.com/logging/docs/logs-based-metrics
