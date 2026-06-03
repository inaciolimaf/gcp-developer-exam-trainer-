# 31 — Compute Engine VMs (advanced)

## What it is
A deep dive into Compute Engine VMs (IaaS, the equivalent of AWS EC2): disk types, snapshots, metadata server, identity via service account, OS Login and Shielded VM. Complements the basics from module 04.

## When to use
- Workload that needs OS/kernel control, legacy software or per-host licensing.
- Fast disposable disk (cache, scratch) -> Local SSD.
- Latency-sensitive database/app -> pd-ssd; general purpose -> pd-balanced; cheap sequential bulk -> pd-standard.
- Boot hardening against rootkits -> Shielded VM.
- IAM-controlled SSH access at scale -> OS Login.

## Key points
- **Persistent Disk types** (network block storage, like EBS):
  - `pd-standard` (HDD) — cheap, sequential.
  - `pd-balanced` (SSD) — default, cost/performance, sub-ms latency.
  - `pd-ssd` (SSD) — high IOPS, low latency, enterprise/DB.
- **Local SSD** — attached to the host, far better IOPS/latency, but EPHEMERAL (gone when the VM stops). Analogous to EC2 Instance Store.
- **Snapshots** — incremental and global (restore in any region).
- **Metadata server** — `metadata.google.internal` (or `169.254.169.254`); requires the `Metadata-Flavor: Google` header; serves project/instance metadata, startup/shutdown scripts and the service account's OAuth token. HTTPS only on Shielded VMs.
- **VM service account** — default = Compute Engine default SA (Editor role, too broad). Best practice: dedicated SA + least-privilege IAM, instead of access scopes (legacy). Code gets credentials via the metadata server, no key on disk. ~ EC2 IAM Role.
- **SSH** — metadata-managed (individual keys in metadata) vs OS Login (IAM-based access, automatic Linux account). Console = ephemeral pair; `gcloud compute ssh` = persistent pair.
- **Shielded VM** — Secure Boot (boot signature), vTPM + Measured Boot (baseline), integrity monitoring (event in Cloud Logging). vTPM and integrity monitoring ON by default; Secure Boot recommended.

## Command/CLI (reference)
```bash
# Create a VM with a balanced disk, dedicated SA and Shielded VM
gcloud compute instances create app-vm \
  --zone=us-central1-a \
  --boot-disk-type=pd-balanced --boot-disk-size=20GB \
  --service-account=app-sa@PROJECT.iam.gserviceaccount.com \
  --scopes=cloud-platform \
  --shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring

# Attach Local SSD (ephemeral)
gcloud compute instances create cache-vm --zone=us-central1-a \
  --local-ssd=interface=NVME

# Disk snapshot (incremental, global)
gcloud compute disks snapshot app-vm --zone=us-central1-a --snapshot-names=app-snap

# Enable OS Login on the project
gcloud compute project-info add-metadata --metadata enable-oslogin=TRUE

# SSH (generates a persistent pair)
gcloud compute ssh app-vm --zone=us-central1-a

# Read the SA token from the metadata server (from inside the VM)
curl -H "Metadata-Flavor: Google" \
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
```

## Exam traps
- **Local SSD is EPHEMERAL** — loses data when the VM stops/is deleted. To persist = Persistent Disk.
- **Snapshot is global and incremental** — restores in another region; no need for a full backup every time.
- **Metadata server fails without the `Metadata-Flavor: Google` header** — anti-SSRF protection.
- **Default SA has the Editor role** — too broad; security questions call for a dedicated SA with least-privilege IAM.
- **Access scopes are legacy** — prefer IAM on the SA; `cloud-platform` + restricted IAM > granular scopes.
- **OS Login = IAM-based access** (`roles/compute.osLogin`), not a key in metadata.
- **vTPM and integrity monitoring come enabled** on a Shielded VM; you turn on Secure Boot.
- **Credentials come from the metadata server**, never put an SA key on the VM's disk.

## Sources
- https://cloud.google.com/compute/docs/disks
- https://docs.cloud.google.com/compute/docs/metadata/overview
- https://docs.cloud.google.com/compute/docs/access/service-accounts
- https://cloud.google.com/compute/shielded-vm/docs/shielded-vm
