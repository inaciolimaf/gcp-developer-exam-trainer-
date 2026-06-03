# 11 — Cloud Functions and Cloud Run

## What it is

- **Cloud Functions** = FaaS (Function as a Service). Equivalent to **AWS Lambda**.
  - Model: **event** (something happened) → **trigger** (the rule) → **function** (your code).
  - **gen1**: 1 request/instance, max timeout 9 min, few triggers.
  - **gen2**: built on top of **Cloud Run + Eventarc**. Concurrency up to 1000, HTTP timeout up to 60 min, 90+ event sources.
- **Cloud Run** = fully managed serverless container. Equivalent to **AWS Fargate / App Runner**.
  - "From container to production in seconds." Runs on the open **Knative** standard.
  - Zero infra/cluster management. Any language/binary/dependency (it's a container).
  - Terminology: **service** → contains multiple **revisions** (each deploy = new revision; enables traffic split / canary / rollback).

## When to use

| Scenario | Choice |
|---|---|
| Small piece of code triggered by an event (Storage, Pub/Sub, HTTP) | Cloud Functions |
| Needs a container, custom runtime/binary | Cloud Run |
| High concurrency (multiple requests per instance) | Cloud Run / Functions gen2 |
| Long timeout (up to 60 min HTTP) | gen2 / Cloud Run |
| Full web service/API, microservice | Cloud Run |
| Port a container between Cloud Run, GKE, App Engine | Cloud Run |

## Key points

- **Functions triggers**: HTTP, Cloud Storage, Pub/Sub, Firestore/Firebase, Cloud Audit Logs (gen2 via **Eventarc**).
- **Scale-to-zero**: default. No traffic → 0 instances → 0 request cost.
- **Cold start**: spinning up a new instance adds latency. Mitigate with **min-instances > 0** (warm instances).
- **min-instances**: floor (default 0). **max-instances**: ceiling (default ~100), protects backends.
- **Concurrency (Cloud Run)**: multiple requests per instance. **Default 80**, max **1000**. (Lambda = 1 per instance.)
- **CPU allocation**: "CPU during request" (pay per invocation, scale-to-zero) vs "CPU always allocated" (instance always up).
- **Cloud Run billing**: by CPU, memory, requests, and network used.
- The service name + region are **immutable** after creation.

## Command/CLI (reference)

```bash
# Cloud Functions gen2 - HTTP
gcloud functions deploy minha-func \
  --gen2 --runtime=python312 --trigger-http \
  --entry-point=handler --region=us-central1 --allow-unauthenticated

# Cloud Functions gen2 - Pub/Sub trigger
gcloud functions deploy minha-func \
  --gen2 --trigger-topic=meu-topico --runtime=nodejs20

# Cloud Run - deploy an image with scaling tuning
gcloud run deploy meu-service \
  --image=gcr.io/PROJ/app --region=us-central1 \
  --concurrency=80 --min-instances=1 --max-instances=10 \
  --allow-unauthenticated

# Cloud Run - deploy directly from source (automatic build)
gcloud run deploy meu-service --source=.

# Traffic split between revisions
gcloud run services update-traffic meu-service \
  --to-revisions=meu-service-00002=20,meu-service-00001=80
```

## Exam traps

- **gen2 is Cloud Run underneath** — inherits concurrency up to 1000, 60 min timeout, Eventarc. gen1 does NOT.
- **gen1 = 1 request per instance**; only gen2/Cloud Run have multi-request concurrency.
- **Timeout**: gen1 max 9 min; gen2 HTTP up to **60 min**, but event-driven gen2 is still **9 min**.
- **Cold start** comes from scale-to-zero → solve it with **min-instances**, not max-instances.
- **max-instances** limits the ceiling (protects DB/backend), it does not prevent cold start.
- "CPU always allocated" is what enables **background work** outside the request cycle.
- High concurrency → fewer instances for the same traffic → lower cost. CPU-bound → lower the concurrency.
- Did the question mention **container** or **concurrency**? Think **Cloud Run**.
- The service name and region are **immutable**.

## Sources

- https://docs.cloud.google.com/functions/docs/concepts/version-comparison
- https://docs.cloud.google.com/run/docs/about-instance-autoscaling
- https://cloud.google.com/run/docs/about-concurrency
- https://cloud.google.com/run/docs
