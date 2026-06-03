# 10 — GKE: YAML Configuration (Deployment, Service, Labels)

## What it is
**Declarative** Kubernetes configuration: you describe the **desired state** in YAML files and apply it with `kubectl apply`. On GKE the YAML is identical to EKS/any other cluster — only the control plane is managed by Google.

The 4 blocks of EVERY manifest:

```yaml
apiVersion: apps/v1      # which API
kind: Deployment         # resource type
metadata:                # name, namespace, labels
  name: hello-world
  labels:
    app: hello-world
spec:                    # desired configuration
  ...
```

Imperative (`kubectl create/expose/scale`) vs Declarative (`kubectl apply -f`). Use declarative: versionable, reproducible.

## When to use
- **Pod**: smallest unit (1+ containers, same network/storage). Rarely created directly.
- **Deployment**: guarantees N replicas + handles rolling updates. This is what you use for stateless apps.
- **Service**: exposes Pods behind a stable IP and does internal load balancing.
- **ConfigMap / Secret**: non-sensitive config / credentials.

| Concept | AWS / EKS |
|---|---|
| YAML manifest | same k8s YAML on EKS |
| Declarative `apply` | Terraform philosophy |
| Service LoadBalancer | provisioned ELB/NLB |
| Secret | Secrets Manager (but Secret = base64 only) |

## Key points

**A Deployment has TWO specs** (the most confusing part):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:                      # DEPLOYMENT spec
  replicas: 3
  selector:
    matchLabels:
      app: hello-world     # must match the template below
  template:                # << POD definition
    metadata:
      labels:
        app: hello-world   # Pod label
    spec:                  # POD spec
      containers:
        - name: hello-world
          image: gcr.io/proj/hello-world:1.0
          ports:
            - containerPort: 8080
```

**Labels + Selectors** = the glue that ties everything together:
- Deployment `selector.matchLabels` → Pods from `template.metadata.labels`
- Service `selector` → Pods with that label
- If they don't match: apply fails (Deployment) or the Service has no endpoints (no response).

**Service — types and ports:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  type: LoadBalancer   # ClusterIP (default) | NodePort | LoadBalancer
  selector:
    app: hello-world
  ports:
    - port: 80         # Service port (external)
      targetPort: 8080 # container port
      # nodePort: 30080  (only in NodePort/LoadBalancer)
```

- **ClusterIP** (default): cluster-internal only (service-to-service).
- **NodePort**: fixed port on every node (`<NodeIP>:<nodePort>`).
- **LoadBalancer**: external IP via GKE's Cloud Load Balancer.

**ConfigMap / Secret** injected as env vars or volumes. A Secret is **base64, not encrypted** by default.

**Rolling update** (`spec.strategy`):
- `RollingUpdate` (default): updates in batches, no downtime.
- `Recreate`: kills all Pods, brings up new ones → **downtime**.
- `maxSurge` / `maxUnavailable` default = **25%** each.
- 1 at a time without losing capacity: `maxSurge:1, maxUnavailable:0`.
- 1 at a time without creating an extra Pod (cost): `maxSurge:0, maxUnavailable:1`.

## Command/CLI (reference)
```bash
kubectl apply -f deployment.yaml      # create/update (declarative)
kubectl apply -f .                     # apply all YAML in the folder
kubectl get deploy,svc,pods            # view resources
kubectl describe deploy hello-world    # details/events
kubectl rollout status deploy/hello-world
kubectl rollout undo deploy/hello-world   # rollback
kubectl diff -f deployment.yaml        # see what would change
kubectl get svc hello-world -o wide    # see the LoadBalancer's EXTERNAL-IP
```

## Exam traps
- **Service default is `ClusterIP`** (internal). External access needs NodePort or LoadBalancer.
- **`maxSurge` and `maxUnavailable` default = 25%** (not 1/0).
- **Default strategy is `RollingUpdate`**; `Recreate` causes downtime.
- **Selector ≠ Pod labels** → Deployment creates nothing / Service has no endpoints.
- **Don't confuse `port` (Service) × `targetPort` (container) × `nodePort` (node).**
- **Secret = base64, not encryption.** Don't treat it as a secure vault by default.
- **`apiVersion`**: Deployment = `apps/v1`; Pod/Service/ConfigMap/Secret = `v1`.
- A Deployment has **2 nested specs** (Deployment and Pod template) — know which field goes in which.

## Sources
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://cloud.google.com/kubernetes-engine/docs/concepts/deployment
- https://cloud.google.com/kubernetes-engine/docs/how-to/exposing-apps
