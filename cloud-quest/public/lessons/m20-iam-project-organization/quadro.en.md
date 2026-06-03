# 20 — IAM & Project Organization

## What it is
- **Resource hierarchy**: tree that organizes everything in GCP — `Organization → Folder → Project → Resource`.
  - Organization = top (company) → AWS anchor: **AWS Organization**.
  - Folder = optional grouping (e.g., department) → AWS anchor: **OU**.
  - Project = fundamental unit; groups resources and requires a billing account → AWS anchor: **account**.
  - Resource = VM, bucket, DB, etc.
- **Cloud IAM** ≈ **AWS IAM**: controls *who* (member) can do *what* (role) on *which* resource.
- **IAM policy** = list of **bindings**. **Binding** = `member + role` attached to a resource.
- **Members / principals**: User, Group, Service Account, Workspace domain, `allUsers` (public), `allAuthenticatedUsers`.

## When to use
- **Project per app, per environment** (A1-Dev, A1-Prod, A2-Dev, A2-Prod) → Dev/Prod isolation.
- **Folder per department** or for shared resources.
- **Group** whenever possible: bind the role to the group, manage people joining/leaving the group.
- **Dedicated service account** per application, with minimal permissions (don't share a "wildcard" SA).
- **Basic roles** only if there's no alternative; prefer **predefined**; **custom** when no predefined fits.

## Key points
- **3 role types**:
  - **Basic / primitive**: Owner, Editor, Viewer — broad, whole project, avoid in prod.
  - **Predefined**: granular, maintained by Google per service — recommended.
  - **Custom**: you define the set of permissions — maximum control, supports least privilege.
- **Policy inheritance**: definable at any level (org/folder/project/resource).
  - Resources **inherit** the policies of their parents.
  - Effective policy = **UNION** (resource + all ancestors) → **additive** and **transitive**.
  - **You can't restrict at a lower level what was granted higher up** (allow policy doesn't deny).
- **Principle of least privilege**: grant only the minimum needed.
- **Separation of duties**: sensitive actions involve 2+ people (e.g., App Engine Deployer vs Service Admin).
- **Service account** = identity of an application/resource (not a person).
- **Where to grant access**: at the level where the **resource** lives (bucket in Project B → role in Project B).
- Corporate identity: **Cloud Identity / Google Workspace**; federation with AD/Azure AD via SAML/SSO.
- Free trial has no Organization/Folders — only standalone projects.

## Command/CLI (reference)
```bash
# Grant a binding (member + role) on a project
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:ana@exemplo.com" --role="roles/storage.objectViewer"

# Same concept for a service account as member
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:vm-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# View the effective policy
gcloud projects get-iam-policy PROJECT_ID

# Create service account / custom role
gcloud iam service-accounts create vm-sa --display-name="VM SA"
gcloud iam roles create meuRole --project=PROJECT_ID --permissions=storage.objects.get
```

## Exam traps
- **Inheritance is additive**: a permission granted at the Organization/Folder **cannot** be removed at a lower level. Don't confuse this with AWS Deny.
- **Effective policy = union** with parents (transitive), not replacement.
- **Basic ≠ recommended**: if the question asks for least privilege, the answer is **predefined** or **custom**, never Owner/Editor.
- **allUsers = public on the internet** — almost always wrong when restricted access is requested.
- **Cross-project access**: grant the role where the **resource** is (Project B), to the VM's **service account** (not to Project A).
- **Service account is a member AND can receive roles** — it's an identity, not a person.
- Free trial: **no Organization/Folders**; they require Cloud Identity/Workspace.
- Billing: each project links to 1 billing account; one billing account serves multiple projects.

## Sources
- https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy
- https://docs.cloud.google.com/iam/docs/resource-hierarchy-access-control
- https://docs.cloud.google.com/iam/docs/roles-overview
- https://docs.cloud.google.com/iam/docs/overview
