# 09 — Google Kubernetes Engine (GKE)

## What it is
- **GKE** = Google Cloud's managed Kubernetes. AWS anchor: **GKE ≈ Amazon EKS**.
- **Cluster** = where workloads run. Made up of:
  - **Control plane** (on the master): API server, scheduler, etcd — **always managed by Google** (in both modes).
  - **Worker nodes**: Compute Engine VMs (Container-Optimized OS) where the Pods run, organized into **node pools**.
- **K8s objects** (the same in any cloud):
  - **Pod**: smallest deployable unit; 1+ containers; ephemeral IP (changes if recreated).
  - **Deployment**: represents a microservice and its versions; manages a **ReplicaSet**; rollout with zero downtime. Each instance = one Pod.
  - **Service**: stable endpoint + load balancing for a set of Pods; resolves the ephemeral IP. Discovery via **DNS** and **Namespaces**.

## When to use
- **Autopilot** → less operations, you pay for **resources requested by the Pods** (CPU/mem), no node management. Always **regional**. Default choice for production.
- **Standard** → fine-grained control: custom node pools, GPU, VM types, zonal or regional. You pay per **VM** (used or not).
- **GKE vs Cloud Run** → GKE when you need the full K8s ecosystem; Cloud Run for a simple stateless container without a cluster.

## Key points
- Control plane is managed in **both** modes; the difference is in the **data plane** (nodes).
- **Autopilot**: Google manages the nodes (sizing, scaling, upgrade, repair); **no node pools**; auto-repair and auto-upgrade pre-enabled; regional by default.
- **Standard**: you manage the node pools; auto-repair/auto-upgrade and the cluster autoscaler are **optional**.
- **Autoscaling in 2 layers**:
  - **HPA (Horizontal Pod Autoscaler)** → scales the number of **Pods** by load (e.g., CPU).
  - **Cluster Autoscaler** → adds/removes **nodes** in the node pool.
  - Full scaling = **HPA + Cluster Autoscaler** together.
- Cost (Standard): **Spot/preemptible VMs**, **E2** types (cheaper than N1), **committed use discounts** for steady load.
- **GPU** → dedicated node pool with GPU; schedule the workloads that need it there.

## Command/CLI (reference)
```bash
# create an Autopilot cluster
gcloud container clusters create-auto my-cluster --region=us-central1

# create a Standard cluster
gcloud container clusters create my-cluster --zone=us-central1-a --num-nodes=3

# connect kubectl
gcloud container clusters get-credentials my-cluster --region=us-central1

# objects
kubectl get pods -o wide
kubectl get deployments
kubectl create deployment hello --image=IMAGE
kubectl expose deployment hello --type=LoadBalancer --port=80

# rollout (new version, zero downtime)
kubectl set image deployment/hello hello=IMAGE:v2

# Pod autoscaling (HPA)
kubectl autoscale deployment hello --min=2 --max=10 --cpu-percent=70

# resize a node pool (Standard)
gcloud container clusters resize my-cluster --num-nodes=5 --region=us-central1
```

## Exam traps
- "Managed control plane" applies to **both Autopilot AND Standard** — it's not exclusive to Autopilot.
- **HPA scales Pods, Cluster Autoscaler scales nodes** — don't mix them up; total automation needs both.
- In **Autopilot you do NOT create node pools** nor choose VMs — you only declare the Pods' resource requests.
- Billing: **Autopilot by Pod request**; **Standard by VM** (even when idle).
- The Pod's IP is **ephemeral**; for a stable endpoint use a **Service** (don't depend on the Pod's IP).
- Autopilot is **always regional**; zonal exists only in Standard.
- Reducing GKE cost = Spot VMs + E2 + CUDs + the right region (not "switch to Autopilot" automatically).

## Sources
- https://docs.cloud.google.com/kubernetes-engine/docs/resources/autopilot-standard-feature-comparison
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/types-of-clusters
