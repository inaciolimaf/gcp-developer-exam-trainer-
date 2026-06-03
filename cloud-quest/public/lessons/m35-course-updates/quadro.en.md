# 35 — Exam Guide Updates (Eventarc, Observability, Identity Platform)

## What it is

Topics that entered the **Professional Cloud Developer** exam guide starting **October/2022**:

- **Eventarc** — the event-driven architecture backbone in Google Cloud. Connects **event providers** to **event destinations**, following the **CloudEvents** spec (CNCF). AWS ≈ **EventBridge**.
- **CloudEvents** — standard spec (CNCF) to describe events across clouds and languages.
- **OpenTelemetry (OTel)** — open standard (CNCF) for the 3 pillars of observability: logs, metrics, traces. AWS ≈ **ADOT**.
- **Service Directory** — managed service discovery (DNS/HTTP/gRPC). AWS ≈ **Cloud Map**.
- **Identity Platform** — CIAM, end-user authentication for apps. AWS ≈ **Cognito**.

## When to use

- **Eventarc**: decouple microservices via events; react to state changes (object in Storage, message in Pub/Sub, audited action).
- **OpenTelemetry**: instrument the app once and export telemetry to any cloud without rewriting.
- **Service Directory**: don't hardcode a service URL; central discovery with workloads in GCP, on-prem, or another cloud.
- **Identity Platform**: login/signup, MFA, social login, SAML/OIDC for the **end users** of your web/mobile app.
- **Cloud IAM (not Identity Platform)**: employee/partner or service account accessing **Google Cloud resources**.

## Key points

- Eventarc has **2 concepts**: event **provider** (source) and event **destination** (processor).
- Supported **destinations**: **Cloud Run, Cloud Run functions, GKE, Workflows** (+ internal HTTP endpoint in a VPC).
- **Providers**: 150+ Google services. **Direct** delivery (from the service itself) or **indirect via Cloud Audit Logs**.
- Eventarc uses **Pub/Sub as transport** under the hood and adheres to **CloudEvents v1.0**.
- If an event exists via both paths, **prefer the direct one** (faster than audit log).
- Observability = **logs + metrics + traces**; OTel standardizes collection across clouds/languages.
- **Identity Platform** = upgrade of **Firebase Authentication legacy**; integrates with **Identity-Aware Proxy (IAP)**.

## Command/CLI (reference)

```bash
# DIRECT Eventarc trigger: object finalized in Cloud Storage -> Cloud Run
gcloud eventarc triggers create my-bucket-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=my-bucket" \
  --service-account=SA@PROJ.iam.gserviceaccount.com

# INDIRECT trigger via Cloud Audit Logs (e.g., GCE instance deleted)
gcloud eventarc triggers create gce-delete-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=compute.googleapis.com" \
  --event-filters="methodName=v1.compute.instances.delete" \
  --service-account=SA@PROJ.iam.gserviceaccount.com

gcloud eventarc triggers list --location=us-central1
```

## Exam traps

- **The indirect path requires Cloud Audit Logs to be ENABLED.** No audit logs, no trigger via audit.
- An event from a service that only exists via audit log (e.g., `compute.instances.delete`) → the answer involves **Cloud Audit Logs**, not a direct event.
- An Eventarc **destination does NOT include** Compute Engine VM or App Engine — only Cloud Run / Cloud Run functions / GKE / Workflows.
- **Identity Platform ≠ Cloud IAM**: app end user = Identity Platform; employee/SA accessing a GCP resource = IAM.
- Eventarc uses **Pub/Sub under the hood** — if the question asks about the transport, it's Pub/Sub.
- **CloudEvents** is the spec; **Eventarc** is the service that implements it. Don't swap the names.
- OTel is **vendor-neutral / CNCF** — it is not Google-proprietary.

## Sources

- https://cloud.google.com/eventarc/standard/docs/overview
- https://docs.cloud.google.com/eventarc/standard/docs/event-providers-targets
- https://cloud.google.com/learn/certification/cloud-developer/
- https://services.google.com/fh/files/misc/professional_cloud_developer_exam_guide_english.pdf
