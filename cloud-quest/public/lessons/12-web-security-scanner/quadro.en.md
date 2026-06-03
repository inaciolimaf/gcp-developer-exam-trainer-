# Web Security Scanner (Security Command Center)

> AWS equivalent: Amazon Inspector (web app layer / DAST)

## What it is
- Managed vulnerability scanner for **web applications** (DAST) inside **Security Command Center**.
- **Crawls** from the *starting URLs*, exercises inputs and event handlers, and reports findings.
- Detects (aligned with the OWASP Top Ten): **XSS**, **mixed content** (HTTP on an HTTPS page), **outdated/insecure libraries**, **clear text password**, **Flash injection**, SQL injection.
- Findings show up automatically on the SCC **Vulnerabilities** page.

## When to use
- Validate the security of public web apps on **App Engine** (standard + flexible), **Compute Engine**, and **GKE**.
- Basic automatic coverage across the organization → **managed scans**.
- Deep per-project analysis → **custom scans**.
- Requirement: **public** URL/IP, **IPv4**, not behind a firewall.

## Key points
- **Managed scans**: managed by SCC (Premium/Enterprise), **weekly**, **no auth**, **GET only** (do not submit forms).
- **Custom scans**: you configure them (all tiers), schedule (daily/weekly/biweekly/4-weeks), auth (Google Account, IAP, custom), granular findings.
- Authentication **does not support 2FA**.
- **max QPS** controls intensity (requests per second).
- SCC = central dashboard; Web Security Scanner = detection source.

## Command/CLI (reference)
```bash
# Create a custom scan config
gcloud alpha web-security-scanner scan-configs create \
  --display-name="my-scan" \
  --starting-urls="https://PROJECT_ID.appspot.com" \
  --max-qps=15

# List configs and trigger a scan run
gcloud alpha web-security-scanner scan-configs list
gcloud alpha web-security-scanner scan-runs start SCAN_CONFIG_ID
```
- Starting URLs must be "owned" by the project (reserved IP or the default App Engine domain).

## Exam traps
- **Do NOT run a custom scan on production without care**: it exercises real inputs → it may post test comments, generate mass emails, create data. Use **staging + a test account** with no sensitive data.
- Managed = **GET only / no auth / weekly**; custom = can submit forms and authenticate.
- Managed scans only on **Premium/Enterprise**; custom on all tiers.
- Targets = **App Engine, Compute Engine, GKE** (not for apps outside GCP nor without a public URL).
- "Which service detects XSS / outdated libraries in web apps?" → **Web Security Scanner** (not Cloud Armor, not the image/Artifact Registry Security Scanner).
- Don't confuse it with **Container/Artifact Analysis** (image vulnerabilities) — Web Security Scanner runs against the live web app at runtime.

## Sources
- https://docs.cloud.google.com/security-command-center/docs/concepts-web-security-scanner-overview
- https://docs.cloud.google.com/security-command-center/docs/how-to-web-security-scanner-custom-scans
- https://docs.cloud.google.com/sdk/gcloud/reference/alpha/web-security-scanner/scan-configs/create
- https://cloud.google.com/blog/products/identity-security/web-application-vulnerability-scans-for-gke-and-compute-engine-are-generally-available
