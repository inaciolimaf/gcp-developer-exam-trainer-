# 18 — Cloud Build (CI/CD)

## What it is
Google Cloud's serverless CI/CD service. Runs build, test, and deploy pipelines from a configuration file.

- AWS equivalent: **CodeBuild** (running the steps) + much of **CodePipeline** (orchestrating build → test → deploy).
- Pipeline = **trigger** + **cloudbuild.yaml** (workflow).
- Default file name: `cloudbuild.yaml` (or `.json`) at the repo root. You can use a custom name in the trigger, inline YAML, or just a `Dockerfile`.
- **Each step runs in a separate Docker container** (it's not a single environment like CodeBuild).
- Source is mounted at `/workspace`, shared across all steps.

## When to use
- Native CI/CD on GCP: on every push/PR, build image → push to Artifact Registry → deploy to Cloud Run / GKE.
- Building an image from a Dockerfile without managing runners.
- Static analysis / quality gate (e.g., Sonar) inside the CI.
- Scheduled builds (manual trigger + Cloud Scheduler) or triggered by Pub/Sub.
- **Don't** use it alone for advanced multi-cloud deploys (blue-green, canary) → prefer **Spinnaker**.

## Key points
- **Trigger**: manual, push to branch, pull request, Pub/Sub, webhook.
- **Repos**: Cloud Source Repositories, GitHub, Bitbucket.
- **Builders**: official (docker, gcloud, kubectl, git, mvn, npm, go, gsutil...), community, and custom.
  - A community/custom builder must be **published in the project's registry** before use.
- **Step order**: serial by default. Control it with `id` + `waitFor`.
  - `waitFor: ['-']` → starts immediately; several like this run in **parallel**.
- **Sharing files**: the `/workspace` folder or Docker volumes.
- **Substitutions**: built-in (`$PROJECT_ID`, `$BUILD_ID`, `$COMMIT_SHA`, `$BRANCH_NAME`, `$REPO_NAME`, `$TAG_NAME`) and custom.
  - **A custom substitution MUST start with an underscore** (`_MY_VAR`).
- **Service account**: the build runs under an SA — it needs roles to deploy (Cloud Run / GKE).
- **Performance**: default machine `e2-standard-2`; `cache-from`, Kaniko cache, `.gcloudignore`, high-CPU.

```yaml
steps:
  # Step 1 — build the image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA', '.']
    id: 'build'
  # Step 2 — push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA']
    waitFor: ['build']
  # Step 3 — deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: ['run', 'deploy', 'app', '--image',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA',
           '--region', '${_REGION}']

substitutions:
  _REGION: 'us-central1'      # custom → underscore required

images:                        # automatic push at the end
  - '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA'

options:
  machineType: 'E2_HIGHCPU_8'
```

## Command/CLI (reference)
```bash
# Build from cloudbuild.yaml (at the repo root)
gcloud builds submit --config=cloudbuild.yaml .

# Build directly from a Dockerfile and push (no yaml)
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/IMG:TAG .

# Pass substitutions on the command line
gcloud builds submit --substitutions=_REGION=us-central1 .

# Trigger on push to a branch (Cloud Source Repository)
gcloud builds triggers create cloud-source-repositories \
  --repo=my-repo --branch-pattern='^main$' --build-config=cloudbuild.yaml

# List builds and view logs
gcloud builds list
gcloud builds log BUILD_ID
```

## Exam traps
- **Each step = a separate container.** File persistence only via `/workspace` or Docker volumes.
- **Custom substitution without a leading `_` → build fails.** Built-ins do NOT have an underscore.
- **A community/custom builder not published in the project's registry → the build can't find the image.**
- **`waitFor: ['-']`** = starts right away; **no `waitFor`** = waits for all previous steps. Don't mix them up.
- The default file name is exactly `cloudbuild.yaml` at the root.
- The `images` field pushes images to **Artifact Registry** at the end (if the image isn't produced, the build fails).
- Deploy failing due to permissions → adjust the **service account roles** of Cloud Build.
- Blue-green / canary multi-cloud deploy → **Spinnaker**, not plain Cloud Build.
- Speed up the build → `cache-from`, Kaniko cache, `.gcloudignore`, high-CPU machine (default is `e2-standard-2`).

## Sources
- https://docs.cloud.google.com/build/docs/build-config-file-schema
- https://cloud.google.com/build/docs/configuring-builds/configure-build-step-order
- https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values
- https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration
