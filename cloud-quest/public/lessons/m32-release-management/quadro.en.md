# 32 — Release Management (Deployment Strategies)

## What it is
Release Management is the set of strategies for shipping a new version (v2) to production while controlling **downtime, cost, risk, and rollback speed**. AWS anchor: equivalent to what **CodeDeploy** does with in-place / blue-green / canary — same ideas, different names on GCP.

Classic strategies:
- **Recreate** — kills v1, brings up v2 on the same instances. Has downtime.
- **Rolling update** — updates in batches (window size); zero downtime. The *rolling with additional batch* variant spins up extra v2 instances before tearing down v1 (keeps capacity).
- **Blue/Green** — parallel v2 environment; instant switch of 100% of traffic; easy rollback. *Shadow testing* = mirrors real traffic to v2 without responding to the user.
- **Canary** — v2 on a subset, a slice of real traffic; promote if it passes. *A/B testing* = same mechanics, business focus (do users like the feature?).

## When to use
- **Recreate**: dev/test, app tolerates downtime, no need for backward compatibility, prioritizes cost and simplicity.
- **Rolling**: standard production, zero downtime without extra infra, tolerates a slow release. Default on GKE Deployment.
- **Rolling + additional batch**: rolling but without losing serving capacity during the release.
- **Blue/Green**: needs instant rollback and zero downtime, and can pay for double the infra temporarily.
- **Canary / A-B**: want to limit blast radius by validating v2 with real traffic before the full rollout.
- **Cloud Run**: revisions + traffic split for native canary/gradual/blue-green/rollback.
- **App Engine**: multiple versions + `set-traffic --splits` / `--migrate`.
- **GKE**: native RollingUpdate/Recreate; fine-grained canary/blue-green via service mesh (Istio/Anthos).

## Key points
| Strategy | Downtime | Extra infra | Rollback speed | Backward compat (v1+v2 together)? |
|---|---|---|---|---|
| **Recreate** | Yes (app goes down) | None | Slow (new recreate, downtime) | No (one version at a time) |
| **Rolling update** | No | None | Medium (roll back) | Yes |
| **Blue/Green** | No | Doubles (parallel environment) | Instant (switch back to blue) | Yes (v2 stays active) |
| **Canary** | No | None/little | Fast (cut the slice) | Yes |

- Whenever **two versions are active** (rolling, canary, blue/green), the database and services must be **backward compatible** with v1 and v2.
- A **Cloud Run revision** is immutable; each deploy creates a new one; traffic split is first-class.
- **GKE**: `maxSurge` = extra pods allowed; `maxUnavailable` = pods that can be down during the rollout.
- **App Engine split-by**: `IP` (sticky by IP hash) or `COOKIE` (`GOOGAPPUID`, more precise).

## Command/CLI (reference)
```
# Cloud Run — canary / gradual / blue-green / rollback
gcloud run deploy SERVICE --image IMG --no-traffic --tag green
gcloud run services update-traffic SERVICE --to-tags green=5      # canary 5%
gcloud run services update-traffic SERVICE --to-latest            # blue/green: 100%
gcloud run services update-traffic SERVICE --to-revisions REV=100 # rollback

# App Engine
gcloud app deploy --no-promote                                    # deploy with no traffic
gcloud app services set-traffic S --splits v2=1                   # 100% v2
gcloud app services set-traffic S --splits v1=.5,v2=.5 --split-by cookie
gcloud app services set-traffic S --splits v2=1 --migrate         # gradual migration

# GKE (Deployment): strategy.type = RollingUpdate | Recreate
kubectl rollout undo deployment/NAME                              # rollback
```

## Exam traps
- **Zero downtime + instant rollback + can pay double infra** → **Blue/Green**.
- **Validate v2 with a fraction of real users before the full rollout** → **Canary**. If the focus is "do users like the feature?" → **A/B testing**.
- **Lowest cost / simplest and downtime is acceptable** → **Recreate**.
- **Zero downtime without extra infra, release can be slow** → **Rolling update**.
- **Test with real production traffic without affecting the user** → **Shadow testing** (watch out for side effects, e.g., payment → use a stub).
- Cloud Run: a deploy doesn't change traffic if the previous revision was pinned; use `--to-latest` to send 100% to the new one.
- `gcloud app deploy --no-promote` (App Engine) ≈ `--no-traffic` (Cloud Run): deploys the version **without** receiving traffic.
- GKE has no native canary/blue-green "out of the box" in the Deployment — it needs a dual Service/Ingress or a **service mesh (Istio/Anthos Service Mesh)**; Spinnaker/Cloud Build for automation.

## Sources
- Cloud Run — Rollbacks, gradual rollouts, and traffic migration: https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration
- App Engine — Splitting traffic: https://docs.cloud.google.com/appengine/docs/standard/splitting-traffic
- Google Cloud Blog — Cloud Run gradual rollouts and rollbacks: https://cloud.google.com/blog/products/serverless/cloud-run-now-supports-gradual-rollouts-and-rollbacks
