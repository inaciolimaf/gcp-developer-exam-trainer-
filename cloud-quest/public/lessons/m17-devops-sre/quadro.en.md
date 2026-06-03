# 17 — DevOps & SRE (Cloud Build, Artifact Registry)

## What it is

**DevOps**: automate everything between the commit and production to get fast feedback.
- **CI** (Continuous Integration): on every commit, run tests + package (JAR/WAR/Docker image).
- **Continuous Delivery**: beyond CI, keeps the build always ready for production, but the final deploy goes through a **manual approval gate**.
- **Continuous Deployment**: goes further — automatic deploy all the way to **production**, with no manual approval.

**Cloud Build**: managed CI/CD service. Takes the source code and produces artifacts. Configured in `cloudbuild.yaml` (a list of `steps`, each step = a container). ≈ AWS **CodeBuild + CodePipeline**.

**Artifact Registry**: artifact repository (Docker, Maven, npm, Python, Go, Apt, RPM, Helm). URL `*.pkg.dev`. Successor to **Container Registry** (`gcr.io`, deprecated). ≈ AWS **ECR + CodeArtifact**.

**SRE** = Google's "DevOps++". A single team handles availability, latency, monitoring, capacity planning, governed by SLOs.

## When to use

- **Cloud Build** → managed CI/CD pipeline native to GCP (open-source alternative: Jenkins; multi-cloud deploy: Spinnaker).
- **Artifact Registry** → store Docker images and private packages. **Always prefer Artifact Registry** (Container Registry is deprecated/shutting down).
- **Container Registry** (`gcr.io`) → legacy; images only; uses GCS buckets; only shows up for contrast.
- **SLI/SLO/SLA** → define and measure reliability; the **error budget** controls release pace.

## Key points

- `cloudbuild.yaml`: `steps` run in sequence, each in an isolated builder container.
- **Triggers**: fire an automatic build on push to a branch/tag (connect git to the pipeline).
- **Substitutions**: variables resolved at build-time.
  - Built-in: `$PROJECT_ID`, `$BUILD_ID`, `$COMMIT_SHA`, `$BRANCH_NAME`, `$TAG_NAME`.
  - User-defined: start with `_` (e.g., `_REGION`).
- **Artifact Registry**: separate repositories, regional or multi-region, automatic encryption (Google-managed or CMEK). Roles: **reader / writer / admin** + per-repository permissions.
- **Artifact Analysis**: automatic vulnerability scanning on push (OS **and** language packages), with continuous CVE updates.
- **SLI** = raw measure (availability, latency, throughput, durability). **SLO** = SLI + target (internal). **SLA** = external contract with a penalty.
- **Rule**: SLO stricter than SLA.
- **Error budget** = 1 − SLO. Have budget → fast releases; blown → slow down.
- **Toil** = repetitive manual work → minimize/automate.
- SRE practices: load shedding, circuit breaker (avoids cascading failures), chaos/resilience testing (Simian Army), load testing, DRT.

## Command/CLI (reference)

```bash
# Submit a build (uses the directory's cloudbuild.yaml)
gcloud builds submit --config cloudbuild.yaml .

# Pass a custom substitution
gcloud builds submit --substitutions=_REGION=us-central1 .

# Create a Docker repository in Artifact Registry
gcloud artifacts repositories create meu-repo \
  --repository-format=docker --location=us-central1

# Push an image (pkg.dev URL)
docker push us-central1-docker.pkg.dev/PROJECT_ID/meu-repo/app:tag

# List scanned vulnerabilities
gcloud artifacts docker images list --show-occurrences
```

## Exam traps

- **`gcr.io` = Container Registry (legacy/deprecated); `pkg.dev` = Artifact Registry (recommended).**
- Container Registry: **images only** + uses **GCS buckets** (permissions via the bucket's IAM). Artifact Registry: **multiple formats** + its own repositories + its own roles.
- Scanning in Container Registry only catches **OS packages**; Artifact Analysis (Artifact Registry) catches **OS + language**.
- **SLA is external (with a penalty); SLO is internal.** SLI is just the measure, no target.
- **Error budget comes from the SLO, not the SLA.**
- **Continuous Deployment** = automatic all the way to production (no gate); **Continuous Delivery** = ready for production, but with manual approval before the final deploy. Don't swap them.
- User substitutions **start with `_`**; built-in ones don't.
- **Cloud Source Repositories** = GCP's managed private git (≈ CodeCommit); **Spinnaker** = multi-cloud delivery; **Jenkins** = open-source CI.

## Sources

- Cloud Build — build config schema: https://docs.cloud.google.com/build/docs/build-config-file-schema
- Cloud Build — substitutions: https://docs.cloud.google.com/build/docs/configuring-builds/substitute-variable-values
- Artifact Registry — Artifact Analysis and scanning: https://docs.cloud.google.com/artifact-registry/docs/analysis
- Container Registry to Artifact Registry transition: https://docs.cloud.google.com/artifact-registry/docs/transition/setup-gcr-repo
