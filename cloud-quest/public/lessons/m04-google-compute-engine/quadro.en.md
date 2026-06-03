# 04 — Google Compute Engine (GCE)

> AWS anchor: **GCE ≈ Amazon EC2** (IaaS, managed VMs)

## What it is

Google Cloud's IaaS service for **provisioning and managing virtual machines (VMs)**.
Lets you create/start/stop/restart/delete VMs, attach disks, load balancing, and autoscaling.

## When to use

- You need **full OS control** / lift-and-shift of servers.
- App doesn't fit well into a container/serverless (PaaS), or requires a specific kernel/license.
- Long-running workloads with a defined hardware profile (CPU, RAM, GPU).
- **Don't use** when Cloud Run / GKE / App Engine solve it with less management.

## Key points

- **Machine families** (by workload):
  - General-purpose: **E2, N2, N2D, N1** → default, best cost-benefit.
  - Compute-optimized: **C2** → CPU-intensive (HPC, games).
  - Memory-optimized: **M** → very high RAM (in-memory DB, SAP).
- **Machine type** = vCPUs + memory (e.g., `e2-standard-4`). There are **custom machine types** (≈ instance family/size on AWS).
- **Images**: public images (Debian, Ubuntu, Windows...) or a **custom image** from a configured VM → faster boot (**≈ AMI**).
- **Instance template**: freezes machine type + image + labels + startup script + network. **Immutable** (≈ launch template). Basis for Managed Instance Groups.
- **Startup script**: runs at boot, installs/configures software. Flexible; custom image is faster.
- **IPs**: internal (VPC) always; external **ephemeral** by default; **static external IP** reservable (≈ Elastic IP).
- **Spot VMs**: up to **91% off**, terminable at any time, **no SLA**, **no maximum runtime** (≈ Spot Instances). Evolution of preemptible.
- **Discounts**: **sustained-use** automatic up to 30% (E2 does **not** get it); **committed-use** 1/3 years, up to 70% (mem-optimized) / 55% (rest).
- **Availability**: **live migration** (moves a running VM during maintenance, no downtime) + **automatic restart**.
- **Sole-tenant node**: dedicated physical server just for you (BYOL/compliance) (≈ Dedicated Hosts).

## Command/CLI (reference)

```bash
# Create VM
gcloud compute instances create my-vm \
  --machine-type=e2-standard-4 \
  --image-family=debian-12 --image-project=debian-cloud \
  --zone=us-central1-a

# Startup script at boot
gcloud compute instances create web \
  --metadata-from-file=startup-script=startup.sh

# Spot VM
gcloud compute instances create cheap-vm \
  --provisioning-model=SPOT --instance-termination-action=STOP

# Custom image from a disk
gcloud compute images create my-image --source-disk=my-vm --source-disk-zone=us-central1-a

# Instance template + reserve static IP
gcloud compute instance-templates create my-tpl --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud
gcloud compute addresses create my-ip --region=us-central1
```

## Exam traps

- **Instance template is immutable** — you don't edit it; copy and create a new version.
- **E2 does NOT have a sustained-use discount** (the other general-purpose ones do).
- **Spot vs Preemptible**: preemptible had a **max of 24h**; **Spot has no runtime limit**. Spot is the current model.
- **A reserved static IP that isn't attached IS BILLED** (same as an idle Elastic IP).
- **Ephemeral external IP changes** when you stop/restart the VM; use static if you need it fixed.
- **Live migration ≠ app high availability** — it protects against host maintenance, it does not replace a multi-zone MIG / load balancer.
- **Committed-use**: up to **70%** only on **memory-optimized**; the rest up to **55%**.
- **Custom image** speeds up boot; **startup script** gives flexibility — know when to use each.
- **Sole-tenant** = physical hardware isolation (compliance/BYOL), not the cost-saving option.

## Sources

- https://docs.cloud.google.com/compute/docs/machine-resource
- https://docs.cloud.google.com/compute/docs/instances/spot
- https://docs.cloud.google.com/compute/docs/sustained-use-discounts
- https://docs.cloud.google.com/compute/docs/instances/committed-use-discounts-overview
