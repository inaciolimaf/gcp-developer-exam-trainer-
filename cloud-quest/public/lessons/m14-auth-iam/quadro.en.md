# 14 — Authentication and Authorization with Cloud IAM

## What it is
- **Cloud IAM** = control over who (member) can do what (role) on which resource. Cousin of **AWS IAM**.
- **authN** (authentication) = "are you who you say you are?" → identity (Google account, service account, token).
- **authZ** (authorization) = "are you allowed?" → IAM evaluates permission on the resource.
- Model: **member** + **role** → **binding** in a **policy** attached to the resource.
- **Service account (SA)** = non-human identity (app/VM). Equivalent to the IAM role of an EC2 (instance profile). Email + RSA key pair, no password.
- **ADC** (Application Default Credentials) = strategy client libraries use to find credentials automatically.

## When to use
- App/VM accesses a GCP resource → **attached service account** (keys managed and rotated by Google).
- App **on-premises** → SA with short-lived credentials; avoid SA key JSON.
- Same code locally and in prod without changes → **ADC**.
- Uniform access on the bucket → **IAM**. Per-object access → **ACL**.
- Temporary access for someone without a Google account → **signed URL**.
- Only billing/quota, no identity → **API key** (authorizes nothing).

## Key points
- **3 role types**: basic (owner/editor/viewer — broad, do NOT use in prod), predefined (granular, Google-managed, e.g. `storage.objectViewer`), custom.
- The **default** SA of Compute/App Engine historically came with the **Editor** role → too broad; prefer a user-managed SA. (Orgs created after May 2024 no longer receive the automatic Editor.)
- **ADC lookup order**: 1) `GOOGLE_APPLICATION_CREDENTIALS`; 2) `gcloud auth application-default login`; 3) metadata server (inside GCP). Stops at the first one.
- **OAuth scopes ≠ IAM**: an extra layer that limits what the access token can reach.
- **API key does NOT identify a principal** → IAM cannot authorize; it only ties the request to the project (billing/quota).
- A SA's OAuth token expires in **1 hour** by default (short-lived).
- **IAM + ACL on GCS**: if either one grants access, access is granted.

## Command/CLI (reference)
```bash
# ADC for local development
gcloud auth application-default login

# Create a service account
gcloud iam service-accounts create my-sa --display-name="App SA"

# Grant a predefined role on a bucket (don't assign loose permissions)
gsutil iam ch serviceAccount:my-sa@PROJECT.iam.gserviceaccount.com:objectViewer gs://my-bucket

# Attach a SA to a VM (Compute Engine)
gcloud compute instances create vm1 --service-account=my-sa@PROJECT.iam.gserviceaccount.com --scopes=cloud-platform

# Signed URL (temporary access, e.g. 10 min)
gsutil signurl -d 10m KEY.json gs://my-bucket/object.txt

# View a resource's policy
gcloud projects get-iam-policy PROJECT
```

## Exam traps
- **authN vs authZ**: IAM is authZ (authorization). Don't confuse it with login/identity (authN).
- **API key does not authenticate an app with permissions** → use a service account. API key = billing/quota.
- **Basic roles in production** = wrong; the right answer is almost always **predefined role**.
- **OAuth scope ≠ IAM role**: a scope limits the token, a role grants permission. They are distinct layers.
- **Don't delete a SA in use** by running VMs → apps lose access to resources.
- **SA key JSON** is the least secure path; prefer ADC / short-lived credentials.
- GCS: if you only need **uniform** permission on the bucket, use IAM; ACL is for **per-object** granularity.
- The **metadata server** provides credentials automatically inside GCP — no hardcoded keys.

## Sources
- https://docs.cloud.google.com/docs/authentication/application-default-credentials
- https://cloud.google.com/docs/authentication
- https://docs.cloud.google.com/docs/authentication/api-keys
- https://docs.cloud.google.com/iam/docs/service-account-overview
