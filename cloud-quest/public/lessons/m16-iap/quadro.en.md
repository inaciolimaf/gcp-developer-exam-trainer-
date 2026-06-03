# 16 — Identity-Aware Proxy (IAP)

## What it is

Managed proxy that protects applications by **identity** (zero-trust / BeyondCorp model), not by network perimeter. It sits **in front** of the app and intercepts every request: authenticates via OAuth 2.0 (Google account) and authorizes via **IAM** before traffic reaches the backend.

- AWS equivalent: **AWS Verified Access** / the **ALB + Cognito** pattern.
- Main advantage: access to internal apps **without VPN and without a bastion host**.
- Protects: **App Engine, Cloud Run, GKE, Compute Engine, and on-premises apps**.

## When to use

- Expose an internal app to users without setting up a VPN.
- Centralize authn/authz outside the application code.
- SSH/RDP into a VM **without a public IP** (IAP TCP forwarding).
- Apply **context-aware access**: allow only from certain IPs/regions or trusted devices.

## Key points

- **Flow**: not authenticated → redirect to the OAuth 2.0 login. Authenticated → compare the user's IAM role against the resource policy → allow/deny.
- **Web app role**: `roles/iap.httpsResourceAccessor` (IAP-secured Web App User).
- **Tunnel/VM role**: `roles/iap.tunnelResourceAccessor` (IAP-secured Tunnel User).
- **Identity at the backend** via headers: `X-Goog-Authenticated-User-Email` and `X-Goog-Authenticated-User-Id`.
- **Signed headers (secure)**: signed JWT in `X-Goog-IAP-JWT-Assertion`. The app validates the signature against Google's public keys and checks the `audience`.
- **Context-aware access**: Access Levels (Access Context Manager) + IAM Conditions on the role binding (IP, region, device posture).
- **LB**: App Engine and Cloud Run can be enabled **without** an LB; Compute Engine and GKE go through Cloud Load Balancing.
- **GKE**: Secret (client ID/secret) → `BackendConfig` (iap) → annotation on the Service.

## Command/CLI (reference)

```bash
# Grant access to an IAP-protected web app
gcloud iap web add-iam-policy-binding \
  --resource-type=app-engine \
  --member='user:dev@example.com' \
  --role='roles/iap.httpsResourceAccessor'

# SSH into a VM without a public IP (TCP forwarding)
gcloud compute ssh my-vm --tunnel-through-iap --zone=us-central1-a

# Grant a user access to the TCP tunnel
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member='user:dev@example.com' \
  --role='roles/iap.tunnelResourceAccessor'
```

```yaml
# GKE: BackendConfig enabling IAP from a Secret
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: my-backendconfig
spec:
  iap:
    enabled: true
    oauthclientCredentials:
      secretName: my-secret        # Secret with client_id / client_secret
---
# Service points to the BackendConfig
apiVersion: v1
kind: Service
metadata:
  annotations:
    cloud.google.com/backend-config: '{"default": "my-backendconfig"}'
```

```python
# Validate the signed JWT at the backend (signed headers)
from google.auth.transport import requests
from google.oauth2 import id_token

jwt = request.headers.get("X-Goog-IAP-JWT-Assertion")
info = id_token.verify_token(
    jwt, requests.Request(),
    audience=EXPECTED_AUDIENCE,           # /projects/NUM/apps/PROJECT_ID
    certs_url="https://www.gstatic.com/iap/verify/public_key",
)
email = info["email"]
```

## Exam traps

- **Text headers (`X-Goog-Authenticated-User-*`) are NOT trustworthy on their own** — they can be forged if the backend is reachable directly. Use the **signed JWT** (`X-Goog-IAP-JWT-Assertion`) and validate the signature + `audience`.
- IAP **does not replace** internal service-to-service authentication — it's **end-user** authn/authz.
- "Access a VM without a public IP / without a bastion / without a VPN" → the answer is **IAP TCP forwarding** (`--tunnel-through-iap`), not Cloud NAT or a VPN.
- Web app vs tunnel: different roles — `iap.httpsResourceAccessor` (HTTPS/web) ≠ `iap.tunnelResourceAccessor` (TCP/SSH).
- Context-aware access = **Access Levels + IAM Conditions**, not firewall rules.
- IAP intercepts **before** the backend; an authz failure blocks the request without the app code ever running.

## Sources

- https://docs.cloud.google.com/iap/docs/concepts-overview
- https://cloud.google.com/iap/docs/signed-headers-howto
- https://docs.cloud.google.com/iap/docs/cloud-iap-context-aware-access-howto
- https://docs.cloud.google.com/iam/docs/roles-permissions/iap
