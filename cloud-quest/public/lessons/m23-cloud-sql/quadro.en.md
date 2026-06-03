# 23 — Cloud SQL

## What it is
- GCP's **fully managed relational database**. AWS anchor: **≈ Amazon RDS**.
- Supported engines (only these 3): **MySQL, PostgreSQL, SQL Server**.
- **REGIONAL service** (zone or region) — **there is no global Cloud SQL**.
- Google handles: patching, replication, backups, failover, encryption. You handle tables/queries.
- Storage: SSD (recommended for performance) or HDD; storage **autogrowth**.

## When to use
- **Simple relational** workload on MySQL/PostgreSQL/SQL Server; migrating an **on-premises** database to the cloud; reducing maintenance.
- Rule of thumb (Cloud SQL × AlloyDB × Spanner):
  - **Cloud SQL** = cheap and simple default.
  - **AlloyDB** = you need PostgreSQL with far more performance/analytics and Cloud SQL isn't enough.
  - **Spanner** = "infinite" scale, **global** multi-region database, or **99.999%** availability. (Expensive — only if justified.)
- Triggers for Spanner: hundreds of TB, multi-region, horizontal write scaling, five nines.

## Key points
- **HA (regional)** = primary in one zone + **standby** in another zone, **synchronous replication** → ≈ RDS Multi-AZ.
- **Automatic failover** on zonal failure; the instance is unavailable for **~60s**.
- Failover **does not revert on its own** when the original zone comes back (the old primary becomes the new standby).
- **Standby does NOT serve reads** — passive, only for failover.
- **Read replicas** (asynchronous) to scale reads: same-zone/cross-region/external (including on-prem). They are **separate from the standby**.
- **Automatic backups** (configurable window) + **on-demand**; regional or multi-region retention.
- **PITR (point-in-time recovery)**: restores to a specific moment. **Requires transaction logging**: *binary logging* in MySQL, *write-ahead logging (WAL)* in PostgreSQL.
- HA/read replicas also **require automatic backups + binary logging** (MySQL) / **WAL** (PostgreSQL) enabled.
- **Maintenance**: configurable preferred window; automatic encryption at rest.
- Scaling = **vertical** (bigger machine); ceiling in the tens of TB per instance.

## Command/CLI (reference)
- Connect via Cloud Shell: `gcloud sql connect MY-INSTANCE --user=root`
- Create instance: `gcloud sql instances create NAME --database-version=MYSQL_8_0 --region=us-central1`
- Enable HA: `--availability-type=REGIONAL` flag (zonal = `ZONAL`)
- Create read replica: `gcloud sql instances create REPLICA --master-instance-name=PRIMARY`
- Requires the **Cloud SQL Admin API** enabled.

## Exam traps
- Cloud SQL is **regional, never global** (if the question asks for global → Spanner).
- Engines = **only** MySQL, PostgreSQL, SQL Server (Oracle/Aurora NOT).
- **HA standby ≠ read replica**: standby doesn't serve reads; you can't connect to it while the primary is active.
- **PITR requires transaction logging** (binary logging in MySQL, WAL in PostgreSQL); HA requires automatic backups + that logging.
- Failover **does not return automatically** to the original zone.
- **99.999%** availability → Spanner, not Cloud SQL.
- Horizontal **write** scaling / hundreds of TB → Spanner (Cloud SQL scales vertically).

## Sources
- https://docs.cloud.google.com/sql/docs/mysql/high-availability
- https://docs.cloud.google.com/sql/docs/mysql/backup-recovery/pitr
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
