# 34 — Architecture (10,000-foot view)

## What it is
A high-level view of how Google Cloud services fit together in real architectures. It's the analog of the **AWS Well-Architected** framework: you already know the building blocks, here you assemble the patterns. Five core diagrams from the PCD exam:

1. **Big data batch** — On-prem -> Cloud Storage (landing) -> ETL -> BigQuery -> Looker Studio.
2. **Streaming / real-time** — Pub/Sub -> Dataflow -> Bigtable (time series, low latency) and/or BigQuery (ad-hoc).
3. **IoT** — devices -> Pub/Sub -> same streaming flow.
4. **Serverless full stack** — static front end on Cloud Storage + Cloud CDN; REST back end on Cloud Run / Functions / App Engine; API mgmt in front; Cloud DNS.
5. **Logging** — Cloud Logging -> Log Router (sinks) -> Cloud Storage / Pub/Sub / BigQuery.

**Pub/Sub** = loose coupling in all of them (decouples publisher/subscriber).

## When to use
| Need | GCP service | AWS equivalent |
|---|---|---|
| Decouple producer/consumer | Pub/Sub | SNS + SQS |
| Data warehouse / ad-hoc analytics | BigQuery | Redshift |
| Time series, fast read by key | Bigtable | DynamoDB / Cassandra |
| ETL / pipelines | Dataflow (Dataprep, Dataproc) | Glue / EMR |
| Landing zone / cheap archive | Cloud Storage | S3 |
| Global edge CDN | Cloud CDN | CloudFront |
| Centralized logs | Cloud Logging | CloudWatch Logs |

**API management — which product:**
- **Apigee** — full lifecycle platform, multi-cloud/hybrid, monetization, portal, advanced security. Enterprise/high scale.
- **API Gateway** — simple, managed, for **serverless** back ends (Cloud Run, Functions, App Engine). Serverless default.
- **Cloud Endpoints** — older, requires a container proxy. Today: **gRPC** and local testing / fine-grained control.

## Key points
- BigQuery is at the center of almost every analytics flow; load it via Cloud Storage + ETL.
- Bigtable vs BigQuery: fast by key / time series vs complex analytical SQL.
- Pub/Sub shows up in microservices, IoT, streaming, and log fan-out.
- Cloud CDN serves static content from Cloud Storage with edge caching.
- Cloud Logging routes to 3 classic sinks; each with a distinct purpose.

## Command/CLI (reference)
```bash
# Log sink to BigQuery (long-term SQL analysis)
gcloud logging sinks create logs-to-bq \
  bigquery.googleapis.com/projects/PROJECT/datasets/DS \
  --log-filter='severity>=ERROR'

# Sink to Cloud Storage (cheap archiving / compliance)
gcloud logging sinks create logs-archive \
  storage.googleapis.com/MEU_BUCKET

# Sink to Pub/Sub (real-time / export to Splunk, Datadog)
gcloud logging sinks create logs-to-ps \
  pubsub.googleapis.com/projects/PROJECT/topics/TOPIC

# API Gateway (serverless back end)
gcloud api-gateway gateways create GW --api=API --api-config=CFG --location=us-central1
```

## Exam traps
- **API Gateway** = simple serverless; **Apigee** = enterprise/multi-cloud; **Endpoints** = gRPC / local. Don't mix them up.
- **Bigtable** for time series and low latency; **BigQuery** for ad-hoc analytical queries. Swapping the two is the classic trap.
- Log sink for long/cheap archiving = **Cloud Storage**; for real-time and external export = **Pub/Sub**; for SQL over logs = **BigQuery**.
- Static content doesn't go on Compute/VM: it goes on **Cloud Storage + Cloud CDN**.
- On-prem data doesn't load directly into BigQuery: it goes through **Cloud Storage** first.
- Cloud Endpoints is **not** the modern serverless default (it needs a container proxy) — prefer API Gateway.

## Sources
- https://cloud.google.com/blog/products/application-modernization/choosing-between-apigee-api-gateway-and-cloud-endpoints
- https://cloud.google.com/endpoints/docs/choose-endpoints-option
- https://docs.cloud.google.com/logging/docs/routing/overview
- https://docs.cloud.google.com/logging/docs/export/configure_export_v2
