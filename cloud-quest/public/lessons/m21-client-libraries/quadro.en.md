# 21 — Cloud APIs and Client Libraries

## What it is

- **Cloud API**: nearly every GCP service exposes an API that accepts **JSON REST** and **gRPC**. You can call it directly, but then you carry all the low-level work (HTTP, TLS, OAuth token, retries).
- **Client Libraries**: the recommended way to call Cloud APIs from your code. AWS equivalent: **AWS SDK**.
- Two types (naming trap):
  - **Google API Client Libraries** (old): JSON REST only, auto-generated, **no gRPC**.
  - **Cloud Client Libraries** (new, recommended): idiomatic, REST **and** gRPC, better performance.
- **gRPC**: binary payload (Protobuf) + HTTP/2 → up to ~10x more throughput than JSON REST.

## When to use

| Situation | Use |
|---|---|
| Call a GCP service from your code | Cloud Client Library (if it exists) |
| New library not available for the service | Google API Client Library (legacy) |
| Maximum performance | gRPC under the Cloud Client Library |
| Code outside Google Cloud | Cloud Client Library + SA key via GOOGLE_APPLICATION_CREDENTIALS |
| Code inside GCP (Cloud Run, GKE, GCE…) | SA attached to the resource (no key file) |

## Key points

- **Auth = ADC (Application Default Credentials)** — equivalent to the AWS SDK credential chain. Lookup order:
  1. `GOOGLE_APPLICATION_CREDENTIALS` env var → service account key.
  2. Local gcloud credentials (`gcloud auth application-default login`).
  3. Service account **attached to the resource** (Cloud Run, App Engine, GCE, Cloud Functions, GKE).
  4. Nothing → **error**.
- Production best practice: **attach an SA to the resource**, don't use a key file. SA key only for code outside GCP.
- Cloud API accepts **TLS** only; the library handles this automatically.
- You must **enable** the API in the project before using it.
- **Error handling** (memorize):

| Code | Meaning | Action |
|---|---|---|
| 200 | OK | nothing |
| 400 | invalid argument | fix the request (don't retry) |
| 401 | unauthenticated | valid OAuth token |
| 403 | permission denied | add IAM role/permission |
| 404 | resource doesn't exist | nothing to do |
| 429 | resource exhausted / rate limit | **retry with exponential backoff** |
| 500 | internal server error | **retry with exponential backoff** |
| 503 | service unavailable | **retry with backoff** (start at ~1s) |

- **Exponential backoff + jitter**: double the delay on each failure and add a **random** value (jitter) so clients don't synchronize. Retry only 408/429/5xx.
- **Cloud Storage rate**: new bucket ~**1000 writes/s** and ~**5000 reads/s**; don't double the rate in less than **20 min**.
- Consumption best practices: **pagination** (large lists), **batching** (several ops in one request), **partial response / field mask** (only the fields you need).
- Cloud Console has an **API dashboard**: traffic, error rates, latency (mean and p95).

## Command/CLI (reference)

```bash
# Install Cloud Client Library
pip install --upgrade google-cloud-storage          # Python
npm install --save @google-cloud/storage            # Node.js
# Java: com.google.cloud:google-cloud-storage dependency in pom.xml / Gradle

# ADC: point to a service account key (code outside GCP)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa-key.json"

# Enable the API before using it
gcloud services enable storage.googleapis.com

# Local ADC login (dev)
gcloud auth application-default login
```

## Exam traps

- **Cloud Client Libraries (new) vs Google API Client Libraries (old)** — only the new ones have **gRPC**; the new ones are recommended.
- **ADC looks for `GOOGLE_APPLICATION_CREDENTIALS` FIRST**, then the resource's SA. Don't reverse the order.
- Inside GCP, **don't use an SA key file** — attach the SA to the resource (best practice).
- **429 and 5xx → retry with backoff**. **4xx (400/401/403/404) → DON'T retry**, fix the request.
- Backoff without **jitter** is an incomplete answer — jitter avoids thundering herd.
- New Cloud Storage bucket: **1000 writes/s, 5000 reads/s**; ramp up **at most double every 20 min**.
- **TLS is automatic** with client libraries — another reason not to call the raw API.
- **partial response = field mask**: request only the fields you need (saves bandwidth), not the same as pagination.

## Sources

- https://docs.cloud.google.com/apis/docs/client-libraries-explained
- https://docs.cloud.google.com/docs/authentication/client-libraries
- https://docs.cloud.google.com/storage/docs/request-rate
- https://docs.cloud.google.com/storage/docs/retry-strategy
