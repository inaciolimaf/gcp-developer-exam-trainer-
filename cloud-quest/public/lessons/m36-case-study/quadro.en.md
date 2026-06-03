# 36 — Case Study (HipLocal) on the PCD exam

## What it is
- The **Professional Cloud Developer** exam includes ~**5–6 questions** based on a fixed case study: **HipLocal**.
- HipLocal = a *hyper-local* community app (launched in Dallas, wants to go global).
- The case gives context; each question asks you to pick the GCP service/pattern that satisfies an **explicit requirement** in the text.
- AWS analogy: just like the long scenario questions on the Solutions Architect exam.

**HipLocal's current environment**
- Hybrid: on-prem + Google Cloud.
- APIs on **Compute Engine VMs**.
- State in a **single-instance MySQL** on Google Cloud itself.
- Data export to an on-prem data warehouse (Teradata/Vertica); analytics on on-prem Hadoop.
- Pain points: app has **no logging** (only basic uptime); manual deploys (= low confidence in the process).

## When to use
**Requirement → service** map (the golden rule):

| Requirement in the case | GCP service | AWS equivalent |
|---|---|---|
| Less DB management / managed MySQL | **Cloud SQL** | RDS |
| Secure connection to the DB | **Cloud SQL Auth Proxy** (IAM + TLS) | RDS IAM auth |
| Fast session state | **Memorystore** (Redis) | ElastiCache |
| Global scale / NoSQL | **Firestore / Spanner** | DynamoDB global |
| 10x users, VM autoscaling | **Managed Instance Groups** | Auto Scaling Group |
| CI/CD, end manual deploys | **Cloud Build** | CodeBuild + CodePipeline |
| Centralized logs | **Cloud Logging** (agent on the VMs) | CloudWatch Logs |
| Metrics, alerts, uptime, SLO/SLI | **Cloud Monitoring** | CloudWatch |
| User activity metrics | **OpenTelemetry** (formerly OpenCensus) | — |
| Logs/activity analytics | **BigQuery** | Redshift / Athena |
| Expose APIs | **Cloud Endpoints / API Gateway / Apigee** | API Gateway |
| Authenticate users | **Identity-Aware Proxy (IAP)** | — (BeyondCorp) |
| Private on-prem ↔ cloud connection | **Cloud Interconnect** | Direct Connect |

## Key points
- **Master heuristic:** requirement = "less management / global / autoscale" → prefer **managed/serverless**.
- Every answer must anchor to a **requirement cited** in the case. No matching requirement → probably wrong.
- You **can reread the case during the exam**, but read it beforehand; don't rely on that.
- **Time management** is critical: group the case questions and answer them together (fresh context + time saved).
- HipLocal's key requirements: go global, 10x users, GDPR, reduce infra cost, SRE (SLO/SLI), API security.

## Command/CLI (reference)
```bash
# Cloud SQL (replaces the manual MySQL)
gcloud sql instances create hiplocal-db --database-version=MYSQL_8_0 --region=us-central1

# Cloud SQL Auth Proxy (IAM + TLS, no static IP or manual cert)
./cloud-sql-proxy --port 3306 PROJECT:REGION:hiplocal-db

# Managed Instance Group with autoscaling (replaces loose VMs)
gcloud compute instance-groups managed set-autoscaling hiplocal-mig \
  --max-num-replicas=20 --target-cpu-utilization=0.6

# CI/CD (end manual deploys)
gcloud builds submit --tag gcr.io/PROJECT/hiplocal-api
```

## Exam traps
- **State ≠ always Cloud SQL.** Fast session → **Memorystore**; relational → Cloud SQL; global scale → Firestore/Spanner. Read what the state *is*.
- Secure connection to Cloud SQL: the answer is **Cloud SQL Auth Proxy** (IAM/TLS), not "open public IP + firewall".
- **OpenCensus is deprecated** → the current answer is **OpenTelemetry**.
- **IAP** authenticates app *users*; don't confuse it with IAM authorization of services or with API keys.
- On-prem → cloud, private and low-latency = **Cloud Interconnect** (not VPN, when the requirement asks for high bandwidth/low latency).
- "Adopt Google / SRE practices" = **SLO/SLI + alerts in Cloud Monitoring**, not just a basic uptime check.

## Sources
- https://cloud.google.com/certification/guides/cloud-developer/casestudy-hiplocal
- https://services.google.com/fh/files/blogs/master_case_study_hiplocal.pdf
- https://docs.cloud.google.com/sql/docs/mysql/sql-proxy
- https://cloud.google.com/iap/docs/concepts-overview
