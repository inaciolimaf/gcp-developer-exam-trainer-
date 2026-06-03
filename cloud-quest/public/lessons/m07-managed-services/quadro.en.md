# 07 — Managed Services & the Compute Spectrum

## What it is

Managed services are services where Google takes over part (or all) of the operational work — OS, patching, runtime, scaling, availability, load balancing. The core concept is a **spectrum of responsibility**: the more you delegate to the provider, the less control you have and the less operations you do.

- **IaaS** (Infrastructure as a Service): the provider gives you hardware, networking, and virtualization. You handle OS, runtime, app, scaling, HA, LB. → **Compute Engine** (≈ AWS EC2).
- **PaaS** (Platform as a Service): the provider handles OS, runtime, scaling, HA, LB. You bring only code + config. → **App Engine** (≈ AWS Elastic Beanstalk).
- **CaaS** (Container as a Service): the unit that runs is a Docker container. → **GKE**, **Cloud Run**.
- **FaaS** (Function as a Service): the unit is a function triggered by an event. → **Cloud Functions** (≈ AWS Lambda).
- **Serverless**: you don't see/manage servers; autoscaling and HA for free; **pay-per-use** with **scale-to-zero**. It does NOT mean "no servers". → Cloud Functions, Cloud Run, App Engine Standard.
- **Docker/containers**: the image packages runtime + code + dependencies; lightweight (no guest OS, uses the host OS); portable/cloud-neutral; isolated. Kubernetes orchestrates (autoscaling, service discovery, LB, self-healing, zero-downtime deploys).

## When to use

- **Compute Engine** — you need OS control, lift-and-shift of legacy/monolith, databases like SAP HANA, GPUs, background processes, no timeout limit.
- **GKE** — complex microservices, Kubernetes, multi-cloud, custom system dependencies, you need advanced orchestration (cluster with nodes).
- **Cloud Run** — simple containerized app without wanting to manage a cluster; HTTP/APIs; you want scale-to-zero and pay-per-use.
- **Cloud Functions** — event-driven (react to a message in a queue, an upload to Cloud Storage); small, lightweight function.
- **App Engine** — bring only the code (Java/Python/Node/Go etc.) without building a container; 100% managed platform; Standard scales to zero on sporadic/ad hoc load.

## Key points

GCP compute spectrum — from most control (left) to most managed (right):

| Service | Model | Deploy unit | Cluster? | Scale-to-zero | AWS anchor |
|---|---|---|---|---|---|
| Compute Engine | IaaS | VM / image | No | No | EC2 |
| GKE | CaaS | Container | Yes (nodes) | No | EKS |
| Cloud Run | CaaS / serverless | Container (or source/function) | No | Yes | Fargate / App Runner |
| Cloud Functions | FaaS / serverless | Function | No | Yes | Lambda |
| App Engine | PaaS / serverless | Code (source) | No | Yes (Standard) | Elastic Beanstalk |

- Core trade-off: **control ↔ management**. Left = more control, more work. Right = less control, less ops.
- Cloud Run is the "sweet middle ground": serverless container **without a cluster**.
- GKE = Kubernetes for complex architectures; Cloud Run for simple architectures.

## Command/CLI (reference)

```
# IaaS — Compute Engine
gcloud compute instances create vm1 --zone=us-central1-a

# Managed CaaS — GKE
gcloud container clusters create-auto cluster1 --region=us-central1

# Serverless container — Cloud Run
gcloud run deploy svc1 --image=gcr.io/proj/app --region=us-central1

# FaaS — Cloud Functions (2nd gen)
gcloud functions deploy fn1 --runtime=python312 --trigger-http --gen2

# PaaS — App Engine
gcloud app deploy app.yaml
```

## Exam traps

- **Serverless ≠ no servers**: there are servers, you just don't manage/see them.
- **Compute Engine is IaaS**, not serverless. GKE does **not** scale to zero (it keeps nodes).
- **GKE = CaaS** (not pure IaaS nor PaaS): managed control plane, but you still think in terms of cluster/nodes.
- **Cloud Run vs GKE**: Cloud Run **needs no cluster**; GKE does. Simple container → Cloud Run; complex microservices → GKE.
- **Cloud Functions = FaaS = event-driven**; it's the "true" serverless and is equivalent to Lambda.
- **App Engine = PaaS**; Standard scales to zero (good for ad hoc/idle load). App Engine also runs simple containers, but without Kubernetes-style orchestration.
- "No ops / autoscaling / pay-per-use / low maintenance" in the prompt → points toward the **most managed** option that fits (usually Cloud Run instead of Compute Engine).
- "OS control / specific stack / lift-and-shift" → points toward **Compute Engine**.

## Sources

- https://cloud.google.com/hosting-options
- https://cloud.google.com/learn/paas-vs-iaas-vs-saas
- https://cloud.google.com/blog/products/gcp/time-to-hello-world-vms-vs-containers-vs-paas-vs-faas/
