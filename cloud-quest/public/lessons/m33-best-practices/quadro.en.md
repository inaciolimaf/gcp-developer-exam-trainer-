# 33 — Best Practices (Google Cloud Developer)

## What it is
A set of development, packaging, and security best practices that the PCD exam covers: how to build lean Docker images, version with Semantic Versioning, apply least privilege with dedicated service accounts, avoid service account keys, and use productivity tools (Cloud Code, Skaffold, Jib, Cloud Emulators).

AWS anchor: equivalent to the Well-Architected Framework (Security and Operational Excellence pillars) + least privilege with per-function IAM roles instead of a wildcard role.

## When to use
- Always. These are quality defaults for any app running on GKE, Cloud Run, Cloud Functions, or App Engine.
- When putting together a Dockerfile / build pipeline (small image, layering, tags).
- When granting code access to resources (Storage, Pub/Sub, etc.).
- When developing locally without provisioning paid resources.

## Key points
- **Small image**: prefer lightweight base images (`alpine`), or `distroless`/`scratch`. Smaller image = smaller downloads, cold starts, and disk usage.
- **Don't copy junk**: no `node_modules`, `target/`, or build artifacts. Only what runs in production.
- **Layering**: each instruction becomes a layer; Docker reuses an unchanged layer. Put what rarely changes at the top. Copy `package.json`/`pom.xml`/`requirements.txt` and run the install BEFORE copying the source code.
- **Semantic Versioning** for tags: `major.minor.patch` (major = breaking, minor = backward-compatible feature, patch = bug fix).
- **Don't use `latest`**: always pin to an explicit version (reproducibility).
- **Dedicated service account** per function/component, with only the roles it needs (least privilege). Don't use the App Engine default SA (permissions are too broad).
- **Avoid service account keys** whenever possible; keep the SA attached to the resource and use the automatic identity.
- **Cloud Function**: default SA = App Engine default (`PROJECT_ID@appspot.gserviceaccount.com`). Create a custom SA; if it reads from Storage, grant the Storage role + write permission to Cloud Logging and Cloud Monitoring.
- **Cloud Code**: integrates build/debug/deploy into the IDE (VS Code, IntelliJ, Cloud Shell Editor). Uses Skaffold (continuous loop on containers) and Jib (optimized Docker image in Java without a Dockerfile).
- **Cloud Emulators**: local dev without connecting to GCP — Bigtable, Datastore, Firestore, Pub/Sub, Spanner. (≈ LocalStack on AWS.)
- **Logging/Monitoring**: write to stdout/stderr → goes to Cloud Logging; metrics → Cloud Monitoring automatically.

## Command/CLI (reference)
```bash
# Create a dedicated service account
gcloud iam service-accounts create minha-func-sa --display-name="SA Cloud Function"

# Grant a minimal role on a specific resource (least privilege)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:minha-func-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Deploy a function using the dedicated SA (no key)
gcloud functions deploy minha-func \
  --service-account=minha-func-sa@PROJECT_ID.iam.gserviceaccount.com

# Tag with Semantic Versioning (never latest)
docker tag minha-imagem REGISTRY/minha-imagem:1.2.0

# Local emulator (e.g., Firestore)
gcloud emulators firestore start
```

## Exam traps
- "Function needs minimal access" → create a **custom service account with least privilege**, do NOT use the App Engine default SA.
- "How to authenticate a workload without exposing a secret" → **attach a service account to the resource and avoid service account keys**; a JSON key is a last resort.
- "Reduce Docker build time" → **copy dependencies before the code** (layer caching), not `COPY . .` up front.
- "Large image / slow cold start" → **lightweight base image (alpine/distroless/scratch)**, remove what's unnecessary.
- "Ensure a stable, reproducible version" → **Semantic Versioning + explicit tag**, NEVER `latest`.
- "Dev/test without provisioning a paid resource" → **Cloud Emulators** (Bigtable, Datastore, Firestore, Pub/Sub, Spanner).
- "Build a Java image without a Dockerfile" → **Jib**. "Continuous dev loop on containers" → **Skaffold**.
- Move lines that rarely change to the **top** of the Dockerfile (not the bottom) to maximize layer reuse.

## Sources
- https://cloud.google.com/blog/products/containers-kubernetes/7-best-practices-for-building-containers
- https://docs.cloud.google.com/iam/docs/best-practices-service-accounts
- https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys
- https://cloud.google.com/blog/products/application-development/least-privilege-for-cloud-functions-using-cloud-iam
