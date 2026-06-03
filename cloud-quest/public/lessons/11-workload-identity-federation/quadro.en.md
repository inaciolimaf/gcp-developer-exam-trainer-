# Workload Identity Federation (WIF)

## What it is
- Lets workloads from **OUTSIDE GCP** (AWS, Azure, GitHub Actions, GitLab, on-prem, OIDC/SAML) access GCP resources **without a service account key (JSON)**.
- OAuth 2.0 token exchange via **STS (Security Token Service)** → returns a **short-lived** credential.
- AWS equivalent: **IAM OIDC federation / `AssumeRoleWithWebIdentity`**; with an X.509 cert ≈ **IAM Roles Anywhere**.

## When to use
- An external workload needs to call GCP APIs: EC2/Lambda on AWS, a VM on Azure, CI/CD (GitHub Actions, GitLab), on-prem K8s.
- You want to **eliminate service account keys** (a long-lived secret).
- Do NOT use it for workloads inside GKE → see the trap.

## Key points
- **Workload Identity Pool**: container for external identities (1 per environment: dev/staging/prod).
- **Pool Provider**: trust relationship with the IdP (aws / oidc / saml).
- **Attribute mapping**: IdP claims → Google attributes; `google.subject` is required.
- **Attribute condition**: a **CEL** expression that filters who gets in (avoids confused deputy).
- Two access modes:
  - **Direct resource access** (recommended): IAM role directly on the external identity.
  - **Service account impersonation**: assume an SA via `roles/iam.workloadIdentityUser`.

## Command/CLI (reference)
```bash
# 1. Pool
gcloud iam workload-identity-pools create POOL_ID \
  --location=global --display-name="ext-pool"

# 2a. OIDC Provider (e.g. GitHub Actions)
gcloud iam workload-identity-pools providers create-oidc PROVIDER_ID \
  --workload-identity-pool=POOL_ID --location=global \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repo=assertion.repository" \
  --attribute-condition="assertion.repository=='org/repo'"

# 2b. AWS Provider
gcloud iam workload-identity-pools providers create-aws PROVIDER_ID \
  --workload-identity-pool=POOL_ID --location=global \
  --account-id=AWS_ACCOUNT_ID

# 3. Grant impersonation (SA mode)
gcloud iam service-accounts add-iam-policy-binding SA_EMAIL \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://.../workloadIdentityPools/POOL_ID/*"
```

## Exam traps
- **WIF (general) ≠ Workload Identity Federation for GKE.** General = identities from OUTSIDE GCP. For GKE = INSIDE the cluster (maps a **Kubernetes ServiceAccount**, pool managed by Google). A question mentioning "EC2/GitHub/Azure VM" → general WIF; "pod in GKE" → WIF for GKE.
- A service account **key** is the WRONG answer when the scenario asks for security/no static secret.
- The token is **short-lived** (STS), not a permanent credential.
- `google.subject` is the only **required** mapping.
- Without an **attribute condition** → confused deputy risk (any identity from the IdP gets in).
- **Direct resource access** is the current recommended path; impersonation still shows up on the exam.

## Sources
- https://docs.cloud.google.com/iam/docs/workload-identity-federation
- https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds
- https://docs.cloud.google.com/iam/docs/workload-identities
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
