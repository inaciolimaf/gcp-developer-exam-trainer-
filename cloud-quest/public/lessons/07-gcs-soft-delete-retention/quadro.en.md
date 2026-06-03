# Cloud Storage: Soft Delete and Locked Retention Policies (immutability/compliance)

## What it is
- **Soft delete**: the bucket's automatic "trash bin". A deleted/overwritten object becomes `soft-deleted` and is recoverable for a period. On by default.
- **Object versioning** ≈ **S3 Versioning**: keeps previous versions (noncurrent) on every overwrite/delete; you control the cleanup (lifecycle).
- **Retention policy + bucket lock** ≈ **S3 Object Lock (compliance mode)**: minimum retention period; once *locked*, it becomes immutable WORM.
- **Object retention lock**: per-object retention (instead of a single policy for the entire bucket).

## When to use
- **Soft delete**: protection against accidental/malicious deletion, with no configuration needed. Short-term recovery.
- **Versioning**: version history, rollback, change auditing.
- **Locked retention**: regulatory compliance (FINRA, SEC, CFTC, healthcare) — proving immutability.

## Key points
- Soft delete: **default ON**; default retention **7 days**; range **7 to 90 days**; **0 = disabled**.
- Soft-deleted: cannot be read/modified, only **listed** and **restored**; **incurs cost** until it expires.
- Retention policy: delete/overwrite before the minimum age → **403 `retentionPolicyNotMet`** error; applies retroactively.
- **Lock is irreversible**: you cannot remove it, shorten it, or undo the lock; you can **only increase** the duration.
- A bucket with retention cannot be deleted until all objects have met the period.
- All three coexist in the same bucket; deleting a noncurrent version → it becomes soft-deleted.

## Command/CLI (reference)
```
# Soft delete (configure / disable)
gcloud storage buckets update gs://BUCKET --soft-delete-duration=30d
gcloud storage buckets update gs://BUCKET --soft-delete-duration=0

# Restore
gcloud storage restore gs://BUCKET/OBJECT#GENERATION

# Versioning
gcloud storage buckets update gs://BUCKET --versioning

# Retention policy + lock (IRREVERSIBLE)
gcloud storage buckets update gs://BUCKET --retention-period=1y
gcloud storage buckets update gs://BUCKET --lock-retention-period
```

## Exam traps
- "Cannot reduce or remove" / "regulatory" / "WORM" → **locked retention policy** (not versioning, not soft delete).
- "Recover an object deleted by mistake without having configured anything" → **soft delete** (default ON, 7 days).
- "Keep previous versions of an object" → **object versioning** (= S3 Versioning).
- Lock only allows **increasing** the duration; shortening/removing is impossible — a no-going-back decision.
- Soft delete does **not** prevent deletion; it keeps what was deleted. What *prevents* deletion is the retention policy.
- Soft-deleted objects **cost** money; for temporary data, use a separate bucket with soft delete OFF.
- Soft delete max = **90 days**, not infinite.

## Sources
- https://docs.cloud.google.com/storage/docs/soft-delete
- https://docs.cloud.google.com/storage/docs/bucket-lock
- https://docs.cloud.google.com/storage/docs/object-versioning
- https://docs.cloud.google.com/storage/docs/using-bucket-lock
