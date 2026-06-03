# Cloud Workstations (≈ AWS Cloud9)

## What it is
- Managed development environment, running on a VM (Compute Engine) inside YOUR project.
- Spins up/down on-demand; persistent disk keeps code and configs between sessions.
- Environment defined by a container image → solves "works on my machine" and config drift.
- AWS equivalent: Cloud9 (which AWS no longer offers to new customers). Don't confuse it with Cloud Shell.

## When to use
- Continuous team development, fast onboarding, standardized environment.
- Security requirement: code must not leave to the local machine.
- You need a real IDE (browser, local VS Code, JetBrains) + persistence/storage.
- Do NOT use it for a quick terminal task → that's Cloud Shell.

## Key points
- 3 layers: **Cluster** (regional, defines network/VPC; NOT GKE) → **Configuration** (template: machine type, disk, image, IDE) → **Workstation** (the dev's instance).
- IDEs: Code-OSS in the browser (with Cloud Code pre-installed), local VS Code, JetBrains (IntelliJ Ultimate / PyCharm Pro), SSH.
- Security: VPC Service Controls, private ingress/egress, granular IAM, Cloud Audit Logs, CMEK, IAP/BeyondCorp.
- Custom container image defined by the admin; rebuild can be automated.
- Cost = control plane fee (per cluster hour) + compute of the running VM.
- idle-timeout for the idle workstation (default 7200s = 2h); running-timeout caps total execution (also default 7200s; adjustable, e.g., 43200s = 12h).

### Workstations vs Shell vs Code
- **Cloud Code**: IDE plugin/extension (deploy to GKE/Cloud Run, APIs). Not an environment.
- **Cloud Shell**: temporary and free terminal, ephemeral VM outside your project, little storage.
- **Cloud Workstations**: persistent, customizable environment, in your project.

## Command/CLI (reference)
```
# 1. Cluster (regional, defines the network)
gcloud workstations clusters create CLUSTER \
  --region=REGION --network=NET --subnetwork=SUBNET

# 2. Configuration (template)
gcloud workstations configs create CONFIG \
  --cluster=CLUSTER --region=REGION \
  --machine-type=e2-standard-4 --pd-disk-size=200 \
  --container-custom-image=REGION-docker.pkg.dev/PROJ/REPO/IMG \
  --idle-timeout=3600 --running-timeout=43200

# 3. Workstation
gcloud workstations create WS --config=CONFIG --cluster=CLUSTER --region=REGION
gcloud workstations start  WS --config=CONFIG --cluster=CLUSTER --region=REGION
```

## Exam traps
- A "workstation cluster" is NOT a GKE cluster — it's just a regional network grouping.
- Cloud Shell is ephemeral and discarded; Workstations is persistent. Don't swap the two.
- Cloud Code is an extension, not an execution environment.
- The VM runs in YOUR project → that's why it inherits VPC SC, IAM, CMEK, Audit Logs (Cloud9 doesn't have that corporate security footprint).
- A "no source code locally" policy = typical Workstations use case, not Cloud Shell.
- Cost has a control plane fee even with the workstation stopped (cluster active); idle-timeout reduces compute cost, not the control plane cost.

## Sources
- https://docs.cloud.google.com/workstations/docs/overview
- https://docs.cloud.google.com/workstations/docs/architecture
- https://cloud.google.com/sdk/gcloud/reference/workstations/clusters/create
- https://docs.cloud.google.com/docs/get-started/developer-tools
