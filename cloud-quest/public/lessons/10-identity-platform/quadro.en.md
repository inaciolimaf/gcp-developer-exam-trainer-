# Identity Platform (CIAM)

> AWS ≈ **Amazon Cognito** (User Pools). It is **NOT** AWS IAM.

## What it is
- GCP's **CIAM** (Customer Identity and Access Management) solution.
- Authentication of **YOUR app's end users** (web / mobile): sign-up, sign-in, session, tokens, password reset.
- Ships SDKs (web, iOS, Android) and UI libraries — you don't reimplement auth.
- It's the **enterprise backend of Firebase Authentication** (same engine).

## When to use
- An app that needs to log in customers/end users (not employees accessing GCP).
- You need **corporate federation** (OIDC / SAML) for B2B SaaS.
- You need **MFA**, **multi-tenancy**, blocking functions, or audit logging.
- Social login (Google, Facebook, Apple), email/password, phone (SMS), or anonymous.
- Plug **external users** behind **IAP** (Identity-Aware Proxy).

## Key points
- **Providers**: email/password, social, phone/SMS, anonymous, **OIDC**, and **SAML** (corporate IdP).
- **Firebase Auth vs Identity Platform**: Firebase Auth = subset (consumer). Upgrade → unlocks MFA, SAML, generic OIDC, multi-tenancy, blocking functions, audit logs.
- **MFA**: based on **SMS**; requires a **verified email** to enable.
- **Multi-tenancy**: **tenants** = isolated silos of users/config within the same project. The standard for **B2B**.
- **IAP**: by default uses Google identities + Cloud IAM; for external identities, it uses Identity Platform.
- **Pricing**: per **MAU** (monthly active users).

## Command/CLI (reference)
```bash
# Enable the API
gcloud services enable identitytoolkit.googleapis.com

# Create a tenant (multi-tenancy)
gcloud identity-platform tenants create "Cliente-A" \
  --allow-password-signup

# List tenants
gcloud identity-platform tenants list

# Config usually done via Console, Admin SDK, or Terraform
# (google_identity_platform_config / _tenant / _oauth_idp_config)
```

## Exam traps
- **Identity Platform ≠ Cloud IAM**. Identity Platform = app end users (CIAM). Cloud IAM = who accesses **GCP resources** (roles, service accounts).
- **Identity Platform ≠ Cloud Identity**. Cloud Identity is IDaaS for managing the organization's users/groups (employees), not app users.
- A question asking for **SAML + MFA + multi-tenancy** in a SaaS → **Identity Platform**, not basic Firebase Auth.
- "External users logging in behind IAP" → **Identity Platform** plugged into IAP, not plain IAM.
- MFA won't enable without a **verified email**.

## Sources
- https://cloud.google.com/security/products/identity-platform
- https://docs.cloud.google.com/identity-platform/docs/multi-tenancy
- https://docs.cloud.google.com/identity-platform/docs/web/mfa
- https://docs.cloud.google.com/docs/authentication/identity-products
