# 26 — NoSQL on Google Cloud: Firestore and Bigtable

## What it is

- **Firestore** — **document** NoSQL (collections > documents > fields, flexible JSON). Real-time updates + offline mode. AWS anchor: **DynamoDB** (document store flavor).
  - **Native mode**: new mobile/web apps; real-time + offline + rich client libraries.
  - **Datastore mode**: server backends/APIs; the old Datastore interface on top of Firestore storage.
  - **Datastore (legacy)** = ancestor of Firestore; GQL (SQL-like), no joins/aggregation. Being migrated to Firestore.
- **Bigtable** — **wide-column** NoSQL, scales to **petabytes**, ms latency, millions of ops/s. Compatible with the **HBase API**. AWS anchor: **HBase / Keyspaces** (NOT DynamoDB).

## When to use

| Scenario | Choice |
|---|---|
| User profile, catalog, mobile/web app with real-time/offline | Firestore **Native** |
| New server/API backend (no real-time/offline) | Firestore **Datastore mode** |
| Legacy Datastore migration | Firestore **Datastore mode** |
| IoT, time-series, real-time analytics, financial data, > 1TB | **Bigtable** |
| Dataset < 1TB | **NOT** Bigtable — use Firestore |
| Multi-row transactional app | **NOT** Bigtable (single-row transactions only) |

## Key points

- Firestore: 1 mode per project (once chosen, it's locked). Both modes are **strongly consistent** today.
- Firestore indexes: single-field automatic per field; **composite index** for multi-field; **index exemption** for large fields (text). Indexes cost latency + storage.
- Firestore location: **regional** (cheaper, lower write latency, 99.99%) vs **multi-region** nam5/eur3 (99.999%, higher write latency).
- Firestore transactions: **read-write** and **read-only**; max **500** writes/transaction (batch).
- Soft limits: 1 write/s per document; **500/50/5** rule (start at 500 ops/s, +50% every 5 min).
- Bigtable: only index = **row key**. Not serverless (instance > cluster > nodes). **SSD** default; **HDD** only > 10TB rarely read. Multi-cluster replication increases availability/durability.
- Row key design: from generic to granular (`continent#country#city`); avoid sequential/timestamp at the start (hotspot); use reversed timestamp for recent data.

## Command/CLI (reference)

```bash
# Firestore (gcloud)
gcloud firestore databases create --location=nam5
gcloud firestore export gs://MY_BUCKET/exports
gcloud firestore indexes composite create --collection-group=users \
  --field-config field-path=city,order=ascending \
  --field-config field-path=age,order=descending

# Bigtable — uses 'cbt', NOT gcloud for data
gcloud bigtable instances create my-inst --cluster-config=...   # create instance
cbt createtable my-table
cbt createfamily my-table cf1
cbt set my-table "continent#country#city" cf1:population=12345
cbt read my-table
```

## Exam traps

- **Bigtable < 1TB = wrong.** Bigtable is recommended starting at 1TB; below that, Firestore.
- **gcloud does not manage Bigtable data** — the CLI is **cbt**. Export only via Dataflow, a Java JAR, or HBase commands (not through the console/gcloud).
- **Real-time/offline = Native mode only.** Datastore mode has NO real-time updates and no offline.
- **Native is strongly consistent** — don't mark "Native = eventual" (old myth).
- **Bigtable = single-row transactions** — not suitable for multi-row transactional apps.
- New mobile/web app -> **Native**; Datastore migration -> **Datastore mode**.
- A sequential/timestamp row key at the start creates a **hotspot** — distribute the load.
- HDD on Bigtable only for large volumes rarely read (> 10TB); SSD for the rest.

## Sources

- https://cloud.google.com/firestore/native/docs/firestore-or-datastore
- https://docs.cloud.google.com/bigtable/docs/choosing-ssd-hdd
- https://docs.cloud.google.com/bigtable/docs/overview
- https://cloud.google.com/firestore/docs/best-practices
