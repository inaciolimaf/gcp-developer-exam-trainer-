# 29 — Security on Google Cloud (PCD)

## What it is
Security layers applied on top of IAM (defense in depth). Key services of this module for the PCD:

- **Secret Manager** — stores secrets (passwords, API keys, certs) outside of code; access via API. AWS equivalent: Secrets Manager.
- **Binary Authorization** — deploy control by policy: only signed/attested images get deployed.
- **Container Scanning API** — scans images in Artifact/Container Registry looking for CVEs.
- **Web Security Scanner** — DAST: tests the running web app (XSS, mixed content, outdated JS libs). Part of Security Command Center. AWS analog: Inspector.
- **VPC Service Controls** — service perimeter against data exfiltration, independent of IAM.

## When to use
| Need | Service |
|---|---|
| Keep a password / API key / cert outside of code | Secret Manager |
| Ensure only a trusted/signed container is deployed | Binary Authorization |
| Find a CVE in a container image | Container Scanning API |
| Test a live web app (XSS, mixed content) | Web Security Scanner |
| Prevent copying/exfiltrating data even with IAM access | VPC Service Controls |
| DDoS / OWASP Top 10 at the load balancer | Cloud Armor |
| Central security posture dashboard | Security Command Center |

## Key points
- **Secret Manager**: secrets have **versions** (request a fixed version or `latest`); **rotation** via rotation schedule: at the scheduled time it fires a `SECRET_ROTATE` message on Pub/Sub and a Cloud Function generates/adds the new version; read role `roles/secretmanager.secretAccessor` on the service account, on the specific secret (least privilege); encrypted by default, optional CMEK via Cloud KMS.
- **Binary Authorization**: runs on **GKE, Cloud Run, Cloud Service Mesh, Google Distributed Cloud**; policy evaluated before deploy; **attestors** sign that the image passed a step (e.g., a scan); blocks are recorded in Cloud Audit Logs.
- **Web Security Scanner**: App Engine, Compute Engine, GKE; detects XSS, Flash injection, mixed content (HTTP within HTTPS), outdated libs.
- **VPC Service Controls**: protects BigQuery, Cloud Storage and others; **independent of IAM**; combined with IAM = defense in depth.

## Command/CLI (reference)
```bash
# Secret Manager — create secret and add versions
gcloud secrets create db-password --replication-policy="automatic"
echo -n "s3nh4" | gcloud secrets versions add db-password --data-file=-

# Grant access (least privilege: on the secret, to the app's SA)
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:app@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Read value (specific version or 'latest')
gcloud secrets versions access latest --secret="db-password"

# Container Scanning — trigger a scan and list vulnerabilities
gcloud artifacts docker images scan IMAGE_URL
gcloud artifacts docker images list-vulnerabilities SCAN_ID

# Accessing a secret in code (Python) — concept; detail goes here on the board
# client.access_secret_version(name="projects/P/secrets/S/versions/latest")
```

## Exam traps
- **VPC Service Controls ≠ IAM and ≠ firewall.** IAM = who has access; VPC SC = prevents **exfiltration** even by those who have access. If the question says "user has access via IAM but cannot copy the data out", it's VPC Service Controls.
- **Binary Authorization** = only **signed/attested** images get deployed (deploy control). Don't confuse it with Container Scanning, which only **finds** vulnerabilities. The scan feeds the attestor.
- **Web Security Scanner** is **DAST** (running app), it does not scan a container image. Image = Container Scanning API.
- **Secret Manager**: you don't edit a secret, you **add a version**. Requesting `latest` always gets the newest one.
- The read role is `secretmanager.secretAccessor` — grant it on the **secret**, not on the project.
- **Cloud Armor** acts at the **load balancer** (DDoS/OWASP), it does not protect data at rest.

## Sources
- https://docs.cloud.google.com/secret-manager/docs/overview
- https://docs.cloud.google.com/binary-authorization/docs/overview
- https://docs.cloud.google.com/vpc-service-controls/docs/overview
- https://docs.cloud.google.com/security-command-center/docs/concepts-web-security-scanner-overview
