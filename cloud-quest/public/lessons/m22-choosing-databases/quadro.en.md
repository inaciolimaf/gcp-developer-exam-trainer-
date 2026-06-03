# 22 — Choosing Databases on Google Cloud

## What it is

Decision of which managed database to use per use case. Axes:

- **Relational vs NoSQL** — fixed schema + strong transactions vs flexible schema + horizontal scale.
- **OLTP vs OLAP** — operational transactions (many small writes) vs heavy analytical queries.
- **Latency / volume** — ms vs µs; TB vs PB vs EB; expected TPS.

Services and AWS equivalents:

| Use case | Google Cloud | AWS |
|---|---|---|
| Relational OLTP, regional, ~TB | **Cloud SQL** (MySQL/PostgreSQL/SQL Server) | RDS |
| Relational OLTP, global, millions of TPS | **Spanner** | Aurora (extreme) |
| OLAP / data warehouse, PB | **BigQuery** (columnar, serverless) | Redshift |
| NoSQL document, web/mobile app, ~TB | **Firestore** (formerly Datastore) | DynamoDB |
| NoSQL wide-column, IoT/time-series, PB | **Bigtable** | DynamoDB / Keyspaces |
| In-memory cache, µs | **Memorystore** (Redis/Valkey/Memcached) | ElastiCache |

## When to use

- **Cloud SQL** — standard relational, single region, thousands of TPS, data in terabytes.
- **Spanner** — "global" + "transactional" + "millions of TPS" + horizontal scale on writes; 99.999% multi-region SLA.
- **BigQuery** — analytics, data warehouse, big data, "petabyte-scale analysis".
- **Firestore** — serverless transactional document store, web/mobile apps, evolving schema, small/medium data.
- **Bigtable** — huge volumes (10 TB to PB), low latency, high throughput, IoT, streaming, time-series, operational analytics. Not transactional, not serverless.
- **Memorystore** — microsecond response; cache in front of any database.

## Key points

- Spanner is the only relational database with global horizontal scale and a 5-nines SLA (multi-region).
- BigQuery uses columnar storage → fast at aggregations; it is OLAP, not OLTP.
- Firestore = serverless. Bigtable = provisions nodes (NOT serverless).
- Firestore has two modes: Native (new apps, web/mobile, real-time) and Datastore (apps that depend on the Datastore API).
- Bigtable is NOT suited for transactional workloads.
- Memorystore does not persist as a primary database; it is a caching layer.

## Command/CLI (reference)

```bash
# Cloud SQL
gcloud sql instances create my-pg --database-version=POSTGRES_15 --tier=db-custom-2-7680 --region=us-central1

# Spanner
gcloud spanner instances create my-inst --config=regional-us-central1 --nodes=1 --description="demo"

# Firestore (Native mode)
gcloud firestore databases create --location=nam5 --type=firestore-native

# Bigtable (provisions nodes — not serverless)
gcloud bigtable instances create my-bt --cluster-config=id=c1,zone=us-central1-b,nodes=3 --display-name=demo

# Memorystore for Redis
gcloud redis instances create my-cache --size=1 --region=us-central1

# BigQuery (serverless — creates dataset)
bq mk --dataset my_project:analytics
```

## Exam traps

- "Global" + "transactional" + "millions of TPS" → **Spanner**, never Cloud SQL.
- Single region + thousands of TPS relational → **Cloud SQL**, not Spanner (cost).
- Petabytes of analysis / data warehouse → **BigQuery**, not Bigtable.
- IoT, time-series, huge streams → **Bigtable**, not Firestore.
- Bigtable is **not** serverless and is **not** for transactions.
- Rapidly evolving schema, web/mobile app → **Firestore**.
- Need microseconds / speed up reads → **Memorystore** (cache), not swapping the database.
- Managed MySQL/PostgreSQL/SQL Server → **Cloud SQL** (Spanner does not speak those engines directly).

## Sources

- https://cloud.google.com/spanner/sla
- https://cloud.google.com/firestore/native/docs/firestore-or-datastore
- https://cloud.google.com/memorystore
- https://cloud.google.com/bigtable/docs/overview
