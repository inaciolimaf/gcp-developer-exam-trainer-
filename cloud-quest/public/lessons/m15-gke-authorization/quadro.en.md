# 15 — Authorization in GKE (Workload Identity, RBAC)

## What it is

Two distinct questions, two tools:

1. **Workload Identity Federation for GKE** — how a Pod accesses **Google Cloud APIs** without a service account key. Makes a **Kubernetes Service Account (KSA)** act as a Google Cloud identity.
   - **KSA** = internal Kubernetes resource (created with `kubectl`, like a Deployment/Service). It is NOT a Google resource.
   - **GSA (Google Service Account)** = IAM resource (gcloud/console).
   - AWS analogy: **EKS IRSA** (associating a K8s SA with an AWS IAM Role).

2. **In-cluster authorization** — who can do what. Two layers:
   - **Google Cloud IAM** → access to the cluster (project/folder/org). Google Cloud-specific.
   - **Kubernetes RBAC** → fine-grained access to resources inside the cluster/namespace. A **Kubernetes** resource (works in GKE, EKS, AKS, on-prem). Same RBAC you already use in EKS.

Mental rule: **IAM says whether you get into the cluster; RBAC says what you do inside.** They add up.

## When to use

- **Workload Identity**: whenever a workload in GKE needs to call a Google Cloud API (Storage, Pub/Sub, etc.). It is the **recommended** approach — it replaces injecting an SA key as a Secret into the Pod.
- **GKE IAM roles**: grant administrative/operational access to the cluster(s) in a project. Use **predefined roles**, never basic (owner/editor/viewer).
- **RBAC**: fine-grained control per namespace/resource for users and service accounts inside a cluster.

## Key points

- **KSA != GSA.** Memorizing this distinction is half the module.
- Classic flow (GSA in the middle): enable Workload Identity on the cluster → create a GSA with permissions → create a KSA → point the Pod at it (`serviceAccountName`) → stitch them together: `roles/iam.workloadIdentityUser` + annotation on the KSA.
- **Up to date:** the official docs today recommend **direct resource access** — bind the IAM role directly to the KSA's `principal://`, **without a GSA and without an annotation**. Know both.
- Enabled Workload Identity on an old cluster? **Update the node pools** (`--workload-metadata=GKE_METADATA`).
- No keys: the GKE **metadata server** delivers a short-lived credential. No SA key on disk.
- RBAC = 4 objects: **Role** (permissions in a namespace), **ClusterRole** (cluster-wide, no namespace), **RoleBinding** (binds subjects to a role in a namespace), **ClusterRoleBinding** (across the whole cluster).
- Binding subjects: Google user (email), Google group, KSA, or GSA.
- GKE IAM roles: `container.admin` (everything), `container.clusterAdmin` (manages the cluster only, not K8s objects), `container.developer` (manages K8s objects, read on the cluster), `container.viewer` (read).

## Command/CLI (reference)

```bash
# 1. Enable Workload Identity (creation or update)
gcloud container clusters create CLUSTER \
  --workload-pool=PROJECT_ID.svc.id.goog
gcloud container clusters update CLUSTER \
  --workload-pool=PROJECT_ID.svc.id.goog
# update of an old cluster: update the node pool too
gcloud container node-pools update POOL --cluster=CLUSTER \
  --workload-metadata=GKE_METADATA

# 2. Create KSA
kubectl create serviceaccount KSA_NAME --namespace NS

# 3a. Classic model (GSA in the middle)
gcloud iam service-accounts add-iam-policy-binding GSA@PROJECT.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:PROJECT_ID.svc.id.goog[NS/KSA_NAME]"
kubectl annotate serviceaccount KSA_NAME --namespace NS \
  iam.gke.io/gcp-service-account=GSA@PROJECT.iam.gserviceaccount.com

# 3b. Recommended model (direct resource access, no GSA)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --role roles/storage.objectViewer \
  --member "principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/PROJECT_ID.svc.id.goog/subject/ns/NS/sa/KSA_NAME"

# Point the Pod at the KSA:  spec.serviceAccountName: KSA_NAME
```

```yaml
# RBAC: Role + RoleBinding (namespace)
kind: Role          # ClusterRole has no namespace
metadata: { namespace: default, name: configmap-editor }
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "update"]
---
kind: RoleBinding
subjects:
- kind: User        # or Group, or ServiceAccount
  name: dev@empresa.com
roleRef: { kind: Role, name: configmap-editor }
```

## Exam traps

- **KSA is not GSA.** If the question mixes "Kubernetes service account" with "IAM service account", read it with a magnifying glass.
- **Service account key in the Pod = wrong.** The correct answer is almost always **Workload Identity**.
- **RBAC is Kubernetes**, not Google Cloud — it also applies in EKS/AKS/on-prem. IAM is what's Google Cloud-specific.
- **Role requires a namespace; ClusterRole does not.** A RoleBinding can reference a ClusterRole (reusing permissions within a namespace).
- Enabled Workload Identity later? **Old node pools must be updated explicitly.**
- Basic roles (owner/editor/viewer) on a GKE cluster = not recommended; use predefined.
- Default Compute Engine SA on the nodes = not recommended; give the nodes only logging/monitoring and use Workload Identity per microservice.

## Sources

- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
- https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity
- https://docs.cloud.google.com/iam/docs/workload-identities
