# Datastream (Change Data Capture / CDC)

## What it is
- **Serverless** service for **CDC** (Change Data Capture) and near real-time replication.
- Reads **insert / update / delete** from the source's **transaction log** (binlog, WAL, redo log) → minimal impact on the source.
- Auto-scaling, pay per **GB processed** (no instance to manage).
- AWS equivalent: **AWS DMS** (the CDC part) — but DMS uses a replication instance; Datastream is serverless.

## When to use
- Replicate a transactional database → **BigQuery** for **near real-time analytics** (no batch ETL).
- Write a change stream to **Cloud Storage** for **event-driven** / Dataflow pipelines.
- Continuous data sync between source and destination with low latency.
- Source can be outside GCP: on-prem, VM, **Amazon RDS/Aurora**, or Cloud SQL.

## Key points
- **Sources**: MySQL, PostgreSQL (+ AlloyDB), Oracle, SQL Server.
- **Native destinations**: BigQuery, Cloud Storage (Apache Iceberg also supported).
- Other destinations (Cloud SQL, Spanner) → Cloud Storage + **Dataflow template** ("Datastream to SQL").
- Components: **connection profiles** + **stream** (backfill + CDC) + **connectivity**.
- Connectivity: IP allowlist, SSH tunnel, VPC peering, **Private Service Connect**.
- Data encrypted in transit and at rest.

## Command/CLI (reference)
```
# Source connection profile
gcloud datastream connection-profiles create my-src \
  --location=us-central1 --type=mysql \
  --mysql-hostname=... --mysql-port=3306 --mysql-username=...

# Stream: source -> BigQuery destination
gcloud datastream streams create my-stream \
  --location=us-central1 \
  --source=my-src --destination=my-bq \
  --backfill-all   # initial backfill + continuous CDC
```

## Exam traps
- Datastream **does NOT transform** data. Transformation/enrichment = **Dataflow**.
- **Database migration with minimal downtime** = **Database Migration Service (DMS)**, NOT Datastream.
- Datastream = CDC for **streaming/analytics**; DMS (GCP) = **migration**.
- **Limited schema evolution** (column drop, type change not always supported).
- "near real-time / change stream / serverless" → Datastream.
- The analytics destination on the exam is almost always = **BigQuery**.

## Sources
- https://docs.cloud.google.com/datastream/docs/overview
- https://cloud.google.com/datastream
- https://docs.cloud.google.com/datastream/docs/sources
- https://docs.cloud.google.com/dataflow/docs/guides/templates/provided/datastream-to-sql
