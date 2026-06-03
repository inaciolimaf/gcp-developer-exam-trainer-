# 30 — Anthos / Cloud Service Mesh

## What it is

- **Anthos** (renamed **GKE Enterprise** in 2023): platform to manage **multi-cloud and hybrid** Kubernetes clusters (GCP, AWS, Azure, on-prem) in a consistent way.
  - **Anthos Config Management** = GitOps: cluster config in a Git repo → commit → applied automatically.
  - **Fleet**: logical grouping of clusters to apply policies together.
  - AWS ≈ **EKS Anywhere** + centralized fleet management.
- **Cloud Service Mesh** (formerly **Anthos Service Mesh** + formerly **Traffic Director**): managed service mesh, **based on Istio**.
  - **Data plane**: **Envoy** proxy running as a **sidecar** next to each pod, intercepting all traffic.
  - **Control plane**: injects sidecars, distributes certificates, configures routing/discovery.
  - AWS ≈ **AWS App Mesh** (also Envoy).

```
        Pod A                         Pod B
 ┌────────────────┐           ┌────────────────┐
 │ app  │ Envoy   │◄──mTLS───►│ Envoy  │ app   │   ← data plane (sidecars)
 └────────────────┘           └────────────────┘
          ▲                            ▲
          └────────── Control Plane ───┘            ← injects proxy + config + CA
```

## When to use

- You have K8s clusters across **multiple clouds / on-prem** and need consistent management and policies → **Anthos / GKE Enterprise**.
- You have **many microservices** and need **mTLS, observability and traffic control** without touching code → **Cloud Service Mesh**.
- You need **canary / A/B / traffic splitting** by percentage between versions.
- You want **fault injection** (delays/errors) to test resilience (Chaos Monkey).
- You want **automatic mTLS** between services with a managed CA.

## Key points

- Sidecar = **Envoy** proxy; open source mesh = **Istio**; Cloud Service Mesh = Istio managed by Google.
- **Without changing code**: mTLS, retries, timeouts, routing, metrics — all in the proxy.
- **Security**: automatic mTLS + managed private CA; user auth via **IAP**.
- **Observability**: integrates with Cloud Logging, Monitoring, Trace; **SLO monitoring**.
- **Traffic**: canary, A/B, traffic split %, mirroring/shadow, fault injection.
- Config done via **Istio APIs** (VirtualService, DestinationRule, etc.).

## Command/CLI (reference)

```bash
# Provision managed Cloud Service Mesh on a GKE cluster (fleet)
gcloud container fleet mesh enable --project PROJECT_ID
gcloud container clusters update CLUSTER --fleet-project PROJECT_ID
gcloud container fleet mesh update \
  --management automatic --memberships CLUSTER --project PROJECT_ID

# Enable automatic sidecar injection on the namespace
kubectl label namespace NAMESPACE istio.io/rev=asm-managed --overwrite

# Traffic split / canary (Istio) — apply manifest
kubectl apply -f virtual-service.yaml   # e.g.: 90% v1 / 10% v2
```

## Exam traps

- **REBRANDING (most important)**: *Anthos Service Mesh* = *Cloud Service Mesh* = *managed Istio*. *Anthos* = *GKE Enterprise*. They are synonyms on the exam.
- **Cloud Service Mesh unified** Anthos Service Mesh **+ Traffic Director** into a single product.
- The sidecar is **Envoy**, not Istio. Istio is the framework/control plane; Envoy is the data plane proxy.
- **Istio on GKE** (legacy/beta) ≠ recommended for production; the recommended option is **Cloud/Anthos Service Mesh** (with Google support and SLA).
- mTLS, observability and canary come **without changing the application code**.
- Anthos = **multi-cloud cluster management**; Service Mesh = **communication between services**. Don't confuse the two.
- Traffic config uses **Istio APIs**, even in the managed product.

## Sources

- https://cloud.google.com/blog/products/networking/introducing-cloud-service-mesh
- https://docs.cloud.google.com/service-mesh/docs/overview
- https://docs.cloud.google.com/service-mesh/docs/migrate-istio-to-anthos-service-mesh
- https://timberry.dev/introducing-gke-enterprise
