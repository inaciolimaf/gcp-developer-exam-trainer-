# Eventarc

## What it is
- GCP's event routing layer: receives events from multiple sources and delivers them to a destination, decoupled.
- AWS equivalent: **Amazon EventBridge**.
- Every event arrives in the **CloudEvents v1.0** format, over HTTP (binary content mode, `ce-` headers).
- Transport under the hood: **Pub/Sub push subscription**.

## When to use
- React to GCP platform events (Storage, Audit Logs, etc.) in a unified way.
- Trigger Cloud Run / Functions / Workflows / GKE from changes in Google services.
- Don't use when: you only need custom, high-throughput / low-latency messaging -> **Pub/Sub directly**.

## Key points
- **3 source types (trigger):**
  - **Cloud Audit Logs** — filter by `serviceName` + `methodName` (broadest).
  - **Direct events** — direct events from 130+ providers (e.g., object created in Cloud Storage).
  - **Pub/Sub** — any message published to a topic.
- **Destinations:** Cloud Run, Cloud Run functions, Workflows, services on GKE (Workload Identity).
- Every event-driven 2nd-gen Cloud Function uses Eventarc under the hood.
- Best-effort delivery, **no ordering guarantee**, default 24h retention with exponential backoff.
- **Eventarc vs Pub/Sub directly:**

  | | Eventarc | Pub/Sub directly |
  |---|---|---|
  | Abstraction | High (filters, normalization, native Google sources) | Low (just the message channel) |
  | Sources | Audit Logs, direct events, Pub/Sub | Messages you publish |
  | Format | Standardized CloudEvents | Free-form payload |
  | Use case | React to platform events | Custom messaging, high throughput |
  | Transport | Uses Pub/Sub under the hood | Is Pub/Sub itself |

## Command/CLI (reference)
```bash
# Pub/Sub trigger -> Cloud Run
gcloud eventarc triggers create my-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \
  --event-filters="resource=projects/MY_PROJECT/topics/MY_TOPIC" \
  --service-account=PROJECT_NUMBER-compute@developer.gserviceaccount.com

# Cloud Audit Log trigger
gcloud eventarc triggers create audit-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=storage.googleapis.com" \
  --event-filters="methodName=storage.objects.create" \
  --service-account=SA_EMAIL
```

## Exam traps
- **`--event-filters` are immutable**: got the type wrong -> delete and recreate the trigger.
- **Location**: the trigger must be in the **same region** as the source (performance + data residency).
- **No ordering guarantee** — handle ordering in your code if it matters.
- The trigger needs a **service account** with permission to invoke the destination.
- Eventarc uses Pub/Sub under the hood, but "Eventarc uses Pub/Sub" != "use Pub/Sub directly" — know the difference in abstraction.
- Each trigger requires **at least one** `--event-filters`.

## Sources
- https://docs.cloud.google.com/eventarc/standard/docs/overview
- https://docs.cloud.google.com/run/docs/triggering/trigger-with-events
- https://cloud.google.com/blog/topics/developers-practitioners/eventarc-unified-eventing-experience-google-cloud
- https://cloud.google.com/blog/topics/developers-practitioners/three-ways-receiving-events-cloud-run
