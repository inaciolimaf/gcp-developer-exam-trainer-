# 05 — Instance Groups & Cloud Load Balancing

## What it is
- **Instance Group**: collection of VMs treated as a single unit for load balancing.
  - **Unmanaged**: heterogeneous VMs grouped by hand. No template, no autoscaling/auto-healing/rolling update. Legacy cases only.
  - **Managed (MIG)**: identical VMs created from an **instance template**. ≈ **Auto Scaling Group** (AWS). Provides autoscaling, auto-healing, rolling updates, and multi-zone (zonal/regional).
- **Instance template**: VM blueprint (machine type, image, disks, startup script). ≈ **Launch Template**. Immutable.
- **Cloud Load Balancing**: distributes traffic to backends (MIGs). Covers the role of **ELB/ALB/NLB**.
  - **Frontend**: IP + protocol + port (+ SSL certificate) where the client connects.
  - **Backend service**: points to the backends (MIGs), with health check and balancing policy.
  - **Host/path rules**: L7 routing (`/a` → service A, `/b` → service B) — HTTP(S) only.
  - **SSL/TLS termination (offload)**: HTTPS terminates at the LB; LB→VM via HTTP on Google's internal network.

## When to use
- **MIG** whenever you need scale, HA, or automatic updates. **Unmanaged** only with pre-existing/different VMs.
- **Regional MIG** (multi-zone) for high availability; zonal for simple cases.
- Choose the LB along 3 axes — **external/internal**, **global/regional**, **protocol**:
  - HTTP(S) with host/path routing → **Application Load Balancer** (≈ ALB).
  - TCP/SSL with proxy, SSL offload, or global → **Proxy Network Load Balancer**.
  - TCP/UDP preserving the client IP, or UDP/ESP/ICMP → **Passthrough Network Load Balancer** (≈ NLB).
  - Backends across multiple regions on a single IP → **global Application LB** (external).

## Key points
- **Only MIG does autoscaling and auto-healing.** Unmanaged neither scales nor heals.
- **Autoscaling policies**: CPU, **load balancing** capacity, or **Cloud Monitoring metrics**. You set min/max/target.
- **Auto-healing**: an **application** health check detects an unhealthy VM → the MIG **recreates** the VM. Autoscaling (quantity) and auto-healing (health) are independent.
- **Rolling updates / canary**: swap the template, the MIG replaces VMs gradually; canary = new version on only a fraction.
- **Only external LBs are global; internal ones are always regional.**
- New vs old naming: Application LB = "HTTP(S) LB"; Proxy Network LB = "TCP Proxy / SSL Proxy"; Passthrough Network LB = "Network LB (TCP/UDP)".

## Command/CLI (reference)
- Create template: `gcloud compute instance-templates create T --machine-type=... --image-family=...`
- Create regional MIG: `gcloud compute instance-groups managed create MIG --template=T --size=3 --region=REGION`
- Autoscaling: `gcloud compute instance-groups managed set-autoscaling MIG --max-num-replicas=10 --min-num-replicas=2 --target-cpu-utilization=0.6 --region=REGION`
- Auto-healing: `gcloud compute instance-groups managed update MIG --health-check=HC --initial-delay=300 --region=REGION`
- Rolling update: `gcloud compute instance-groups managed rolling-action start-update MIG --version=template=T2 --region=REGION`
- Health check: `gcloud compute health-checks create http HC --port=80 --request-path=/healthz`

## Exam traps
- "I want autoscaling/auto-healing" → the answer is **MIG**, never unmanaged.
- "Preserve the client IP" / UDP / ESP / ICMP → **Passthrough Network LB** (not Application, not Proxy).
- "Routing by URL path or host / microservices" → **Application LB** (L7).
- "Backends across multiple regions with a single IP / global anycast" → **external global Application LB**. Internal is **never** global.
- "SSL offload on TCP" → **Proxy** Network LB (SSL Proxy), not passthrough.
- Auto-healing uses an **application** health check; don't confuse it with the LB's backend service health check (they are separate checks).
- Autoscaling does **not** depend on auto-healing and vice versa — questions try to mix the two.
- The instance template is **immutable**: to change the fleet, create a new template + rolling update.

## Sources
- https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer
- https://docs.cloud.google.com/compute/docs/autoscaler
- https://cloud.google.com/compute/docs/instance-groups
- https://cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs
