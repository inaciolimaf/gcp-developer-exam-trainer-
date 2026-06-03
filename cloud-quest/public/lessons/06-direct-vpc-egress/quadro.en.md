# Direct VPC egress (Cloud Run → VPC)

## What it is
- Connects Cloud Run (service/job) to the VPC **without a connector / without a proxy**.
- The instance gets an IP **directly from one of your subnets** and talks to private-IP resources (internal Cloud SQL, Memorystore, GCE, etc.).
- AWS equivalent: **Lambda in a VPC** (ENI in your subnet). Connector ≈ proxy/NAT in the middle of the path.
- The **recommended** approach by Google (GA); connector = legacy.

## When to use
- **Direct VPC egress (default):** lower cost, higher throughput, scales to zero. Use it when in doubt.
- **Serverless VPC Access connector:** when you need a **fixed egress IP** without setting up Cloud NAT, or faster **cold start / autoscaling from zero**.

## Key points
Direct egress vs Connector:

| | Direct VPC egress | VPC Access connector |
|---|---|---|
| Infra | none (no proxy) | a managed VM group |
| Cost | network egress only (scales to zero) | egress **+ VM compute** |
| Throughput | ~**1 Gbps/instance** (~2x) | lower (extra hop) |
| IPs | uses more subnet IPs | uses fewer IPs |
| Firewall | **manual** | created automatically |
| Network tags | per revision (granular) | at the connector level |
| Autoscaling/cold start | slower (creates a NIC) | faster |

## Command/CLI (reference)
```bash
gcloud run deploy SERVICE \
  --image=IMAGE_URL \
  --network=NETWORK \
  --subnet=SUBNET \
  --network-tags=TAGS \
  --vpc-egress=all-traffic \   # or private-ranges-only
  --region=REGION
```
- `--vpc-egress`: `private-ranges-only` (RFC1918 only) vs `all-traffic` (everything through the VPC).

## Exam traps
- **Minimum subnet `/26`** (64 IPs). Direct egress consumes ~2x instances + buffer; smaller than that fails.
- **Firewall is NOT created automatically** — configure it by hand or traffic is blocked.
- **IPs are ephemeral** → never allowlist by individual IP. In firewall rules, allow the **entire subnet range**.
- Need a **fixed egress IP** → put **Cloud NAT** in front (or use a connector). Direct egress alone gives no fixed IP.
- "Cloud Run reaching a private-IP resource" → modern/default answer = **Direct VPC egress**.

## Sources
- https://docs.cloud.google.com/run/docs/configuring/connecting-vpc
- https://docs.cloud.google.com/run/docs/configuring/vpc-direct-vpc
- https://cloud.google.com/blog/products/serverless/direct-vpc-egress-for-cloud-run-is-now-ga
