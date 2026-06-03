# 12 — Cloud KMS (Encryption)

## What it is
- **Cloud KMS** (Key Management Service) = managed service to create, use, rotate, and destroy cryptographic keys. **≈ AWS KMS**.
- Creates **symmetric** and **asymmetric** keys; exposes an API for **encrypt / decrypt / sign**.
- Hierarchy: **Key Ring** (groups keys, has a *location*) → **Key** → **Key Version**.
- **Protection levels**: `SOFTWARE`, `HSM` (≈ AWS CloudHSM), `EXTERNAL` (EKM).
- Solves encryption for the 3 data states: **at rest**, **in transit**, **in use**.

## When to use
- You want to **control** the at-rest encryption keys of GCP services (GCS, Compute disks, Cloud SQL, BigQuery) → **CMEK**.
- You need **HSM** due to a regulatory/compliance requirement.
- You want to encrypt/decrypt/sign small data (≤ 64 KiB) or **wrapped DEKs** via the API.
- If you do NOT want to manage anything: leave the default **Google-managed** (it's on out of the box).

## Key points
- **Symmetric**: the same key encrypts and decrypts (fast; the challenge = sharing the key). **Asymmetric**: public key encrypts / private key decrypts (RSA).
- **Purpose** of the key is chosen at creation: symmetric encrypt/decrypt, asymmetric decrypt, asymmetric sign.
- **Envelope encryption**: a **DEK** (Data Encryption Key) encrypts the data → the DEK is *wrapped* by the **KEK** (Key Encryption Key) that lives in KMS and **never leaves**. 1 KEK protects N DEKs. CMEK = the KEK is yours.
- **Rotation**: symmetric → **automatic** (rotation period, generates new versions); asymmetric → **manual**.
- **IAM**: grant `roles/cloudkms.cryptoKeyEncrypterDecrypter` **on the key** to the service account/agent that will use it.
- Key Ring is **global** or **regional**; **External (EKM)** only on a regional ring, not global.
- Enable the **KMS API** before using it.

## Command/CLI (reference)
```
gcloud services enable cloudkms.googleapis.com
gcloud kms keyrings create my-keyring --location=global
gcloud kms keys create my-key --keyring=my-keyring --location=global \
    --purpose=encryption --rotation-period=90d --next-rotation-time=...
# grant usage permission to a service account
gcloud kms keys add-iam-policy-binding my-key --keyring=my-keyring --location=global \
    --member=serviceAccount:SA_EMAIL --role=roles/cloudkms.cryptoKeyEncrypterDecrypter
```

## Exam traps
- **Google-managed × CMEK × CSEK** (the most tested distinction):
  - **Google-managed**: Google creates/rotates, **default**, zero config, no extra cost. ≈ AWS SSE with an AWS-owned key.
  - **CMEK** (Customer-Managed): you create/manage the **KEK in Cloud KMS**; you control rotation, IAM, destruction. ≈ AWS customer managed key.
  - **CSEK** (Customer-Supplied): you **supply your own AES-256** key from outside; Google does **not store** the key; only GCS and Compute Engine. ≈ AWS **SSE-C**.
- At-rest encryption is **always on** by default — CMEK/CSEK only change *who controls the key*, they don't "turn on" encryption.
- Cloud KMS does **not** encrypt large data directly (**64 KiB limit**) → use **envelope encryption** (wrap a DEK).
- **DEK ≠ KEK**: the DEK encrypts the data; the KEK (the one in KMS) encrypts the DEK.
- Rotation is **automatic only for symmetric** keys; asymmetric is manual.
- **External (EKM)** unavailable on a **global** key ring.
- Classic demo error: a VM/service without `cryptoKeyEncrypterDecrypter` on the key → fails when using CMEK.

## Sources
- https://docs.cloud.google.com/kms/docs/envelope-encryption
- https://cloud.google.com/kms/docs/cmek
- https://docs.cloud.google.com/kms/docs/protection-levels
- https://cloud.google.com/kms/docs/key-rotation
