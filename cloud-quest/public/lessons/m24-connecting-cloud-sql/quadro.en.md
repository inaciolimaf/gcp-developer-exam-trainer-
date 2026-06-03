# 24 — Connecting to Cloud SQL

## What it is
A set of secure ways to connect an application to Cloud SQL (MySQL/PostgreSQL/SQL Server). The pillars for the PCD exam:
- **Cloud SQL Auth Proxy** — a connector that runs alongside the client; encrypts via **automatic TLS** (no certificates to manage) and authorizes via **IAM**. Works with both public and private IP. Removes the need for authorized networks and manual SSL.
- **IAM database authentication** — an IAM identity (user/service account) becomes a database user. With `--auto-iam-authn`, the proxy injects an **OAuth 2.0 access token** (1h validity) in place of the password.
- **Private IP (Private Service Access)** vs **Public IP + authorized networks** — private is the recommended option.
- **Serverless VPC Access connector** (or **Direct VPC egress**) — bridge for serverless to reach Cloud SQL over **private IP**.

AWS analogy: RDS IAM authentication + managed SSL, wrapped into a single connector.

## When to use
| Scenario | Solution |
|---|---|
| VM in a VPC -> Cloud SQL over private IP | Private Service Access (private IP) |
| Serverless (Run/Functions/App Engine) -> Cloud SQL over **public** IP | Automatic (built-in proxy), nothing to do |
| Serverless -> Cloud SQL over **private** IP | Serverless VPC Access connector or Direct VPC egress |
| GCE / GKE connecting (public or private) | Cloud SQL Auth Proxy (on GKE, as a **sidecar container**) |
| No proxy or connector | Self-managed **SSL/TLS certificates** (minimum) |
| No password in the code | Proxy + `--auto-iam-authn` |

## Key points
- The proxy guarantees **TLS** + **IAM** without authorized networks and without managing certificates.
- Minimum role to run the proxy: **Cloud SQL Client** (`cloudsql.instances.connect`).
- Automatic IAM auth: the account that **runs the proxy** must be the same one that **logs into the database**.
- Proxy egress: **port 3307** to the instance + **443** to the APIs.
- Serverless with public IP uses the proxy **automatically**; with private IP it requires a VPC connector.
- A Serverless VPC Access connector must be in the **same region** as the service.
- Cloud SQL is **always regional** (no multi-region). HA = primary + standby in different zones of the same region.
- **Read replicas** scale reads, they do **not** increase availability.
- Best practices: connection pooling, **exponential backoff**, short transactions, prefer internal IP.

## Command/CLI (reference)
```bash
# Cloud SQL Auth Proxy v2 (public or private IP)
./cloud-sql-proxy PROJECT:REGION:INSTANCE
./cloud-sql-proxy --private-ip PROJECT:REGION:INSTANCE

# Automatic IAM database authentication (no password)
./cloud-sql-proxy --auto-iam-authn PROJECT:REGION:INSTANCE

# Dedicated service account via key file
./cloud-sql-proxy --credentials-file=key.json PROJECT:REGION:INSTANCE

# Minimum role
gcloud projects add-iam-policy-binding PROJECT \
  --member=serviceAccount:SA_EMAIL --role=roles/cloudsql.client

# Serverless VPC Access connector
gcloud compute networks vpc-access connectors create CONN \
  --region=REGION --network=default --range=10.8.0.0/28

# Cloud Run -> Cloud SQL
gcloud run deploy APP --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
  --vpc-connector=CONN   # --vpc-connector only needed for private IP
```

## Exam traps
- Serverless with **public IP** does NOT need a VPC connector or proxy configuration (it's automatic). The connector is only for **private IP**.
- The correct role for the proxy is **Cloud SQL Client**, not Editor or Admin (those grant too many permissions).
- The proxy does NOT replace network connectivity: for private IP, the private route (VPC/connector) still has to exist.
- The IAM auth token lasts **1 hour**; it's not a static password.
- A read replica is **not** high availability; for HA, enable the HA configuration (standby in another zone).
- Authorized networks only apply to **public IP**; with the proxy or private IP you don't need them.
- A Serverless VPC Access connector must be in the **same region** as the serverless service.

## Sources
- https://docs.cloud.google.com/sql/docs/mysql/sql-proxy
- https://docs.cloud.google.com/sql/docs/mysql/iam-logins
- https://docs.cloud.google.com/sql/docs/mysql/connect-run
- https://docs.cloud.google.com/sql/docs/mysql/private-ip
