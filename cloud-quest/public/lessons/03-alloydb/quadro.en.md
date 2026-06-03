# AlloyDB for PostgreSQL (+ Auth Proxy)

> AWS equivalent: **Amazon Aurora PostgreSQL** (Postgres-compatible, separated compute/storage, writer + readers)

## What it is
- **Fully managed, high-performance** PostgreSQL; Google engine + cloud-native architecture (compute ≠ storage).
- **>4x** faster than self-managed Postgres (OLTP); **up to 100x** in analytics via **columnar engine**.
- **HTAP**: OLTP + OLAP in the same database, analytics over live transactional data.
- Topology: **primary instance** (writes) + **read pool instances** (reads, scale horizontally).
- **99.99% SLA** (includes maintenance); automatic failure recovery in **< 60s**.

## When to use
- **AlloyDB** → you need Postgres, but Cloud SQL can't keep up with performance/scale; heavy or hybrid workloads (OLTP+OLAP); regional.
- **Cloud SQL** → general purpose, cheaper/simpler; MySQL/Postgres/SQL Server; single-region.
- **Spanner** → **global** distribution, strong multi-region consistency, nearly unlimited horizontal scale.
- Rule: fast regional Postgres = AlloyDB | global multi-region = Spanner | general case = Cloud SQL.

## Key points
- **AlloyDB Auth Proxy** ≈ Cloud SQL Auth Proxy: local binary, secure tunnel, app connects on `localhost`.
- Does automatic **mTLS 1.3 / AES-256** + **authorization via IAM identity** (no managing SSL/allowlist).
- Required IAM roles (MEMORIZE):
  - `roles/alloydb.client` (Cloud AlloyDB Client)
  - `roles/serviceusage.serviceUsageConsumer` (Service Usage Consumer)
- Credential discovery (in this order): `--credentials-file` → `--token` → gcloud → VM/pod service account.
- **Automatic IAM database authentication**: proxy/Language Connector manages the access token; the database user is an IAM principal (no password).
- AWS analog of the Auth Proxy: **RDS IAM authentication** (token).

## Command/CLI (reference)
```bash
# Create cluster + primary instance
gcloud alloydb clusters create my-cluster \
  --region=us-central1 --password=PASSWORD --network=default

gcloud alloydb instances create my-primary \
  --cluster=my-cluster --region=us-central1 \
  --instance-type=PRIMARY --cpu-count=2

# Start the Auth Proxy (instance URI)
./alloydb-auth-proxy \
  "projects/PROJ/locations/us-central1/clusters/my-cluster/instances/my-primary"

# With an explicit service account
./alloydb-auth-proxy --credentials-file=key.json "<INSTANCE_URI>"

# App connects as if Postgres were local
psql -h 127.0.0.1 -p 5432 -U postgres
```

## Exam traps
- The Auth Proxy **does not waive** the IAM roles: missing `alloydb.client` OR `serviceusage.serviceUsageConsumer` → auth failure.
- Auth Proxy ≠ public network: it authorizes via **IAM**, not via IP allowlist; encryption is automatic (mTLS).
- "Analytics 100x" comes from the **columnar engine**, not from normal storage — it's the HTAP hook.
- Don't confuse: you need **global multi-region + strong consistency** → that's **Spanner**, not AlloyDB.
- AlloyDB is **regional** (read pools, not global distribution like Spanner).
- In production: prefer a **service account attached** to the resource, avoid a JSON key (`--credentials-file`) on disk.

## Sources
- https://docs.cloud.google.com/alloydb/docs/overview
- https://docs.cloud.google.com/alloydb/docs/auth-proxy/overview
- https://docs.cloud.google.com/alloydb/docs/connect-iam
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
