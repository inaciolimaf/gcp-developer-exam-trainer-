# 13 — Cloud Storage (Object Storage)

## What it is
- Managed, scalable object storage from Google Cloud. AWS equivalent: **Amazon S3**.
- Model: **buckets** contain **objects** (key-value pairs).
- Bucket name: **globally unique**, 3-63 chars, lowercase/numbers/`-`/`_`/`.`, cannot contain `goog`/`google`. Appears in the object's URL.
- Object: **key** unique within the bucket; max size **5 TB**; unlimited objects per bucket.
- Durability: **eleven nines (99.999999999%)** annually across all classes; low latency on all (≠ Glacier).

## When to use
- Media files, backups, logs, data lake, static assets, staging on-prem → cloud.
- **Standard** — hot data / short-lived. No minimum.
- **Nearline** — accessed ~1x/month. Minimum **30 days**.
- **Coldline** — accessed ~1x/quarter. Minimum **90 days**.
- **Archive** — accessed < 1x/year. Minimum **365 days**.
- Default storage class on the bucket, but it can be set **per object**.

## Key points
- **Lifecycle management**: conditions (age, createdBefore, isLive, matchesStorageClass, numNewerVersions) → `SetStorageClass` or `Delete` actions.
  - Transitions only go colder: Standard → Nearline/Coldline/Archive; Nearline → Coldline/Archive; Coldline → Archive.
- **Versioning**: enabled on the bucket; **live** vs **noncurrent** version; identified by `key + generation number`. Deleting live → becomes noncurrent; deleting noncurrent → gone for good.
- **IAM vs ACL**: two parallel systems (whichever grants access → access). IAM = recommended, bucket level. ACL = legacy, per object, inherited for S3 interop.
- **Uniform bucket-level access**: disables ACLs, IAM only. After 90 days active, cannot be turned off.
- **Signed URLs**: temporary read/write access without a Google account. AWS equivalent: **S3 presigned URLs**.
- **Location types**: `region` | `dual-region` | `multi-region`.

## Command/CLI (reference)
```bash
# Cloud Storage uses gsutil (NOT gcloud) — gcloud storage also exists
gcloud config set project MY_PROJECT

gsutil mb gs://my-bucket-name              # make bucket
gsutil ls gs://my-bucket-name              # list live objects
gsutil ls -a gs://my-bucket-name           # include noncurrent versions
gsutil cp arquivo.txt gs://my-bucket/      # upload / copy
gsutil mv gs://b1/obj gs://b2/obj          # move/rename
gsutil rewrite -s nearline gs://b/obj      # change object's storage class

# lifecycle and versioning
gsutil lifecycle set rules.json gs://my-bucket
gsutil versioning set on gs://my-bucket

# signed URL (10 min)
gsutil signurl -d 10m KEY.json gs://my-bucket/obj
```

## Exam traps
- **gsutil**, not gcloud, in the classic flow (gcloud storage is the newer alternative).
- All classes have the **same durability and the same low latency**; what changes is storage cost, retrieval cost and **minimum storage duration**.
- Deleting before the minimum (30/90/365 days) triggers an **early deletion fee**.
- Bucket name is **global**, not per project/region.
- Lifecycle only transitions **to colder classes**, never warms up.
- Uniform bucket-level access becomes **irreversible after 90 days**.
- Signed URL = access **without needing a Google account**; don't confuse it with IAM (which requires an identity).
- Object max **5 TB**; number of objects is unlimited.
- Versioning increases cost — combine it with lifecycle (`numNewerVersions` / `daysSinceNoncurrentTime`) to clean up.

## Sources
- https://docs.cloud.google.com/storage/docs/storage-classes
- https://docs.cloud.google.com/storage/docs/access-control
- https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access
- https://docs.cloud.google.com/storage/docs/access-control/signed-urls
