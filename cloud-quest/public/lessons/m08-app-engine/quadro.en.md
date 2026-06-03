# 08 — App Engine

## What it is

Fully managed Platform as a Service (PaaS): you ship the code, and Google handles provisioning, deployment, load balancing, and scaling.

AWS equivalent: **App Engine ≈ AWS Elastic Beanstalk** (with scale-to-zero in Standard, which classic Beanstalk doesn't have).

Two environments:

| | Standard | Flexible |
|---|---|---|
| Runtime | Language sandbox (Java, Python, PHP, Node.js, Ruby, Go) | Docker container on a Compute Engine VM (any runtime) |
| Scale-to-zero | Yes | No (minimum 1 instance) |
| Startup | Seconds | Minutes |
| Scaling | automatic, basic, manual | automatic, manual (no basic) |
| Request timeout | 10 min (automatic) / up to 24h (basic/manual) | 60 min |
| Billing | instance hours | vCPU + memory + persistent disk |
| SSH / local disk | No / only /tmp | Yes / attachable ephemeral disk |

Hierarchy: **app → service → version → instance**. 1 app per project, locked to 1 region (immutable).

## When to use

- Simple microservices / web apps that don't need Kubernetes orchestration.
- **Standard**: supported runtime, intermittent workloads (scale-to-zero cuts cost), fast startup.
- **Flexible**: custom runtime (C, C++, .NET), need SSH/background processes, requests up to 60 min.
- Need advanced container orchestration: use GKE, not App Engine.

## Key points

- 1 project = 1 app; the app's region does NOT change after creation.
- Traffic splitting between versions (canary/blue-green): split by **IP**, **cookie**, or **random**.
- IP split = same client always hits the same version (bad for testing from your own IP).
- `--no-promote` deploys without moving traffic to the new version.
- Scaling is configured in **app.yaml**.
- **Resident** instances (fixed, always on) vs **dynamic** instances (spin up/down with load).

## Command/CLI (reference)

```bash
# Deploy (promotes by default)
gcloud app deploy --version=v3

# Deploy WITHOUT moving traffic
gcloud app deploy --version=v3 --no-promote

# Open a specific version for testing
gcloud app browse --version=v3

# Traffic splitting
gcloud app services set-traffic default --splits=v2=.5,v3=.5 --split-by=random
gcloud app services set-traffic default --splits=v3=1   # 100% to v3
```

```yaml
# app.yaml
runtime: python39
service: my-service
env_variables:
  KEY: value

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10
  max_concurrent_requests: 50
# or: basic_scaling: { max_instances, idle_timeout }
# or: manual_scaling: { instances }
# Flexible: env: flex
```

## Exam traps

- **Basic scaling does NOT exist in Flexible** (only Standard has all 3).
- **Scale-to-zero only in Standard**; Flexible always has >= 1 instance.
- Standard automatic scaling: timeout **10 min**; basic/manual goes up to **24h**; Flexible **60 min**.
- The App Engine region is **immutable** — a wrong choice requires a new project.
- Standard Python/PHP from generation V1 has a restricted network; V2 and Go/Java V1 don't have that restriction.
- Disk in Flexible is **ephemeral** — don't use it as permanent storage.
- Scaling is configured in **app.yaml**, not via a deploy flag.

## Sources

- https://docs.cloud.google.com/appengine/docs/the-appengine-environments
- https://docs.cloud.google.com/appengine/docs/standard/how-instances-are-managed
- https://cloud.google.com/appengine/docs/flexible/flexible-for-standard-users
