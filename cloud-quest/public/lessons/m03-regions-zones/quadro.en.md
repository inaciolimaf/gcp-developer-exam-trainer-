# 03 — Regions and Zones

## What it is

- **Region**: a specific, independent geographic area where Google hosts infrastructure. Contains **3 or more zones**. E.g.: `us-west1`, `europe-north1` (Finland), `asia-south1` (Mumbai).
- **Zone**: an isolated location within a region, with independent power, network, and cooling. It is a **single failure domain**. E.g.: `us-west1-a`, `us-west1-b`, `us-west1-c`.
- Zones in the same region are connected by **low-latency** links; they fail independently.
- **AWS anchor**: GCP Region ≈ AWS Region; GCP Zone ≈ AWS Availability Zone (AZ).
- **Naming convention**: zone = region name + `-a`/`-b`/`-c`.

| Concept | Protects against | Solves |
|---|---|---|
| Multi-zone (1 region) | local failure (power outage/fire in 1 zone) | High Availability within the region |
| Multi-region | an entire regional disaster | Disaster Recovery, global latency, data residency |

## When to use

- **HA in a single region** → deploy across **multiple zones**.
- **Global SaaS app** → deploy across **multiple regions**.
- **Survive an entire region going down** → **multiple regions**.
- **Meet data residency / compliance** → choose the **compatible region**.
- **Choosing the right region** — 4 factors: **Compliance/data residency**, **Latency**, **Service availability** (not every service is in every region), **Price** (varies by region).

## Key points

Resource scope (shows up a lot on the PCD):

| Scope | Lives in | Examples |
|---|---|---|
| **Zonal** | 1 zone | VM instance, zonal persistent disk, GPUs, TPUs |
| **Regional** | accessible from any zone in the region (replicated/distributed across zones) | regional MIG, regional persistent disk (replicates across **2 zones**), regional static IP |
| **Global** | any zone/region in the project | images, snapshots, VPC network, firewall rules, routes, global static IP |

- A region has **3+ zones** (most of them), the number **varies** by region.
- **Multi-regional services** (managed by Google) are designed to survive the loss of a region.

## Command/CLI (reference)

```bash
# List regions and zones
gcloud compute regions list
gcloud compute zones list

# Set default region/zone
gcloud config set compute/region us-west1
gcloud config set compute/zone us-west1-a

# Create VM (zonal) in a specific zone
gcloud compute instances create vm1 --zone=us-west1-a

# Regional MIG (HA across zones in the region)
gcloud compute instance-groups managed create mig1 \
  --region=us-west1 --template=tmpl --size=3
```

## Exam traps

- **A VM instance is zonal** — on its own it does not survive the zone going down. For HA use multiple zones or a **regional MIG**.
- **A single zone does NOT give you HA** — zones fail; spread across several.
- **Not every region has the same number of zones** (most have 3, but it varies).
- **The same service costs differently** in different regions — regions are not priced the same.
- **Not every service is in every region**, especially new launches — check before you commit.
- **Data residency is law**, not optimization — choose the region by jurisdiction, not just by latency.
- Don't confuse **regional** (replicated across zones) with **multi-regional** (replicated across regions): a regional persistent disk ≠ a multi-region bucket.

## Sources

- https://docs.cloud.google.com/docs/geography-and-regions
- https://docs.cloud.google.com/compute/docs/regions-zones
- https://docs.cloud.google.com/compute/docs/regions-zones/global-regional-zonal-resources
- https://cloud.google.com/about/locations
