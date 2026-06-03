# 06 — gcloud CLI

## What it is
- **gcloud CLI**: command-line tool to manage Google Cloud resources (create, read, update, delete, deploy).
- AWS anchor: **gcloud ≈ `aws` CLI**. Same role, GCP ecosystem.
- Part of the **Google Cloud SDK** (along with gsutil, bq, etc.).

## When to use
- Automation, scripting, CI/CD, and repetitive tasks — faster than the Console.
- When a service **has its own CLI**, use the right one:
  - **Cloud Storage** → `gcloud storage` (recommended) or **gsutil** (legacy).
  - **BigQuery** → **bq**.
  - **Bigtable** → **cbt**.
  - **Kubernetes (GKE)**: **gcloud** creates/manages the cluster; **kubectl** manages pods/deployments inside it.
- **Cloud Shell**: when you want a ready-to-go terminal with nothing to install (studying, quick tasks).

## Key points
- **`gcloud init`** = bootstrap: authorizes the account + creates a **configuration** (account, project, region/zone). First config = `default`.
- **Named configurations** ≈ AWS **named profiles**. Multiple (dev/prod), switchable.
- **Two distinct logins**:
  - `gcloud auth login` → authenticates **the CLI**.
  - `gcloud auth application-default login` → sets up **ADC** for local **code/client libraries**.
  - The gcloud CLI does **not** use ADC.
- Structure: **`gcloud <group> <command> [flags]`** (groups can have subgroups). Reads like a sentence.
- Cloud Shell: gcloud/gsutil/bq/kubectl **pre-installed and authenticated**; **5 GB** persistent home, ephemeral VM.

## Command/CLI (reference)
```bash
# Setup
gcloud init                          # authorize + create configuration
gcloud auth login                    # authenticate the CLI (user)
gcloud auth application-default login # ADC for local code (client libs)

# Configurations (≈ AWS profiles)
gcloud config configurations create dev
gcloud config configurations activate dev
gcloud config configurations list
gcloud config set project MY_PROJECT
gcloud config list

# Components (manage parts of the SDK)
gcloud components list
gcloud components install kubectl
gcloud components update

# group/command structure + global flags
gcloud compute instances list
gcloud compute instances list --project=OTHER_PROJECT
gcloud compute instances list --format=json        # json|yaml|table|value
gcloud compute instances list --filter="zone:us-central1-a"

# Per-service CLIs
gcloud storage ls gs://bucket   # or: gsutil ls gs://bucket
bq query 'SELECT 1'
kubectl get pods                # inside the GKE cluster
```

## Exam traps
- **`gcloud auth login` ≠ `gcloud auth application-default login`**. CLI vs. ADC (code). Classic mistake.
- gcloud does **not** cover everything: Storage (`gcloud storage`/gsutil), BigQuery (**bq**), Bigtable (**cbt**) have their own tools.
- GKE: **gcloud** = cluster; **kubectl** = pods/deployments. Don't mix them up.
- `--project` changes the target **only for that command**, without switching the active configuration.
- To change output use **`--format`**; to filter use **`--filter`** (server-side).
- Cloud Shell: home **5 GB persists**; software installed outside the home does **not** persist (ephemeral VM).
- `gcloud components` manages the SDK; **in Cloud Shell everything comes pre-installed**.

## Sources
- https://docs.cloud.google.com/sdk/docs/initializing
- https://docs.cloud.google.com/docs/authentication/gcloud
- https://docs.cloud.google.com/sdk/docs/cheatsheet
