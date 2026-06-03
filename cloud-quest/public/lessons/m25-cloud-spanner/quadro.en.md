# 25 — Cloud Spanner

## What it is
- **Relational, globally distributed**, fully managed database for mission-critical workloads.
- Real SQL: schema, joins, **ACID** transactions — **and** global strong consistency at the same time.
- **Strong consistency** via **TrueTime** (distributed clock) → **external consistency** (the strongest level).
- **Horizontal scaling** for **reads AND writes**; data lives in **splits** (ordered by primary key), replicated across zones/regions, automatically rebalanced → up to petabytes.
- SLA **99.999%** multi-region / 99.99% regional (vs. Cloud SQL 99.95%).
- AWS anchor: ≈ **Aurora DSQL / Aurora Global** (global relational). Similar to the *pitch* of **DynamoDB global tables**, but DynamoDB is **NoSQL + eventual consistency**; Spanner is **relational + strong consistency**.

## When to use
- You need the **3 things together**: horizontal scaling + global reach + strong consistency. (E.g.: finance, global gaming, supply chain.)
- **Cloud SQL** → regional relational, the default, cheaper (write scaling only on the primary).
- **AlloyDB** → Postgres with very high performance, but still regional.
- **Spanner** → high cost (you pay per **nodes** + **storage**); don't pick it just because it's impressive.

## Key points
- Multi-region: faster reads, **small increase in write latency** (commits across multiple regions).
- **Interleaved tables**: parent + child (e.g.: user + to-dos) on the **same node** → better joint-read performance.
- **Primary key design**: avoid **monotonically increasing** values (e.g.: timestamp) at the start of the key → hotspot. The timestamp goes in the **2nd** part of the key.
- 3 transaction modes: **read-write (locking)** = ACID writes; **read-only** = consistent reads without locks; **partitioned DML** = bulk updates without locking the entire table.
- Best practices: compute in the **same region** as Spanner; keep **CPU < 65%** (otherwise add nodes); **batch DML**; **stale reads** if you tolerate slightly outdated data and are latency-sensitive.

## Command/CLI (reference)
- `gcloud spanner instances create` — create instance (regional/multi-region config, number of nodes).
- `gcloud spanner databases create` — create database.
- `gcloud spanner databases ddl update` — apply schema/DDL.
- **Export**: there is NO export via `gcloud` → use **Cloud Console** or **Dataflow**.

## Exam traps
- "Relational + global + strong consistency" → **Spanner** (not Cloud SQL, not DynamoDB).
- "TrueTime" / "external consistency" → **Spanner**.
- Scale **writes** horizontally → **Spanner** (Cloud SQL only scales reads via read replicas).
- **Exporting Spanner**: only **Console** or **Dataflow**, **not** `gcloud`.
- Primary key with timestamp at the start = **hotspot** (wrong). Timestamp in the 2nd part.
- Spanner is **expensive** — pick it only when you need global + strong + scale.

## Sources
- https://docs.cloud.google.com/spanner/docs/true-time-external-consistency
- https://docs.cloud.google.com/spanner/docs/instance-configurations
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
