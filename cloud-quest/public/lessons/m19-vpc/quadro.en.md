# 19 — VPC (Private Networks)

## What it is
Virtual Private Cloud: the private, isolated network where you place your resources on GCP. Equivalent to **Amazon VPC**, with one central difference: on GCP the **VPC is GLOBAL** (it spans all regions), whereas on AWS it is regional.

- **VPC** = **global** resource (includes routes and firewall rules).
- **Subnet** = **regional** resource (defines the CIDR block / IP range). On AWS the subnet is zonal.
- Resources from any region can live in the same VPC.
- Default pattern: public subnet (load balancer) + private subnet (VM/DB).

## When to use
- **Always** create GCP resources inside a VPC (isolation + secure internal communication).
- **Separate subnets** for public vs private, or to spread across multiple regions (HA).
- **VPC Peering**: connect two VPCs (same project, different projects, or different orgs) via internal IP.
- **Shared VPC**: share one network across multiple projects in the same organization.
- **Private Google Access**: a VM with no external IP that needs to talk to Google APIs.

## Key points
- **Firewall rules**: stateful (the response comes back automatically), priority 0–65535 (0 = highest), they live in the VPC and are **global**.
- **Implicit** rules (not deletable): **deny all ingress** + **allow all egress**.
- The default VPC has 4 extra rules (priority 65534): allow-internal, allow-ssh (22), allow-rdp (3389), allow-icmp.
- **System routes** connect all subnets of the VPC automatically.
- **Peering is NOT transitive**: A↔B and B↔C does not give A↔C; admins do not inherit permission on the peer VPC.
- **Shared VPC**: created at the org/folder level; **host project** (holds the network) + **service projects** (consume it). Requires the **Shared VPC Admin** role.
- **Private Google Access**: access to Google services without an external IP and without going through the public Internet.

## Command/CLI (reference)
```bash
# Create a VPC in custom mode (no automatic subnets)
gcloud compute networks create minha-vpc --subnet-mode=custom

# Create a regional subnet with CIDR
gcloud compute networks subnets create sub-priv \
  --network=minha-vpc --region=us-central1 --range=10.0.0.0/24

# Enable Private Google Access on the subnet
gcloud compute networks subnets update sub-priv \
  --region=us-central1 --enable-private-ip-google-access

# Firewall rule (ingress allow)
gcloud compute firewall-rules create allow-ssh \
  --network=minha-vpc --allow=tcp:22 --priority=1000

# VPC Peering (create on both sides)
gcloud compute networks peerings create peer-a-b \
  --network=vpc-a --peer-network=vpc-b
```

## Exam traps
- **VPC is GLOBAL, subnet is REGIONAL.** Different from AWS (VPC regional, subnet zonal).
- Ingress is **denied by default**; egress is **allowed by default** (implicit, non-deletable rules).
- **Peering is not transitive** — you need explicit peering between each pair.
- Firewall is per **VPC/network**, not per subnet; priority **lower number = higher priority**.
- Private VM that needs a Google API without an external IP = **Private Google Access**.
- Shared VPC = **one** host project + multiple service projects, at the **organization/folder** level.

## Sources
- https://cloud.google.com/vpc/docs/vpc
- https://cloud.google.com/vpc/docs/vpc-peering
- https://cloud.google.com/firewall/docs/firewalls
- https://cloud.google.com/vpc/docs/private-google-access
