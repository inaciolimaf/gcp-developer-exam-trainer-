# Study Guide — Google Cloud Professional Cloud Developer (PCD)

> Automated analysis cross-referencing **741 exam questions** (what gets tested) against **340 lectures / 22.2 h of course** (what is taught).
> Premise: *what shows up in the questions is what the exam tests.* Weights computed by AI classification of both ends using the **same taxonomy** (54 codes in `analysis/taxonomy.json`).

**Profile assumed:** you are already a developer and hold AWS Cloud Practitioner → introductory "what is the cloud" lectures were down-weighted; the focus is what is GCP-specific and what the exam covers.

---

## 0. Executive summary (read this first)

- **Course:** 37 modules · 340 lectures · **22.3 hours**.
- **Question bank:** 741 (sources: certificationexams.pro 491, open-exam-prep 100, certimaan 58, official sample 50, whizlabs 25, theserverside 20, vmexam 10).
- **Lean track (🟢+🟡):** 13.3 h. Skipping ⚪+🔴 **saves you 9.0 h (40%)**.
- **The biggest mismatch:** the course is *heavy on GKE and Compute Engine*; the exam is *heavy on serverless*. **Cloud Run is the 2nd most-tested topic and has only ~13 min of lecture.**
- **Study OUTSIDE the course (gaps):** Cloud Run (in depth), API management (Apigee/Endpoints/API Gateway), BigQuery, Memorystore, Secret Manager, Artifact Registry, Dataflow, Workload Identity. Details in §4 and §6.
- **Version warning:** the course is from ~Oct/2022. The current official guide (2024+) covers things that are **nowhere in your material** — generative AI (Gemini APIs), AI dev tools, AlloyDB, Cloud Workstations, Workflows, Direct VPC egress. **See §4.1** (verified lecture by lecture).

**How to read the levels:**

| Level | Meaning |
|---|---|
| 🟢 **Essential** | High exam density. Watch carefully. |
| 🟡 **Important** | Tested in a meaningful way. Watch it (you can speed up if you already know it). |
| ⚪ **Optional** | Lightly tested or redundant. Skim / 1.5–2x. |
| 🔴 **Skip** | Practically never tested and/or introductory content you already know. |
| ⭐ | Foundation/prerequisite: even if lightly tested on its own, it underpins hot topics — don't skip blindly. |

---

## 1. Weight of each topic on the exam × minutes the course spends

`Weight` = questions that test the topic (primary = 1.0; secondary = 0.5). `#Q` = number of questions that touch the topic (primary+secondary). `min(prim)` = minutes of lecture where the topic is the MAIN SUBJECT. `Status` compares testing × teaching.

| # | Topic | Weight | #Q | min(prim) | #lectures(prim) | Domain | Status |
|---:|---|---:|---:|---:|---:|:--:|---|
| 1 | **GKE** · Kubernetes Engine (GKE) | 131.0 | 184 | 206 | 47 | S3 | ✓ balanced |
| 2 | **CLOUDRUN** · Cloud Run | 81.5 | 116 | 13 | 2 | S3 | 🔴 **GAP** — tested, poorly taught |
| 3 | **GCS** · Cloud Storage | 72.5 | 95 | 50 | 13 | S1 | 🟠 under-taught |
| 4 | **IAM** · IAM roles & service accounts | 58.5 | 85 | 64 | 16 | S1 | ✓ balanced |
| 5 | **PUBSUB** · Pub/Sub | 50.0 | 68 | 24 | 6 | S4 | 🟠 under-taught |
| 6 | **CLOUDBUILD** · Cloud Build | 45.5 | 56 | 54 | 18 | S2 | ✓ balanced |
| 7 | **ARCH** · Architecture & design patterns | 45.0 | 72 | 30 | 12 | S1 | 🟠 under-taught |
| 8 | **CLOUDFUNC** · Cloud Functions | 43.5 | 60 | 34 | 8 | S3 | ✓ balanced |
| 9 | **AUTHN** · Authentication (ADC/OAuth/JWT) | 41.0 | 50 | 34 | 7 | S1 | ✓ balanced |
| 10 | **FIRESTORE** · Firestore / Datastore | 40.0 | 53 | 29 | 8 | S1 | ✓ balanced |
| 11 | **GCE** · Compute Engine / VMs | 34.0 | 50 | 131 | 27 | S1 | 💤 over-taught (cut) |
| 12 | **DEPLOYSTRAT** · Release / deployment strategies | 33.5 | 41 | 36 | 11 | S3 | ✓ balanced |
| 13 | **DEVENV** · Dev environment / SDK / gcloud | 33.0 | 44 | 28 | 6 | S2 | ✓ balanced |
| 14 | **LOGGING** · Cloud Logging | 31.5 | 40 | 29 | 7 | S4 | ✓ balanced |
| 15 | **APIMGMT** · API mgmt (Apigee/Endpoints/Gateway) | 28.0 | 32 | 4 | 1 | S1 | 🔴 **GAP** — tested, poorly taught |
| 16 | **CLIENTLIB** · Client Libraries / API consumption | 28.0 | 39 | 20 | 5 | S4 | ✓ balanced |
| 17 | **MONITORING** · Cloud Monitoring | 27.0 | 41 | 24 | 7 | S4 | ✓ balanced |
| 18 | **BIGQUERY** · BigQuery | 24.0 | 35 | 6 | 2 | S4 | 🔴 **GAP** — tested, poorly taught |
| 19 | **DBCHOICE** · Choosing the right storage/DB | 22.0 | 40 | 16 | 6 | S1 | ✓ balanced |
| 20 | **VPC** · VPC & networking | 20.5 | 33 | 46 | 13 | S1 | ✓ balanced |
| 21 | **SPANNER** · Cloud Spanner | 20.0 | 22 | 22 | 7 | S1 | ✓ balanced |
| 22 | **APPENGINE** · App Engine | 19.5 | 28 | 63 | 14 | S3 | 💤 over-taught (cut) |
| 23 | **CLOUDSQL** · Cloud SQL | 19.0 | 27 | 24 | 8 | S1 | ✓ balanced |
| 24 | **ANTHOS** · Anthos / Cloud Service Mesh | 18.0 | 20 | 35 | 8 | S1 | ✓ balanced |
| 25 | **LB** · Load Balancing | 18.0 | 31 | 27 | 6 | S1 | ✓ balanced |
| 26 | **ARTIFACT** · Artifact / Container Registry | 17.0 | 31 | 6 | 1 | S2 | 🟠 under-taught |
| 27 | **BIGTABLE** · Bigtable | 16.0 | 18 | 13 | 3 | S1 | ✓ balanced |
| 28 | **DOCKER** · Containers / Docker | 15.5 | 26 | 19 | 3 | S2 | ✓ balanced |
| 29 | **WIF** · Workload Identity (Federation) | 13.0 | 16 | 9 | 1 | S1 | ✓ balanced |
| 30 | **MEMORYSTORE** · Memorystore / caching | 12.5 | 15 | 1 | 1 | S1 | 🔴 **GAP** — tested, poorly taught |
| 31 | **SECRETS** · Secret Manager | 11.0 | 12 | 3 | 1 | S1 | 🔴 **GAP** — tested, poorly taught |
| 32 | **DATAFLOW** · Dataflow / data processing | 10.5 | 12 | 0 | 0 | S4 | 🔴 **GAP** — tested, poorly taught |
| 33 | **SECSCAN** · Security scanning / SCC | 10.5 | 12 | 16 | 5 | S1 | ✓ balanced |
| 34 | **IAP** · Identity-Aware Proxy | 9.5 | 10 | 22 | 6 | S1 | ✓ balanced |
| 35 | **REGIONS** · Regions, zones & HA | 9.0 | 16 | 19 | 6 | S1 | ✓ balanced |
| 36 | **TRACE** · Cloud Trace | 8.5 | 11 | 4 | 2 | S4 | ✓ balanced |
| 37 | **DNS** · Cloud DNS | 7.5 | 10 | 0 | 0 | S1 | ✓ balanced |
| 38 | **BINAUTH** · Binary Authorization | 7.0 | 7 | 4 | 1 | S1 | ✓ balanced |
| 39 | **PROFILER** · Cloud Profiler | 7.0 | 7 | 2 | 1 | S4 | ✓ balanced |
| 40 | **EVENTARC** · Eventarc / Workflows | 6.5 | 7 | 11 | 2 | S1 | ✓ balanced |
| 41 | **SOURCEREPO** · Cloud Source Repositories | 6.0 | 11 | 0 | 0 | S2 | ✓ balanced |
| 42 | **KMS** · Cloud KMS / encryption | 6.0 | 8 | 14 | 4 | S1 | ✓ balanced |
| 43 | **CDN** · Cloud CDN | 4.5 | 6 | 6 | 1 | S1 | ✓ balanced |
| 44 | **ERRORREP** · Error Reporting | 4.5 | 6 | 3 | 1 | S4 | ✓ balanced |
| 45 | **BILLING** · Billing & cost optimization | 4.5 | 7 | 4 | 1 | S1 | ✓ balanced |
| 46 | **TASKS** · Cloud Tasks | 3.5 | 4 | 5 | 1 | S1 | ✓ balanced |
| 47 | **SCHED** · Cloud Scheduler | 3.0 | 4 | 4 | 1 | S1 | ✓ balanced |
| 48 | **ORG** · Resource hierarchy & org policy | 3.0 | 6 | 4 | 1 | S1 | ✓ balanced |
| 49 | **IAC** · Infrastructure as Code | 2.0 | 2 | 10 | 3 | S3 | · low relevance |
| 50 | **SRE** · SRE / SLO / DevOps practices | 2.0 | 3 | 30 | 7 | S4 | 💤 over-taught (barely tested) |
| 51 | **ALLOYDB** · AlloyDB | 1.0 | 1 | 0 | 0 | S1 | · low relevance |
| 52 | **DEBUGGER** · Cloud Debugger | 0.0 | 0 | 2 | 1 | S4 | · low relevance |
| 53 | **MARKETPLACE** · Marketplace | 0.0 | 0 | 7 | 1 | S1 | · low relevance |
| 54 | **FOUND** · Cloud/GCP fundamentals & course meta | 0.0 | 0 | 69 | 20 | S1 | 💤 over-taught (barely tested) |

**Weight by official domain (via taxonomy):**

| Domain | % in question bank | % official |
|---|---:|---:|
| S1 Design scalable/secure/reliable (~32%) | 48% | ~32% |
| S2 Build & test (~23%) | 10% | ~23% |
| S3 Deploy cloud-native (~24%) | 26% | ~24% |
| S4 Integration w/ GCP services (~21%) | 16% | ~21% |

> The bank skews toward S1 (design/service choice) and S4 (integration/observability). The real official exam gives more weight to deploy (S3, Cloud Run/GKE) and build/test (S2) than this older bank reflects — reinforce Cloud Run deployment.

---

## 2. ⚠️ GAPS — heavily tested, little or nothing taught

Topics with meaningful exam weight and insufficient lecture coverage. **This is where you lose points if you rely on the course alone.**

| Topic | Weight | #Q | min in course | Verdict |
|---|---:|---:|---:|---|
| **CLOUDRUN** · Cloud Run | 81.5 | 116 | 13 min | 🔴 CRITICAL — 2nd most-tested topic, ~13 min of lecture. Study it in depth. |
| **APIMGMT** · API mgmt (Apigee/Endpoints/Gateway) | 28.0 | 32 | 4 min | 🔴 Apigee/Endpoints/API Gateway: 1 lecture of 3.5 min for a weight of 28. |
| **BIGQUERY** · BigQuery | 24.0 | 35 | 6 min | 🟠 Well tested as an analytics destination; ~6 min of lecture. |
| **ARTIFACT** · Artifact / Container Registry | 17.0 | 31 | 6 min | 🟠 Artifact Registry: central to CI/CD, ~6 min in isolation. |
| **MEMORYSTORE** · Memorystore / caching | 12.5 | 15 | 1 min | 🟠 Cache/sessions: barely taught (~1 min). |
| **SECRETS** · Secret Manager | 11.0 | 12 | 3 min | 🟠 Secret Manager: ~3 min; tested a lot in security. |
| **WIF** · Workload Identity (Federation) | 13.0 | 16 | 9 min | 🟠 Workload Identity: recommended pattern for GKE→GCP, ~9 min. |
| **DATAFLOW** · Dataflow / data processing | 10.5 | 12 | 0 min | 🟠 0 min as a main subject; shows up in streaming pipelines. |
| **EVENTARC** · Eventarc / Workflows | 6.5 | 7 | 11 min | 🟡 Eventarc/Workflows: new in the official guide, light in the bank and course. |
| **CLIENTLIB** · Client Libraries / API consumption | 28.0 | 39 | 20 min | 🟡 API consumption (backoff, pagination, batching): tested, medium coverage. |
| **DNS** · Cloud DNS | 7.5 | 10 | 0 min | 🟡 Cloud DNS: 0 min as a main subject. |
| **SOURCEREPO** · Cloud Source Repositories | 6.0 | 11 | 0 min | 🟡 Cloud Source Repositories: 0 min as a main subject. |
| **PROFILER** · Cloud Profiler | 7.0 | 7 | 2 min | 🟡 Cloud Profiler: ~2 min. |
| **BINAUTH** · Binary Authorization | 7.0 | 7 | 4 min | 🟡 Binary Authorization: ~4 min; emphasized in the new official guide. |
| **TRACE** · Cloud Trace | 8.5 | 11 | 4 min | 🟡 Cloud Trace (trace IDs/spans): light coverage. |

**Over-taught (spend less time):** Compute Engine/VMs (~131 min for weight 34), App Engine (~63 min for weight 19 — *de-emphasized in the new exam*), conceptual SRE/DevOps (~30 min for weight 2), and the ~69 min of fundamentals/intro (weight 0).

---
## 3. 🎯 Module roadmap — what order to study in

Study **one whole module at a time** (no hunting for stray videos). The order is by *module exam payoff* — not by course order. Within each module, the 🟢/🟡/⚪/🔴 column shows how many lectures are worth it × how many you can speed through; the lecture-by-lecture detail is in §5.

### Phase 1 — Study FIRST (highest payoff)

The modules that come up the most. Watch carefully.

| Order | Module | min | 🟢/🟡/⚪/🔴 | Focus — what this module gives you |
|:--:|---|---:|:--:|---|
| 1 | **18** Getting Started with Cloud Build | 56 | 6/11/2/0 | CLOUDBUILD, DEPLOYSTRAT |
| 2 | **34** Architecture at 10,000 feet for Google Clo | 27 | 8/3/0/0 | APIMGMT, ARCH, BIGQUERY, LOGGING, PUBSUB |
| 3 | **28** Operations in Google Cloud Platform | 65 | 5/11/1/3 | LOGGING, MONITORING, ERRORREP, CLOUDFUNC, PROFILER |
| 4 | **11** Getting Started with Google Cloud Function | 43 | 6/3/0/0 | CLOUDRUN, CLOUDFUNC |
| 5 | **26** NoSQL in Google Cloud - Cloud Datastore, C | 42 | 5/6/0/0 | FIRESTORE, BIGTABLE |
| 6 | **15** Authorization for Kubernetes Workloads and | 52 | 5/6/3/0 | WIF, GKE |
| 7 | **09** Getting Started with Google Kubernetes Eng | 100 | 1/9/9/0 | GKE |
| 8 | **22** Choosing Databases in Google Cloud | 21 | 7/1/0/0 | MEMORYSTORE, DBCHOICE, BIGQUERY |
| 9 | **29** Exploring Security in Google Cloud | 26 | 5/4/0/0 | BINAUTH, SECSCAN, VPC, SECRETS |
| 10 | **14** Authentication and Authorization in Google | 60 | 1/6/7/0 | GCS, AUTHN, IAM |
| 11 | **27** Asynchronous Communication in Google Cloud | 31 | 6/1/0/0 | PUBSUB, TASKS, SCHED |

*11 modules · 523 min (8.7 h).*

### Phase 2 — Study LATER (medium payoff)

Tested in a meaningful way. Watch, speeding up what you already know.

| Order | Module | min | 🟢/🟡/⚪/🔴 | Focus — what this module gives you |
|:--:|---|---:|:--:|---|
| 1 | **10** Getting Started with Google Kubernetes Eng | 61 | 0/8/6/1 | GKE |
| 2 | **21** Exploring Google Cloud APIs and Client Lib | 24 | 3/4/0/0 | CLIENTLIB, GCS |
| 3 | **35** Course Updates - New Exam Guide - October  | 21 | 2/3/0/0 | EVENTARC, MONITORING, ARCH, AUTHN |
| 4 | **30** Getting Started with Anthos and Anthos Ser | 35 | 0/8/0/0 | ANTHOS |
| 5 | **13** Object Storage in Google Cloud Platform -  | 37 | 1/7/0/0 | GCS |
| 6 | **16** Authentication and Authorization with Iden | 35 | 0/8/1/0 | AUTHN, IAP |
| 7 | **08** Getting Started with Google App Engine | 63 | 0/1/13/0 | APPENGINE |
| 8 | **24** Connecting to Cloud SQL instances | 26 | 0/5/3/0 | AUTHN, IAM, VPC, CLOUDSQL |
| 9 | **31** Exploring Google Cloud Compute Engine VMs | 27 | 1/5/0/0 | GCE |
| 10 | **04** Google Compute Engine for Professional Clo | 88 | 0/1/17/1 | DEVENV |
| 11 | **05** Getting started with Instance Groups and C | 58 | 0/1/10/0 | LB |
| 12 | **25** Getting started with Cloud Spanner | 22 | 1/2/4/0 | SPANNER |
| 13 | **17** Exploring DevOps and SRE | 55 | 2/0/4/7 | CLOUDBUILD, ARTIFACT |
| 14 | **33** Google Cloud Developer - Best Practices | 17 | 1/2/2/0 | DEVENV, IAM |
| 15 | **07** Managed Services in Google Cloud Platform | 20 | 0/5/0/0 | ARCH, DOCKER |
| 16 | **32** Release Management in Google Cloud | 23 | 0/1/7/0 | DEPLOYSTRAT |
| 17 | **36** Case Study - Google Cloud Certified Profes | 8 | 1/1/0/1 | ARCH |

*17 modules · 621 min (10.4 h).*

### Phase 3 — Optional / can SKIP

Rarely tested and/or introductory — as a dev + AWS CCP, only if you have time to spare.

| Order | Module | min | 🟢/🟡/⚪/🔴 | Focus — what this module gives you |
|:--:|---|---:|:--:|---|
| 1 | **20** Exploring IAM and Project Organization in  | 23 | 0/1/5/0 | IAM |
| 2 | **19** Creating Private Networks with Google Clou | 35 | 0/0/9/0 | intro/support — can skip |
| 3 | **23** Getting started with Cloud SQL | 18 | 0/2/3/0 | CLOUDSQL |
| 4 | **06** Getting Started with Gcloud | 20 | 0/3/0/0 | DEVENV |
| 5 | **12** Encryption in Google Cloud with Cloud KMS | 14 | 0/1/3/0 | KMS |
| 6 | **03** Introduction to Regions and Zones | 19 | 0/0/6/0 | intro/support — can skip |
| 7 | **01** Google Cloud Certification - Professional  | 10 | 0/0/0/2 | intro/support — can skip |
| 8 | **02** Introduction to Cloud and Google Cloud | 44 | 0/0/0/10 | intro/support — can skip |
| 9 | **37** Google Cloud Professional Cloud Developer  | 7 | 0/0/0/3 | intro/support — can skip |

*9 modules · 191 min (3.2 h).*

### 🔻 In parallel: study OUTSIDE the course (gaps)

Independent of the modules — the course doesn't cover them. Priority order (concepts in §6, absent ones in §4.1):

1. **Cloud Run** in depth → 2. **API management** (Endpoints × Gateway × Apigee) → 3. **BigQuery** → 4. **Artifact Registry** → 5. **Secret Manager** + **Memorystore** → 6. **Workload Identity** + **Dataflow** → 7. **🆕 absent ones** (Gemini/AI, AlloyDB, Cloud Workstations, Workflows, Direct VPC egress).

---

## 4. 📚 Topics to study OUTSIDE the course

Prioritized. Concrete concepts for each in §6.

1. **Cloud Run** — deployment model, concurrency, min/max instances, revisions and traffic splitting, triggers (Eventarc/Pub/Sub), VPC egress. *(gap #1)*
2. **API management** — when to use Cloud Endpoints × API Gateway × Apigee; API keys, quotas/rate limiting, versioning.
3. **BigQuery** — streaming insert × batch, authorized views, roles (dataViewer/jobUser), Pub/Sub→Dataflow→BigQuery pipeline.
4. **Artifact Registry** — formats, vulnerability scanning (Artifact Analysis), integration with Cloud Build and Binary Authorization.
5. **Secret Manager** — versions, rotation, access via IAM/Workload Identity, integration with Cloud Build.
6. **Memorystore (Redis)** — cache/sessions, requires a Serverless VPC Access connector (same region/VPC).
7. **Workload Identity (Federation)** — `roles/iam.workloadIdentityUser`, short-lived tokens, no JSON keys.
8. **Dataflow** — streaming/batch pipelines, autoscaling, exactly-once, windowing; CDC with Datastream.
9. **Eventarc / Workflows** — orchestration and events (emphasized in the new official guide).
10. **Client Libraries** — exponential backoff+jitter, pagination, batching, partial response.
11. **Smaller but present:** Binary Authorization, Cloud DNS, Cloud Source Repositories, Cloud Profiler, Cloud Trace.
12. **In the new official guide, even more than in the bank:** AlloyDB, Cloud Service Mesh, Security Command Center / Web Security Scanner, Gemini Cloud Assist / Cloud Workstations.

### 4.1 🆕 Tested on the CURRENT exam and ABSENT from the course (the course is ~Oct/2022)

I confirmed this by scanning the titles and transcripts of ALL 340 lectures. These items are in the current official guide (2024+) but **the course doesn't teach them** — nor does the (older) 741-question bank cover them properly. **This is the riskiest content: it is nowhere in your material.**

| New topic | In course? | What the exam expects |
|---|:--:|---|
| **Generative AI in apps (Gemini APIs)** | ❌ 0 lectures | "Integrate ML capabilities" and "use generative AI APIs to build intelligent experiences" is now part of the PCD *profile*. Know how to call Gemini models via API/Vertex and GenAI app patterns. |
| **AI dev tools** | ❌ 0 lectures | Gemini Code Assist / Gemini Cloud Assist, *AI coding assistants*, *context engineering*, automated debug agents, writing unit tests with AI, AI-assisted observability. Cited across several sections of the new guide. |
| **AlloyDB** (+ AlloyDB Auth Proxy) | ❌ 0 lectures | High-performance managed Postgres; appears in "structured database choice" (alongside Spanner) and in authentication (AlloyDB Auth Proxy, analogous to the Cloud SQL Auth Proxy). |
| **Cloud Workstations** | ❌ 0 lectures | Managed cloud development environment (section 2.1, dev environment setup), alongside Cloud Shell / Cloud Code. |
| **Workflows** (orchestration) | ❌ 0 lectures | Orchestrate services with **Workflows** + Eventarc + Cloud Tasks + Cloud Scheduler (section 1.1). The course only gives an Eventarc *teaser* in module 35; Workflows doesn't appear. |
| **Direct VPC egress** | ❌ 0 lectures | Serverless→VPC connectivity without a connector (a modern alternative to Serverless VPC Access) for secure service-to-service communication. |
| **Cloud Storage soft delete / lock retention** | ❌ 0 lectures | *Locked* retention policies and *soft delete* for compliance/immutability — sections 1.2 and 1.3. |
| **Datastream (CDC)** | ❌ 0 lectures | Change Data Capture (CDC) to replicate Cloud SQL→BigQuery; appears in analytics/streaming scenarios. |

**Only *mentioned in passing* (1 short lecture, no depth — treat as absent):**

- **Eventarc** — only a "Quick Introduction" in module 35 (~6 min). The new exam seriously asks for Eventarc triggers for Cloud Run/Functions.
- **Identity Platform** — only a "Quick Introduction" in module 35. End-user authentication (CIAM).
- **Workload Identity Federation** (identities *outside* GCP) — mentioned in passing; the course teaches GKE Workload Identity, but not *federation* to AWS/OIDC.
- **Web Security Scanner** — cited within security, no demo.

**Watch out for REBRANDING (the course uses the old name):**

- **Cloud Service Mesh** = what the course calls **Anthos Service Mesh / Istio** (module 30). Same thing, new name in the guide. The concept is covered; the exam name is "Cloud Service Mesh".
- **Artifact Registry** replaced **Container Registry (gcr.io)** — the course still shows a lot of GCR; on the exam, the standard is Artifact Registry.
- **Cloud Operations** (formerly **Stackdriver**) — the course sometimes says Stackdriver.

**Announced change (keep an eye out):** Google signaled the exam will be updated to reflect the new *data and analytics stack* and the transition from **Vertex AI → Gemini Enterprise Agent Platform**. In other words, the weight of generative AI is likely to **increase** — exactly the part your course lacks.

> Sources: official PCD guide (PDF, Apr/2024), the certification page, and Google Cloud Next 2024 coverage on Gemini Code Assist.

---

## 5. Lecture-by-lecture guide (per module, course order)

`#Q` = questions that touch the lecture's main topic. `score` = the lecture's exam payoff.

### 01 - Google Cloud Certification - Professional Cloud Developer - Getting Started
*2 lectures · 10 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Introduction - Google Cloud Certification - Professio | 🔴 | 4 | FOUND | 0 | Course introduction and instructor welcome. |
| 02 - Course Overview - Google Cloud Certification - Profes | 🔴 | 6 | FOUND | 0 | Full course overview and section structure. |

### 02 - Introduction to Cloud and Google Cloud
*10 lectures · 44 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 Getting Started with Cloud Fundamentals | 🔴 | 2 | FOUND | 0 | Introduction to cloud computing fundamentals. |
| 02 - Step 02 Why Do Enterprises Need Thousands of Servers | 🔴 | 6 | FOUND | 0 | Why enterprises need thousands of servers. |
| 03 - Step 03 What Are The Challenges With Managing Data Ce | 🔴 | 9 | FOUND | 0 | Challenges and costs of running your own data centers. |
| 04 - Step 04 What is the Cloud | 🔴 | 4 | FOUND | 0 | What the cloud is: concept, elasticity and pay-as-you-go. |
| 05 - Step 05 What are the Advantages of Cloud | 🔴 | 8 | FOUND | 0 | Cloud advantages: CAPEX, OPEX, agility and global scale. |
| 06 - Step 06 Cloud Key Terminology to Remember | 🔴 | 4 | FOUND | 0 | Review of key cloud computing terminology. |
| 07 - Step 07 Cloud Concepts A Few Scenarios | 🔴 | 4 | FOUND | 0 | Practical scenarios to cement cloud concepts. |
| 08 - Step 08 Google Cloud An Introduction | 🔴 | 3 | FOUND | 0 | Introduction to Google Cloud: infrastructure and differentiators. |
| 09 - Step 09 What is The Best Way To Learn Cloud | 🔴 | 2 | FOUND | 0 | Best learning path and creating a GCP account. |
| 10 - Creating GCP - Google Cloud Platform - Account V2 | 🔴 | 2 | FOUND | 0 | Hands-on creation of a free Google Cloud Platform account. |

### 03 - Introduction to Regions and Zones
*6 lectures · 19 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 What is a Region | ⚪ | 5 | REGIONS | 16 | What regions are and why use multiple regions. |
| 02 - Step 02 Choosing The Right Region Factors | ⚪ | 2 | REGIONS | 16 | Factors for choosing a region: latency, compliance and price. |
| 03 - Step 03 Why Use Multiple Regions | ⚪ | 2 | REGIONS | 16 | Why use multiple regions: availability and DR. |
| 04 - Step 04 What is a Zone or Availability Zone | ⚪ | 3 | REGIONS | 16 | What availability zones and high availability are. |
| 05 - Step 05 Region and Zones A Review with Misconceptions | ⚪ | 5 | REGIONS | 16 | Regions and zones review: misconceptions and practical scenarios. |
| 06 - Step 06 Google Cloud Exploring Regions and Zones | ⚪ | 2 | REGIONS | 16 | Real examples of regions and zones in Google Cloud. |

### 04 - Google Compute Engine for Professional Cloud Developer
*19 lectures · 88 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 00 - Getting started with Google Compute Engine  | ⚪ | 1 | GCE | 50 | Introduction to the Google Compute Engine section. |
| ⭐02 - Step 01 - Getting started with Google Compute Engine  | ⚪ | 3 | GCE | 50 | Compute Engine fundamentals: creating and managing VMs. |
| 03 - Step 02 - Creating your first Virtual Machine in GCP | ⚪ | 6 | GCE | 50 | Hands-on creation of your first virtual machine in GCP. |
| 04 - Step 03 - Understanding Machine Types and Images in G | ⚪ | 6 | GCE | 50 | Machine types, families and images in Compute Engine. |
| 06 - Step 04 - Installing HTTP Webserver on Google Compute | ⚪ | 7 | GCE | 50 | Installing and configuring an Apache HTTP server on a VM. |
| 07 - Step 05 - Understanding Internal and External IP Addr | ⚪ | 5 | GCE | 50 | Internal and external IP addresses on VM instances. |
| 08 - Step 06 - Playing with a Static IP Addresses V2 | ⚪ | 5 | GCE | 50 | Using and assigning static IP addresses to VMs. |
| 09 - Step 07 - Understanding Static IP Address in GCP - Go | ⚪ | 2 | GCE | 50 | Key points about static IPs and costs. |
| 11 - Step 08 - Simplifying Web Server setup with Compute E | ⚪ | 4 | GCE | 50 | Automation with startup scripts in Compute Engine. |
| 12 - Step 09 - Simplifying VM creation with Instance Templ | ⚪ | 6 | GCE | 50 | Instance templates to simplify VM creation. |
| 13 - Step 10 - Reducing Launch Time with a Custom Image | ⚪ | 10 | GCE | 50 | Custom images to reduce startup time. |
| 14 - Step 11 - Troubleshooting Launch of Apache on GCP Vir | ⚪ | 3 | GCE | 50 | Debugging and troubleshooting VM startup. |
| 15 - Step 12 - Reducing Costs - Compute Engine Virtual Mac | ⚪ | 6 | GCE | 50 | Cost reduction: sustained-use, committed-use discounts and preemptible VMs. |
| 16 - Step 13 - Achieving High Availability with Live Migra | ⚪ | 4 | GCE | 50 | Live migration and automatic restart on Compute Engine VMs. |
| ⭐17 - Step 14 - Playing with Google Cloud Platform (Web) Co | 🟡 | 4 | DEVENV | 44 | Navigating the Google Cloud Platform web Console and its features. |
| 18 - Step 15 - Best Practices - Virtual Machines in Google | ⚪ | 2 | GCE | 50 | Best practices for virtual machines in Google Cloud. |
| 19 - Step 16 - Scenarios - Virtual Machines in Google Clou | ⚪ | 9 | GCE | 50 | Practical scenarios: prerequisites and sole-tenancy in Compute Engine. |
| 20 - Step 17 - Quick Review - Google Compute Engine | ⚪ | 2 | GCE | 50 | Quick review of the main Google Compute Engine concepts. |
| 21 - Understanding Importance of Deep Work | 🔴 | 2 | FOUND | 0 | Motivation on focus and deep work for effective learning. |

### 05 - Getting started with Instance Groups and Cloud Load Balancing in Google Cloud
*11 lectures · 58 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Getting started with MIGs and Cloud Load Balancing -  | ⚪ | 1 | GCE | 50 | Introduction to the instance groups and load balancing section. |
| ⭐02 - Step 01 - Getting Started with Instance Groups | ⚪ | 6 | GCE | 50 | Introduction to managed and unmanaged instance groups in GCP. |
| 03 - Step 02 - Creating Managed Instance Groups (MIG) V2 | ⚪ | 11 | GCE | 50 | Creating managed instance groups with sizing and autoscaling. |
| 04 - Step 03 - Playing with Managed Instance Groups (MIG) | ⚪ | 4 | GCE | 50 | Hands-on demo of using and editing managed instance groups. |
| 05 - Step 04 - Updating a Managed Instance Groups (MIG) -  | ⚪ | 8 | DEPLOYSTRAT | 41 | Rolling and canary updates on managed instance groups. |
| 06 - Step 05 - Getting Started with Cloud Load Balancing | ⚪ | 3 | LB | 31 | Introduction to Cloud Load Balancing: concepts and key features. |
| 07 - Step 06 - Creating a Load Balancer in GCP - Google Cl | 🟡 | 9 | LB | 31 | Hands-on creation of an HTTP load balancer in Google Cloud Platform. |
| 08 - Step 07 - Understanding Cloud Load Balancing Terminol | ⚪ | 4 | LB | 31 | Cloud Load Balancing terminology: backend, frontend, SSL termination. |
| 09 - Step 08 - Exploring the Load Balancer in GCP - Google | ⚪ | 3 | LB | 31 | Exploring the created load balancer and resource hierarchy. |
| 10 - Step 09 - Choosing a Load Balancer in GCP - Google Cl | ⚪ | 4 | LB | 31 | How to choose the right load balancer type in GCP. |
| 11 - Step 10 - Exploring Scenarios - Cloud Load Balancing | ⚪ | 2 | LB | 31 | Practical decision scenarios for using load balancers. |

### 06 - Getting Started with Gcloud
*3 lectures · 20 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting Started with Gcloud | 🟡 | 9 | DEVENV | 44 | Introduction to the gcloud CLI and using Cloud Shell in Google Cloud. |
| ⭐02 - Step 02 - Understanding Command Structure in Gcloud t | 🟡 | 9 | DEVENV | 44 | gcloud command structure for managing GCP services. |
| ⭐03 - Step 03 - Cloud Shell - Things to remember | 🟡 | 2 | DEVENV | 44 | Key Cloud Shell characteristics and data persistence. |

### 07 - Managed Services in Google Cloud Platform
*5 lectures · 20 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting Started with Managed Services | 🟡 | 1 | ARCH | 72 | Introduction to managed services and cloud service models. |
| 02 - Step 02 - Getting Started with IAAS and PAAS | 🟡 | 5 | ARCH | 72 | IaaS vs PaaS compared with GCP service examples. |
| ⭐03 - Step 03 - Getting Started with Containers and Contain | 🟡 | 8 | DOCKER | 26 | Introduction to containers, Docker and orchestration with Kubernetes. |
| 04 - Step 04 - Getting Started with Serverless | 🟡 | 2 | ARCH | 72 | The serverless concept: characteristics, advantages and GCP examples. |
| 05 - Step 05 - Getting Started with Google Cloud Platform  | 🟡 | 4 | ARCH | 72 | Overview of managed compute services in Google Cloud. |

### 08 - Getting Started with Google App Engine
*14 lectures · 63 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting Started with Google App Engine (GAE | ⚪ | 4 | APPENGINE | 28 | Introduction to Google App Engine: features and comparison with Compute Engine. |
| 02 - Step 02 - Understanding App Engine Environments - Sta | ⚪ | 4 | APPENGINE | 28 | App Engine Standard and Flexible environments: differences and use cases. |
| 03 - Step 03 - Understanding App Engine Component Hierarch | ⚪ | 3 | APPENGINE | 28 | App Engine component hierarchy: application, service and version. |
| 04 - Step 04 - Comparing App Engine Environments - Standar | ⚪ | 3 | APPENGINE | 28 | Detailed comparison between App Engine Standard and Flexible. |
| 05 - Step 05 - Scaling Google App Engine Instances | ⚪ | 3 | APPENGINE | 28 | App Engine scaling options: automatic, basic and manual. |
| 07 - Step 06 - Playing with App Engine in GCP - Google Clo | ⚪ | 15 | APPENGINE | 28 | Hands-on demo deploying an app to App Engine Standard. |
| 09 - Step 07 - Exploring App Engine in GCP - App, Services | 🟡 | 7 | APPENGINE | 28 | Explore App Engine: services, versions and gcloud app commands. |
| 10 - Step 08 - Splitting Traffic between Multiple versions | ⚪ | 8 | APPENGINE | 28 | Splitting and migrating traffic between versions in App Engine. |
| 11 - Step 09 - Create a New Service and Playing with App E | ⚪ | 6 | APPENGINE | 28 | Create multiple services and play with versions in App Engine. |
| 12 - Step 10 - Understanding App Engine app | ⚪ | 3 | APPENGINE | 28 | app.yaml configuration: runtime, scaling and variables. |
| 13 - Step 11 - Creating Cron Jobs in App Engine | ⚪ | 1 | APPENGINE | 28 | Configure scheduled cron jobs in App Engine via cron.yaml. |
| 14 - Step 12 - Deploying New App Engine Versions without D | ⚪ | 2 | APPENGINE | 28 | Deploy new versions with no downtime using no-promote and migration. |
| 15 - Step 13 - Important Things to Remember - Google App E | ⚪ | 2 | APPENGINE | 28 | Key App Engine takeaways: region, Standard vs Flex, instances. |
| 16 - Step 14 - App Engine - Scenarios | ⚪ | 2 | APPENGINE | 28 | Practical App Engine scenarios: limits, regions and traffic control. |

### 09 - Getting Started with Google Kubernetes Engine
*19 lectures · 100 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 00 - Getting Started with Google Kubernetes Engi | ⚪ | 1 | GKE | 184 | Introduction to the Google Kubernetes Engine section for the certification. |
| ⭐02 - Step 01 - Getting Started with Google Kubernetes Engi | ⚪ | 3 | GKE | 184 | GKE overview: container orchestration and managed features. |
| 03 - Step 02 - Kubernetes Journey - Creating a GKE Cluster | 🟡 | 5 | GKE | 184 | Create a GKE cluster via console and enable the Kubernetes Engine APIs. |
| 05 - Step 03 - Kubernetes Journey - Create a Deployment an | 🟡 | 9 | GKE | 184 | Create a Deployment and Service in GKE with kubectl and expose via LoadBalancer. |
| 06 - Step 04 - Exploring GKE in GCP Console | 🟡 | 6 | GKE | 184 | Explore the GKE console: workloads, pods, services and Ingress. |
| 07 - Step 05 - Kubernetes Journey - Scaling Deployments an | ⚪ | 7 | GKE | 184 | Manual pod scaling and resizing node pools in GKE. |
| 08 - Step 06 - Kubernetes Journey - Autoscaling, Config Ma | 🟡 | 7 | GKE | 184 | Pod and cluster autoscaling, ConfigMap and Secrets in Kubernetes. |
| 09 - Step 07 - Exploring Kubernetes Deployments with YAML  | ⚪ | 4 | GKE | 184 | Declarative YAML configuration for Deployment and Service in Kubernetes. |
| 10 - Step 08 - Kubernetes Journey - The End | ⚪ | 4 | GKE | 184 | Wrap up the GKE journey: extra node pools, node selectors and cleanup. |
| 11 - Step 09 - Understanding Kubernetes Clusters - Google  | 🟡 | 6 | GKE | 184 | GKE cluster components: master, workers, zonal, regional and private types. |
| 12 - Step 10 - Understanding Pods in Kubernetes | ⚪ | 3 | GKE | 184 | The Pod concept in Kubernetes: smallest unit, ephemeral IP and status. |
| 13 - Step 11 - Understanding Deployments and Replica Sets  | 🟡 | 7 | GKE | 184 | Deployment and ReplicaSet: managing versions and replicas in Kubernetes. |
| 14 - Step 12 - Understanding Services in Kubernetes | 🟡 | 6 | GKE | 184 | Kubernetes Services: ClusterIP, LoadBalancer, NodePort and Ingress. |
| 15 - Step 13 - Using Kubernetes Namespaces | ⚪ | 7 | GKE | 184 | Kubernetes Namespaces: isolation, permissions and virtual clusters. |
| 16 - Step 14 - Understanding Service Discovery - Namespace | ⚪ | 4 | GKE | 184 | Service discovery in Kubernetes via DNS and FQDN between microservices. |
| 17 - Step 15 - Troubleshooting Kubernetes Deployment Error | 🟡 | 8 | GKE | 184 | Troubleshooting deployment errors: ImagePullBackOff, CrashLoopBackOff. |
| 18 - Step 16 - Important Things to Remember - Google Kuber | 🟢 | 5 | GKE | 184 | GKE best practices: HA, DaemonSet, StatefulSet, Docker and monitoring. |
| 19 - COURSE UPDATE - Quick Review of Kubernetes Concepts | ⚪ | 3 | GKE | 184 | Kubernetes terminology review: cluster, pod, deployment and service. |
| 20 - Step 17 - Scenarios - Google Kubernetes Engine GKE | 🟡 | 5 | GKE | 184 | GKE scenarios: cost, autoscaling, sandbox, ClusterIP and pending pods. |

### 10 - Getting Started with Google Kubernetes Engine YAML Configuration
*15 lectures · 61 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Google Kubernetes Engine Declarative YAML Configurati | ⚪ | 1 | GKE | 184 | Introduction to the Kubernetes declarative YAML configuration section. |
| 02 - Step 01 - Understanding Kubernetes YAML - Basics | ⚪ | 3 | GKE | 184 | Kubernetes YAML fundamentals: apiVersion, kind, metadata and spec. |
| 03 - Step 02 - Understanding Kubernetes YAML - Deployment | ⚪ | 3 | GKE | 184 | Declarative Deployment configuration in Kubernetes via YAML. |
| 04 - Step 03 - Understanding Kubernetes YAML - Service | 🟡 | 3 | GKE | 184 | Declarative Kubernetes Service configuration: ports, selector and type. |
| 05 - Step 04 - Understanding Kubernetes YAML - Labels | ⚪ | 3 | GKE | 184 | Labels in Kubernetes: association, selectors and mapping between objects. |
| 07 - Step 05 - Demo - Getting Setup for Kubernetes Declara | 🟡 | 4 | GKE | 184 | Declarative config demo: labels, kubectl delete with selectors. |
| 08 - Step 06 - Demo - Playing with Kubernetes Declarative  | 🟡 | 11 | GKE | 184 | Declarative YAML demo: multiple deployments mapped to one virtual service. |
| 09 - Step 07 - Understanding Liveness and Readiness Probes | ⚪ | 3 | GKE | 184 | Liveness and Readiness Probes: health check and pod readiness in Kubernetes. |
| 10 - Step 08 - GKE - Deployment Strategy | 🟡 | 6 | GKE | 184 | Rolling Update deployment strategy: maxSurge, maxUnavailable and Recreate. |
| 11 - Step 09 - Understanding Kubernetes Ingress | 🟡 | 4 | GKE | 184 | Kubernetes Ingress: routing traffic to multiple microservices. |
| 12 - Step 10 - Understanding PersistentVolume & Persistent | 🟡 | 5 | GKE | 184 | PersistentVolume and PersistentVolumeClaim: persistent storage for pods. |
| 13 - Step 11 - Understanding Kubernetes Network Policies | 🟡 | 6 | GKE | 184 | Network Policies in Kubernetes: controlling ingress and egress traffic. |
| 14 - Step 12 - Exploring Graceful shutdown - Kubernetes | ⚪ | 4 | GKE | 184 | Graceful shutdown in Kubernetes: preStop hook, SIGTERM and SIGKILL. |
| 15 - Step 13 - Kubernetes - More Scenarios | 🟡 | 4 | GKE | 184 | Kubernetes scenarios: namespaces, service discovery, probes and troubleshooting. |
| 16 - How to handle failures | 🔴 | 2 | FOUND | 0 | Motivational reflection on failures as learning opportunities. |

### 11 - Getting Started with Google Cloud Functions and Cloud Run
*9 lectures · 43 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting Started with Google Cloud Functions | 🟡 | 2 | CLOUDFUNC | 60 | Introduction to Cloud Functions: events, triggers, languages and billing. |
| 02 - Step 02 - Understanding Google Cloud Functions - Impo | 🟡 | 1 | CLOUDFUNC | 60 | Core Cloud Functions concepts: events, triggers and functions. |
| 03 - Step 03 - Creating your first Google Cloud Functions  | 🟡 | 8 | CLOUDFUNC | 60 | Demo creating a Gen1 Cloud Function via console: configuration and deploy. |
| ⭐04 - Step 04 - Getting Started with Google Cloud Run V2 | 🟢 | 10 | CLOUDRUN | 116 | Introduction to Cloud Run: service creation, revisions and scaling. |
| 06 - Step 05 - Playing with Cloud Functions - Gen 2 | 🟢 | 8 | CLOUDFUNC | 60 | Cloud Functions Gen2: improvements, revisions, traffic splitting and Cloud Run. |
| 07 - Step 06 - Exploring Cloud Functions - Scaling and Con | 🟢 | 4 | CLOUDFUNC | 60 | Scalability and concurrency in Cloud Functions Gen2: cold starts and settings. |
| ⭐08 - Step 07 - Quick Overview of Deploying Cloud Functions | 🟢 | 4 | CLOUDFUNC | 60 | Deploy Cloud Functions via gcloud: runtime options, triggers and source. |
| 09 - Step 08 - Exploring Cloud Functions Best Practices | 🟢 | 3 | CLOUDFUNC | 60 | Cloud Functions best practices: cold starts, versioning, service accounts. |
| 10 - Step 09 - Cloud Run and Cloud Functions - Scenarios | 🟢 | 3 | CLOUDRUN | 116 | Cloud Run and Cloud Functions scenarios: scale to zero, cost and Knative. |

### 12 - Encryption in Google Cloud with Cloud KMS
*4 lectures · 14 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Understanding Data States | ⚪ | 3 | KMS | 8 | Data states: at rest, in transit and in use to understand encryption. |
| 02 - Step 02 - Understanding Encryption - Symmetric and As | ⚪ | 4 | KMS | 8 | Symmetric and asymmetric encryption: public, private keys and algorithms. |
| 03 - Step 03 - Getting Started with Cloud KMS | ⚪ | 2 | KMS | 8 | Introduction to Cloud KMS: creating and managing cryptographic keys. |
| 04 - Step 04 - Playing with Cloud KMS | 🟡 | 5 | KMS | 8 | Cloud KMS demo: creating a key ring, key and using CMEK on a disk. |

### 13 - Object Storage in Google Cloud Platform - Cloud Storage
*8 lectures · 37 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 02 - Step 01 - Playing with Object Storage in GCP - Cloud  | 🟡 | 6 | GCS | 95 | Cloud Storage demo: creating a bucket, uploading objects and storage classes. |
| 03 - Step 02 - Exploring Cloud Storage in GCP | 🟡 | 4 | GCS | 95 | Cloud Storage overview: serverless, gsutil, use cases and API. |
| 04 - Step 03 - Understanding Cloud Storage - Objects and B | 🟡 | 2 | GCS | 95 | Cloud Storage structure: globally unique buckets, keys and objects. |
| 05 - Step 04 - Understanding Cloud Storage - Storage Class | 🟡 | 5 | GCS | 95 | Storage classes: Standard, Nearline, Coldline and Archive with costs. |
| 06 - Step 05 - Understanding Cloud Storage - Lifecycle Man | 🟡 | 5 | GCS | 95 | Object Lifecycle Management: automatic class transitions and expiration. |
| 07 - Step 06 - Understanding Cloud Storage - Versioning | 🟡 | 2 | GCS | 95 | Object versioning in Cloud Storage: live and noncurrent versions. |
| 08 - Step 07 - Encrypting Cloud Storage Data - Cloud KMS | 🟢 | 9 | GCS | 95 | Encryption in Cloud Storage: Google-managed, CMEK and customer-supplied keys. |
| 09 - Step 08 - Playing with gsutil - Cloud Storage from Co | 🟡 | 4 | GCS | 95 | gsutil commands to manage buckets and objects in Cloud Storage. |

### 14 - Authentication and Authorization in Google Cloud with Cloud IAM
*14 lectures · 60 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting started with Cloud IAM | ⚪ | 3 | IAM | 85 | Introduction to Cloud IAM: authentication, authorization and granular control. |
| 02 - Step 02 - Exploring Cloud IAM with an Example | ⚪ | 4 | IAM | 85 | IAM concepts: members, resources, roles and binding policies. |
| 03 - Step 03 - Exploring Cloud IAM - Roles | ⚪ | 3 | IAM | 85 | IAM role types: basic, predefined and custom. |
| 04 - Step 04 - Playing with IAM Roles - Predefined, Basic  | ⚪ | 7 | IAM | 85 | Demo: exploring basic, predefined and custom IAM roles in GCP. |
| 05 - Step 05 - Exploring Cloud IAM - Members, Role and Pol | ⚪ | 4 | IAM | 85 | Members, policies and role bindings with conditions in IAM. |
| 07 - Step 06 - Demo - Playing with IAM V2 | ⚪ | 4 | IAM | 85 | Demo: manage members, roles and use the IAM policy troubleshooter. |
| ⭐08 - Step 07 - Getting Started with Service Accounts | 🟡 | 6 | IAM | 85 | Service accounts: types, creation and assignment to VMs in GCP. |
| 09 - Step 08 - Demo - Playing with Service Accounts | 🟡 | 8 | IAM | 85 | Demo: create a service account, assign it to a VM and grant access to Cloud Storage. |
| 10 - Step 09 - Exploring Service Account Use Cases V2 | 🟡 | 8 | AUTHN | 50 | Service account use cases: ADC, managed keys and short-lived tokens. |
| 11 - Step 10 - Scenarios - Service Accounts | ⚪ | 2 | IAM | 85 | Service account scenarios: VM to GCS and cross-project access. |
| 12 - Step 11 - Exploring Cloud Storage - ACL (Access Contr | 🟡 | 4 | GCS | 95 | Cloud Storage ACLs: uniform IAM control vs fine-grained access. |
| 13 - Step 12 - Exploring Cloud Storage - Signed URLs | 🟢 | 2 | GCS | 95 | Signed URLs in Cloud Storage for temporary object access. |
| 14 - Step 13 - Exposing a Public Website using Cloud Stora | 🟡 | 5 | GCS | 95 | Expose a public static website using a Cloud Storage bucket. |
| 15 - Step 14 - IAM - Scenarios | 🟡 | 2 | IAM | 85 | IAM scenarios: SA keys, signed URLs and ACLs in Cloud Storage. |

### 15 - Authorization for Kubernetes Workloads and Users
*14 lectures · 52 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 00 - Authorization for Kubernetes Workloads - Se | 🟡 | 2 | GKE | 184 | Introduction to authorization for Kubernetes workloads and users. |
| 02 - Step 01 - Exploring Kubernetes Node level permissions | 🟡 | 6 | GKE | 184 | GKE node-level permissions: default vs custom service account. |
| 03 - Step 02 - Exploring Kubernetes Pod level permissions | 🟢 | 6 | GKE | 184 | Pod-level permissions using Kubernetes Secrets and service account keys. |
| 04 - Step 03 - Exploring Kubernetes Pod level permissions  | 🟢 | 9 | WIF | 16 | Workload Identity in GKE: per-pod permissions without managing secrets. |
| 05 - Step 04 - Authorization for Kubernetes Workloads - Su | 🟢 | 2 | GKE | 184 | Summary of authorization options for Kubernetes workloads. |
| ⭐06 - Step 05 - Kubernetes RBAC and Google Cloud IAM - Gett | 🟡 | 2 | GKE | 184 | Google Cloud IAM vs Kubernetes RBAC for access control. |
| 07 - Step 06 - Exploring Google Cloud IAM Roles for GKE | 🟡 | 3 | GKE | 184 | Predefined Cloud IAM roles to manage GKE clusters and objects. |
| 08 - Step 07 - Exploring Kubernetes Role based access cont | 🟡 | 4 | GKE | 184 | Introduction to Kubernetes RBAC: Role, ClusterRole and bindings. |
| 09 - Step 08 - Understanding Kubernetes RBAC - Role & Clus | ⚪ | 3 | GKE | 184 | Role and ClusterRole details in Kubernetes RBAC by namespace and cluster. |
| 10 - Step 09 - Understanding Kubernetes RBAC - RoleBinding | ⚪ | 2 | GKE | 184 | RoleBinding and ClusterRoleBinding: map users and SAs to Kubernetes roles. |
| 11 - Step 10 - Kubernetes RBAC and Google Cloud IAM - Summ | 🟡 | 2 | GKE | 184 | Summary: multi-cluster Cloud IAM vs fine-grained per-namespace RBAC. |
| 12 - Step 11 - Understanding Kubernetes Security Best Prac | 🟢 | 3 | GKE | 184 | Kubernetes security best practices: upgrades, shielded nodes. |
| 13 - Step 12 - Deleting Kubernetes Cluster | ⚪ | 3 | GKE | 184 | Demo: delete deployments, services and the Kubernetes cluster. |
| 14 - Step 13 - Authorization for Kubernetes - Scenarios | 🟢 | 3 | GKE | 184 | GKE authorization scenarios: Workload Identity, node SA and RBAC. |

### 16 - Authentication and Authorization with Identity Aware Proxy
*9 lectures · 35 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting Started with OAuth | 🟡 | 3 | AUTHN | 50 | Introduction to OAuth: authorization framework, scopes and terminology. |
| 02 - Step 02 - Playing with OAuth 2 | 🟡 | 6 | AUTHN | 50 | OAuth 2.0 Playground demo: authorization flow, access tokens and attributes. |
| 03 - Step 03 - Getting Started with OpenID Connect (OIDC) | 🟡 | 4 | AUTHN | 50 | Hands-on demo of the OpenID Connect flow and JWT tokens. |
| 04 - Step 04 - Getting Started with Identity Aware Proxy ( | 🟡 | 2 | IAP | 10 | Introduction to Identity-Aware Proxy and its use cases. |
| 06 - Step 05 - Exploring Identity Aware Proxy with App Eng | 🟡 | 5 | IAP | 10 | Demo: deploying an app to App Engine for IAP integration. |
| 07 - Step 06 - Exploring Identity Aware Proxy with App Eng | 🟡 | 9 | IAP | 10 | Demo: enabling and configuring IAP with App Engine and OAuth. |
| 08 - Step 07 - Identity Aware Proxy (IAP) - How does it wo | 🟡 | 2 | IAP | 10 | How IAP intercepts requests and passes identity to the backend. |
| 09 - Step 08 - Using Identity Aware Proxy (IAP) with Kuber | 🟡 | 4 | IAP | 10 | Configuring IAP with Kubernetes using BackendConfig and Ingress. |
| 10 - Step 09 - Deleting App Engine Project for Identity Aw | ⚪ | 1 | IAP | 10 | Wrapping up the IAP project and deleting the Cloud SQL instance. |

### 17 - Exploring DevOps and SRE
*13 lectures · 55 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 00 - DevOps and SRE - Section Introduction | ⚪ | 1 | SRE | 3 | Introduction to the DevOps, SRE and Cloud Build section. |
| 02 - Step 01 - Understanding SDLC Evolution - Waterfall to | 🔴 | 6 | SRE | 3 | SDLC evolution: waterfall, spiral and Agile models. |
| 03 - Step 02 - What is DevOps_ | 🔴 | 2 | SRE | 3 | The DevOps concept: communication, fast feedback and automation. |
| 04 - Step 03 - Exploring DevOps Practices - Continuous Int | ⚪ | 5 | SRE | 3 | DevOps practices: continuous integration, deployment and delivery (CI/CD). |
| 05 - Step 04 - DevOps in Google Cloud - Continuous Integra | 🟢 | 2 | CLOUDBUILD | 56 | CI/CD tooling in Google Cloud: Cloud Build, Source Repos and Spinnaker. |
| 06 - Step 05 - Exploring DevOps Practices - Infrastructure | 🔴 | 4 | IAC | 2 | Infrastructure as code: Terraform, Deployment Manager and management. |
| 07 - Step 06 - Getting Started with Cloud Deployment Manag | ⚪ | 3 | IAC | 2 | Introduction to Cloud Deployment Manager and infrastructure automation. |
| 08 - Step 07 - Understanding Cloud Deployment Manager | 🔴 | 4 | IAC | 2 | Deployment Manager details: templates, deployments and manifest. |
| 09 - Step 08 - Demo - Cloud Marketplace and Deployment Man | 🔴 | 7 | MARKETPLACE | 0 | Demo: deploying WordPress via Marketplace using Deployment Manager. |
| 10 - Step 09 - Exploring Container Registry and Artifact R | 🟢 | 6 | ARTIFACT | 31 | Container Registry vs Artifact Registry: differences, formats and permissions. |
| 11 - Step 10 - Getting Started with Site Reliability Engin | 🔴 | 4 | SRE | 3 | Introduction to SRE: reliability principles, automation and responsibility. |
| 12 - Step 11 - Understanding Key Metrics for Site Reliabil | 🔴 | 5 | SRE | 3 | SRE metrics: SLI, SLO, SLA and error budgets explained. |
| 13 - Step 12 - Understanding Best Practices for Site Relia | ⚪ | 8 | SRE | 3 | SRE practices: load management, cascading failures, resilience testing. |

### 18 - Getting Started with Cloud Build
*19 lectures · 56 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting Started with Cloud Build | 🟡 | 3 | CLOUDBUILD | 56 | Introduction to Cloud Build as a serverless CI/CD platform. |
| 02 - Step 02 - How does Cloud Build work_ | 🟡 | 4 | CLOUDBUILD | 56 | How Cloud Build works: triggers, config files and Docker. |
| 03 - Step 03 - Understanding Cloud Build Configuration - B | 🟢 | 4 | CLOUDBUILD | 56 | Configuring Cloud Build steps and using builder images. |
| 04 - Step 04 - Controlling Order of Cloud Build Steps | ⚪ | 1 | CLOUDBUILD | 56 | Controlling the order of Cloud Build steps with waitFor. |
| 05 - Step 05 - Choosing Builder Image for Each Cloud Build | 🟡 | 3 | CLOUDBUILD | 56 | Choosing builder images: official, community and custom. |
| 07 - Step 06 - Cloud Build Demo - Getting Code Ready with  | 🟢 | 7 | CLOUDBUILD | 56 | Demo: creating a Cloud Source Repository and uploading source code. |
| 08 - Step 07 - Cloud Build Demo - Exploring Python App and | 🟢 | 3 | CLOUDBUILD | 56 | Demo: reviewing the Cloud Build YAML configuration for a Python app. |
| 09 - Step 08 - Cloud Build Demo - Creating Cloud Build Tri | 🟢 | 3 | CLOUDBUILD | 56 | Demo: creating a Cloud Build trigger and configuring permissions. |
| 10 - Step 09 - Cloud Build Demo - Creating Artifact Regist | 🟡 | 2 | CLOUDBUILD | 56 | Demo: creating an Artifact Registry repository to store images. |
| 11 - Step 10 - Cloud Build Demo - Exploring Cloud Run App | 🟢 | 2 | CLOUDBUILD | 56 | Demo: successful build deploying a Docker image to Cloud Run. |
| 12 - Step 11 - Understanding Flexibility of Cloud Build Co | 🟡 | 3 | CLOUDBUILD | 56 | Cloud Build flexibility: env vars, timeout, machines, logs and artifacts. |
| 13 - Step 12 - Exploring Cloud Build Configuration - Subst | ⚪ | 2 | CLOUDBUILD | 56 | Substitution variables in Cloud Build, including user-defined substitutions. |
| 14 - Step 13 - Sharing Files between Cloud Build Steps | 🟡 | 2 | CLOUDBUILD | 56 | Sharing files between build steps via workspace and volumes. |
| 15 - Step 14 - Managing Permissions for Cloud Build - Serv | 🟡 | 2 | CLOUDBUILD | 56 | Managing Cloud Build permissions using an IAM service account. |
| 16 - Step 15 - Deploying to Kubernetes - Cloud Build | 🟢 | 2 | CLOUDBUILD | 56 | Deploying to Kubernetes using Cloud Build and the GKE Deploy builder. |
| 17 - Step 16 - Exploring Cloud Build Best Practices | 🟡 | 5 | CLOUDBUILD | 56 | Cloud Build best practices: lean images, cache and image size. |
| 18 - Step 17 - Getting Started with Spinnaker | 🟡 | 2 | DEPLOYSTRAT | 41 | Introduction to Spinnaker as a multi-cloud CI/CD platform with automated deploys. |
| 19 - Step 18 - Getting Started with Tekton Pipelines | 🟡 | 3 | DEPLOYSTRAT | 41 | Tekton Pipelines: Kubernetes-style CI/CD with native pipeline resources. |
| 20 - Step 19 - Cloud Build - Scenarios | 🟡 | 2 | CLOUDBUILD | 56 | Practical Cloud Build scenarios: caching and file sharing. |

### 19 - Creating Private Networks with Google Cloud VPC
*9 lectures · 35 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Understanding the Need for Google Cloud VPC | ⚪ | 3 | VPC | 33 | Introduction to VPC as an isolated, global private network in Google Cloud. |
| 02 - Step 02 - Understanding the Need for VPC Subnets | ⚪ | 3 | VPC | 33 | Why you need subnets to separate public and private resources in the network. |
| 03 - Step 03 - Creating VPCs and Subnets in Google Cloud P | ⚪ | 2 | VPC | 33 | Creating VPCs and subnets: auto mode vs custom mode in GCP. |
| 04 - Step 04 - Understanding CIDR Blocks | ⚪ | 4 | VPC | 33 | The CIDR block concept and how to represent IP address ranges. |
| 05 - Step 05 - Demo - Creating VPCs and Subnets in GCP V2 | ⚪ | 12 | VPC | 33 | Demo: creating VPCs, subnets and VM instances in custom networks. |
| 06 - Step 06 - Understanding Firewall Rules in Google Clou | ⚪ | 6 | VPC | 33 | Firewall rules: priorities, default rules and defining ingress/egress rules. |
| 07 - Step 07 - Getting Started with Shared VPC | ⚪ | 1 | VPC | 33 | Shared VPC: sharing a network across projects in the same organization. |
| 08 - Step 08 - Getting Started with VPC Peering | ⚪ | 1 | VPC | 33 | VPC Peering: connecting VPC networks across organizations via internal IPs. |
| 09 - Step 09 - Implementing Hybrid Cloud with Cloud VPN an | ⚪ | 3 | VPC | 33 | Cloud VPN and Cloud Interconnect to connect on-premises networks to GCP. |

### 20 - Exploring IAM and Project Organization in Google Cloud Platform
*6 lectures · 23 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Organizing Google Cloud Resources - Project | ⚪ | 4 | ORG | 6 | GCP resource hierarchy: organization, folders, projects and resources. |
| 02 - Step 02 - Exploring Billing Accounts | ⚪ | 4 | BILLING | 7 | Billing accounts, budgets, alerts and billing data export. |
| 03 - Step 03 - Understanding IAM Best Practices | ⚪ | 3 | IAM | 85 | IAM best practices: least privilege, separation of duties. |
| 04 - Step 04 - Understanding User Identity Management in G | 🟡 | 7 | IAM | 85 | Identity management: Google Workspace, federation with Active Directory. |
| 05 - Step 05 - Exploring IAM Members and Identities | ⚪ | 4 | IAM | 85 | IAM member types: Google accounts, service accounts, groups and domains. |
| 06 - Step 06 - Exploring IAM Policy at multiple levels - R | ⚪ | 1 | IAM | 85 | IAM policies at multiple hierarchy levels with transitive inheritance. |

### 21 - Exploring Google Cloud APIs and Client Libraries with Cloud Storage
*7 lectures · 24 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Designing APIs_ gRPC vs REST | 🟡 | 4 | CLIENTLIB | 39 | gRPC vs REST compared for API design in microservices. |
| 02 - Step 02 - Exploring Google Cloud APIs and Client Libr | 🟢 | 6 | CLIENTLIB | 39 | Google Cloud APIs and client libraries: types, usage and dashboard. |
| 03 - Step 03 - Using Cloud Client Libraries - Cloud Storag | 🟢 | 4 | CLIENTLIB | 39 | Using the Cloud Client Libraries for programmatic operations in Cloud Storage. |
| 04 - Step 04 - Consuming Google Cloud APIs - Remember | 🟢 | 2 | CLIENTLIB | 39 | Authentication with ADC and scaling limits when consuming Google Cloud APIs. |
| 05 - Step 05 - What should you do when an API errors out_ | 🟡 | 3 | CLIENTLIB | 39 | Handling HTTP errors in GCP APIs with retries and exponential backoff. |
| 06 - Step 06 - Exploring Flat Namespace - Cloud Storage | 🟡 | 2 | GCS | 95 | Cloud Storage flat namespace: internal representation of folders and objects. |
| 07 - Step 07 - Exploring Cloud Storage Scenarios | 🟡 | 2 | GCS | 95 | Cloud Storage scenarios: classes, lifecycle, CMEK and access policies. |

### 22 - Choosing Databases in Google Cloud
*8 lectures · 21 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 00 - Databases in Google Cloud - Section Introdu | 🟢 | 1 | DBCHOICE | 40 | Introduction to the databases section in GCP and an overview of what's next. |
| 02 - Step 01 - Understanding Database Fundamentals - Choos | 🟢 | 4 | DBCHOICE | 40 | Database fundamentals: types, schemas and selection criteria. |
| 03 - Step 02 - OLTP Relational Databases in Google Cloud - | 🟡 | 2 | DBCHOICE | 40 | OLTP databases in GCP: Cloud SQL vs Cloud Spanner, when to use each. |
| 04 - Step 03 - OLAP Relational Database in Google Cloud -  | 🟢 | 4 | BIGQUERY | 35 | BigQuery as an OLAP database: columnar storage and analytical processing. |
| 05 - Step 04 - NoSQL Databases in Google Cloud - Firestore | 🟢 | 4 | DBCHOICE | 40 | NoSQL databases in GCP: Firestore/Datastore vs Bigtable, selection criteria. |
| 06 - Step 05 - In memory Database in Google Cloud - Memory | 🟢 | 1 | MEMORYSTORE | 15 | Memorystore as an in-memory database for caching and low latency. |
| 07 - Step 06 - Databases in Google Cloud Platform - A Quic | 🟢 | 2 | DBCHOICE | 40 | General review of all database services in Google Cloud. |
| 08 - Step 07 - Databases in Google Cloud Platform - Scenar | 🟢 | 2 | DBCHOICE | 40 | Practical scenarios for choosing the right database in GCP. |

### 23 - Getting started with Cloud SQL
*5 lectures · 18 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting started with Cloud SQL | 🟡 | 3 | CLOUDSQL | 27 | Introduction to Cloud SQL: features, limits and when to use it vs Spanner. |
| 03 - Step 02 - Demo - Playing with Cloud SQL | 🟡 | 6 | CLOUDSQL | 27 | Demo: creating a Cloud SQL instance, database and table via console. |
| 04 - Step 03 - Demo - Playing with Cloud SQL - 2 | ⚪ | 6 | CLOUDSQL | 27 | Exploring the Cloud SQL console: monitoring, backups and read replicas. |
| 05 - Step 04 - Understanding Cloud SQL Features | ⚪ | 2 | CLOUDSQL | 27 | Cloud SQL features: encryption, HA, read replicas and backups. |
| 06 - Step 05 - Understanding Cloud SQL High Availability F | ⚪ | 1 | CLOUDSQL | 27 | Cloud SQL high availability: primary instance, standby and failover. |

### 24 - Connecting to Cloud SQL instances
*8 lectures · 26 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting Started with Cloud SQL Auth proxy | 🟡 | 2 | AUTHN | 50 | Cloud SQL Auth Proxy: secure TLS connection between clients and Cloud SQL. |
| 03 - Step 02 - Configuring Cloud SQL Auth proxy - Step By  | 🟡 | 7 | AUTHN | 50 | Step-by-step demo: installing and configuring the Cloud SQL Auth Proxy. |
| 04 - Step 03 - Configuring Authorization for Cloud SQL Aut | 🟡 | 4 | IAM | 85 | Authorization for the Cloud SQL Auth Proxy: client role and credentials. |
| 05 - Step 04 - Getting Started with Private Service Connec | ⚪ | 4 | VPC | 33 | Private Service Connection: a VM in a VPC connecting to Cloud SQL via private IP. |
| 06 - Step 05 - Getting Started with Serverless VPC Access | 🟡 | 4 | VPC | 33 | Serverless VPC Access: connect Cloud Functions/Run to Cloud SQL via internal IP. |
| 07 - Step 06 - How to connect to Cloud SQL instance_ | 🟡 | 2 | CLOUDSQL | 27 | Summary of ways to connect to Cloud SQL: proxy, VPC access and SSL. |
| 08 - Step 07 - Understanding Cloud SQL Best Practices | ⚪ | 2 | CLOUDSQL | 27 | Cloud SQL best practices: proxy, connection pooling and read replicas. |
| 09 - Step 08 - Connect to Cloud SQL instance - Scenarios | ⚪ | 2 | CLOUDSQL | 27 | Cloud SQL connection scenarios: private IP, VPC access and proxy. |

### 25 - Getting started with Cloud Spanner
*7 lectures · 22 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting started with Cloud Spanner | 🟡 | 2 | SPANNER | 22 | Introduction to Cloud Spanner: global relational database with high availability. |
| 03 - Step 02 - Demo - Playing with Cloud Spanner V2 | 🟢 | 8 | SPANNER | 22 | Cloud Spanner demo: instance, database, tables and import/export. |
| 04 - Step 03 - Designing Cloud Spanner Tables - Interleave | ⚪ | 2 | SPANNER | 22 | Interleaved tables in Spanner to co-locate related data in the same place. |
| 05 - Step 04 - Exploring Cloud Spanner Queries - UNNEST | ⚪ | 2 | SPANNER | 22 | Cloud Spanner queries: using UNNEST for batch DML with arrays. |
| 06 - Step 05 - Understanding Cloud Spanner Client Librarie | 🟡 | 2 | SPANNER | 22 | Cloud Spanner client libraries: supported languages and automatic retry. |
| 07 - Step 06 - Exploring Cloud Spanner Transactions | ⚪ | 2 | SPANNER | 22 | Cloud Spanner transactions: read-write, read-only and partitioned modes. |
| 08 - Step 07 - Understanding Cloud Spanner Best Practices | ⚪ | 3 | SPANNER | 22 | Cloud Spanner best practices: primary key, multi-region and CPU below threshold. |

### 26 - NoSQL in Google Cloud - Cloud Datastore, Cloud Firestore and Cloud BigTable
*11 lectures · 42 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Getting started with Cloud Datastore and Cl | 🟢 | 2 | FIRESTORE | 53 | Introduction to Cloud Datastore/Firestore: NoSQL document database and collections. |
| 02 - Step 02 - Demo - Playing with Firestore | 🟢 | 11 | FIRESTORE | 53 | Firestore demo: creating collections, documents, hierarchy and indexes. |
| 03 - Step 03 - Exploring Cloud Firestore - Native mode vs  | 🟡 | 2 | FIRESTORE | 53 | Firestore Native mode vs Datastore mode: differences and when to use each. |
| 04 - Step 04 - Deciding Firestore locations - Regional vs  | 🟡 | 2 | FIRESTORE | 53 | Firestore location: regional vs multi-region, availability and latency. |
| 05 - Step 05 - Using Indexes with Firestore | 🟡 | 3 | FIRESTORE | 53 | Automatic and composite indexes in Firestore; exemptions and costs. |
| 06 - Step 06 - Exploring Firestore client libraries | 🟢 | 5 | FIRESTORE | 53 | Cloud client libraries and the Firebase SDK for Firestore. |
| 07 - Step 07 - Exploring Transactions with Firestore | 🟡 | 2 | FIRESTORE | 53 | Read-write and read-only transactions in Firestore. |
| 08 - Step 08 - Understanding Cloud Firestore Best Practice | 🟢 | 3 | FIRESTORE | 53 | Firestore best practices: keys, limits and the 555 rule. |
| 09 - Step 09 - Getting started with Cloud BigTable | 🟢 | 4 | BIGTABLE | 18 | Introduction to Cloud Bigtable: use cases, structure and the cbt CLI. |
| 10 - Step 10 - Designing BigTable Tables | 🟡 | 4 | BIGTABLE | 18 | Bigtable row key design for efficient queries. |
| 11 - Step 11 - Understanding Cloud BigTable Best Practices | 🟡 | 4 | BIGTABLE | 18 | Bigtable best practices: SSD, cross-cluster replication and zones. |

### 27 - Asynchronous Communication in Google Cloud - Pub Sub and Cloud Tasks
*7 lectures · 31 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Understanding Need for Asynchronous Communi | 🟢 | 3 | PUBSUB | 68 | The need for asynchronous communication and decoupling applications. |
| ⭐02 - Step 02 - Getting Started with Cloud Pub Sub | 🟢 | 4 | PUBSUB | 68 | Pub/Sub overview: topics, subscriptions, push and pull models. |
| 03 - Step 03 - Exploring Cloud Pub Sub - Publishing and Co | 🟢 | 2 | PUBSUB | 68 | Publishing and consuming Pub/Sub messages with acknowledgments (ack). |
| 05 - Step 04 - Demo - Playing with Cloud Pub Sub V2 | 🟢 | 10 | PUBSUB | 68 | Hands-on demo: creating a topic, subscriptions and messages in Pub/Sub. |
| 06 - Step 05 - Using Cloud Client Libraries - Pub Sub | 🟢 | 3 | PUBSUB | 68 | Cloud client libraries to publish and consume Pub/Sub messages. |
| 07 - Step 06 - Getting Started with Cloud Tasks | 🟢 | 5 | TASKS | 4 | Cloud Tasks: queues, explicit HTTP invocation and the difference from Pub/Sub. |
| 08 - Step 07 - Scheduling with Google Cloud Scheduler | 🟡 | 4 | SCHED | 4 | Cloud Scheduler: cron scheduling for jobs, Pub/Sub and HTTP endpoints. |

### 28 - Operations in Google Cloud Platform
*20 lectures · 65 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 00 - Operations in Google Cloud - Section Introd | 🔴 | 1 | FOUND | 0 | Introduction to the operations section in Google Cloud Platform. |
| 02 - Step 01 - Getting Started with Google Cloud Monitorin | 🟡 | 4 | MONITORING | 41 | Cloud Monitoring: metrics, alerts, workspaces and the monitoring agent. |
| 03 - Step 02 - Getting Started with Google Cloud Logging | 🟡 | 3 | LOGGING | 40 | Cloud Logging overview: ingestion, Log Explorer and the Fluentd agent. |
| 04 - Step 03 - Exploring Google Cloud Logging - Audit Logs | 🟡 | 5 | LOGGING | 40 | Audit Logs in Cloud Logging: types, permissions and resource examples. |
| 05 - Step 04 - Exploring Google Cloud Logging - Routing Lo | 🟢 | 5 | LOGGING | 40 | Routing and exporting logs to GCS, BigQuery and Pub/Sub. |
| 06 - Step 05 - Creating a Cloud Storage Bucket and Cloud F | 🟢 | 3 | CLOUDFUNC | 60 | Creating a bucket and an upload-triggered Cloud Function for a logging demo. |
| 07 - Step 06 - Demo - Playing with Cloud Logging | 🟡 | 8 | LOGGING | 40 | Cloud Logging demo: Log Explorer, default buckets and log routers. |
| 08 - Step 07 - Demo - Playing with Cloud Monitoring | 🟡 | 6 | MONITORING | 41 | Cloud Monitoring demo: Metrics Explorer, alerts and uptime checks. |
| 09 - Step 08 - Setting up Cloud Monitoring for Virtual Mac | 🟡 | 2 | MONITORING | 41 | Setting up Cloud Monitoring for VMs with the Ops agent and collectd. |
| 10 - Step 09 - Collecting Logs for Cloud Logging | 🟢 | 3 | LOGGING | 40 | Collecting logs for Cloud Logging: Fluentd and Ops agents per service. |
| 11 - Step 10 - Creating Custom Metrics - Cloud Monitoring | ⚪ | 2 | MONITORING | 41 | Creating custom metrics with OpenCensus in Cloud Monitoring. |
| 12 - Step 11 - Creating Logs based metrics for Cloud Monit | 🟡 | 3 | LOGGING | 40 | Logs-based metrics: counter and distribution for Cloud Monitoring. |
| 13 - Step 12 - Configuring Cloud Monitoring & Cloud Loggin | 🟡 | 3 | MONITORING | 41 | GKE integration with Cloud Monitoring and Logging; using Prometheus. |
| 14 - Step 13 - Getting Started with Cloud Trace | 🟡 | 2 | TRACE | 11 | Cloud Trace: distributed latency tracing across microservices. |
| 15 - Step 14 - Instrumenting your application - Cloud Trac | 🟡 | 2 | TRACE | 11 | Instrumenting applications with OpenTelemetry, OpenCensus and Zipkin. |
| 17 - Step 15 - Getting Started with Cloud Debugger | 🔴 | 2 | DEBUGGER | 0 | Cloud Debugger: snapshots and logpoints in production without redeploying. |
| 18 - Step 16 - Getting Started with Cloud Profiler | 🟡 | 2 | PROFILER | 7 | Cloud Profiler: identifying CPU and memory bottlenecks in production. |
| 19 - Step 17 - Getting Started with Error Reporting | 🟢 | 3 | ERRORREP | 6 | Error Reporting aggregates production app exceptions in real time. |
| 20 - Step 18 - What is Stackdriver_ | 🔴 | 1 | FOUND | 0 | Mapping legacy Stackdriver names to current Cloud services. |
| 21 - Step 19 - Exploring Cloud Operations Scenarios | 🟢 | 3 | MONITORING | 41 | Operations scenarios: alerts, metrics, tracing and debugging in the cloud. |

### 29 - Exploring Security in Google Cloud
*9 lectures · 26 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Enhance Security with Cloud Armor | 🟡 | 2 | VPC | 33 | Cloud Armor protects applications against DDoS and OWASP Top 10 attacks. |
| 02 - Step 02 - Managing Secrets with Google Cloud Secret M | 🟢 | 3 | SECRETS | 12 | Secret Manager securely stores passwords and API keys with versioning. |
| 03 - Step 03 - Getting Started with Container Scanning API | 🟡 | 3 | SECSCAN | 12 | The Container Scanning API checks container images for vulnerabilities. |
| 04 - Step 04 - Getting Started with Binary Authorization | 🟢 | 4 | BINAUTH | 7 | Binary Authorization ensures only attested container images are deployed. |
| 05 - Step 05 - Getting Started with VPC Service Controls | 🟢 | 2 | VPC | 33 | VPC Service Controls prevent data exfiltration beyond configured perimeters. |
| 06 - Step 06 - Implement Data Security with Cloud Data Los | 🟢 | 6 | SECSCAN | 12 | Cloud DLP discovers, classifies and masks sensitive data in storage. |
| 07 - Step 07 - Exploring Other Google Cloud Security Offer | 🟡 | 4 | SECSCAN | 12 | Overview of Web Security Scanner, Anomaly Detection and Container Threat Detection. |
| 08 - Step 08 - Getting Started with Security Command Cente | 🟡 | 2 | SECSCAN | 12 | Security Command Center centralizes security and risk visibility across projects. |
| 09 - Step 09 - Exploring Google Cloud and Security - Scena | 🟢 | 2 | SECSCAN | 12 | Security scenarios: which service to use for each protection need. |

### 30 - Getting Started with Anthos and Anthos Service Mesh
*8 lectures · 35 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 00 - Getting Started with Anthos | 🟡 | 5 | ANTHOS | 20 | Anthos manages Kubernetes clusters across multiple clouds and on-premises. |
| 02 - Step 01 - Getting Started with Service Mesh | 🟡 | 3 | ANTHOS | 20 | A service mesh with a sidecar proxy implements common features across microservices. |
| 03 - Step 02 - Getting Started with Istio and Anthos Servi | 🟡 | 6 | ANTHOS | 20 | Istio and Anthos Service Mesh: security, observability and traffic management. |
| 05 - Step 03 - Demo - Istio and Anthos Service Mesh - Gett | 🟡 | 2 | ANTHOS | 20 | Demo: installing Anthos Service Mesh on a GKE cluster via Cloud Shell. |
| 06 - Step 04 - Demo - Installing Anthos Service Mesh | 🟡 | 4 | ANTHOS | 20 | Demo: running the ASM install script and configuring sidecar injection in the namespace. |
| 07 - Step 05 - Demo - Deploying Demo Microservices to GKE | 🟡 | 5 | ANTHOS | 20 | Demo: deploying demo microservices to GKE with Anthos Service Mesh. |
| 08 - Step 06 - Demo - Exploring Anthos Service Mesh | 🟡 | 8 | ANTHOS | 20 | Demo: exploring the Anthos Service Mesh dashboard with metrics, SLOs and topology. |
| 09 - Step 07 - A Quick Review - Putting things into contex | 🟡 | 2 | ANTHOS | 20 | Quick review: Docker, Kubernetes, GKE, Istio and Anthos in context. |

### 31 - Exploring Google Cloud Compute Engine VMs
*6 lectures · 27 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - GCE VMs - Internal DNS | 🟢 | 4 | GCE | 50 | GCE VM zonal internal DNS enables communication without using IP addresses. |
| 02 - Step 02 - SSHing into Linux VMs - 1 | 🟡 | 4 | GCE | 50 | SSH authentication on Linux VMs: managed metadata vs OS Login. |
| 03 - Step 03 - SSHing into Linux VMs - 2 | 🟡 | 5 | GCE | 50 | Practical SSH methods for Linux VMs: console, gcloud and custom SSH keys. |
| 04 - Step 04 - Executing Shutdown Script on a GCE VM | 🟡 | 4 | GCE | 50 | Shutdown scripts run cleanup before a VM shuts down or is preempted. |
| 05 - Step 05 - GCE VMs - Project and Instance Custom Metad | 🟡 | 4 | GCE | 50 | Custom project and instance metadata configure values for scripts. |
| 06 - Step 06 - Troubleshooting VM startup | 🟡 | 5 | GCE | 50 | VM startup troubleshooting: quotas, full disk and serial output. |

### 32 - Release Management in Google Cloud
*8 lectures · 23 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Getting Started with Release Management | ⚪ | 2 | DEPLOYSTRAT | 41 | Introduction to release management: goals and rollout best practices. |
| 02 - Step 02 - Deployment Approach - Recreate | ⚪ | 2 | DEPLOYSTRAT | 41 | Recreate approach: replaces v1 with v2 with downtime but no extra infrastructure. |
| 03 - Step 03 - Deployment Approach - Canary and A_B Testin | ⚪ | 4 | DEPLOYSTRAT | 41 | Canary deployment and A/B testing validate a new version on a subset of instances. |
| 04 - Step 04 - Deployment Approach - Rolling and Rolling w | ⚪ | 4 | DEPLOYSTRAT | 41 | Rolling deployment updates instances in gradual batches with no downtime. |
| 05 - Step 05 - Deployment Approach - Blue Green and Shadow | ⚪ | 4 | DEPLOYSTRAT | 41 | Blue-Green deployment and shadow testing: instant version switch with rollback. |
| 06 - Step 06 - Exploring Deployment Approaches for MIGs | ⚪ | 3 | DEPLOYSTRAT | 41 | Rolling, canary and blue-green strategies on Compute Engine MIGs. |
| 07 - Step 07 - Exploring Deployment Approaches for App Eng | ⚪ | 2 | DEPLOYSTRAT | 41 | Canary, blue-green deployments and traffic splitting in App Engine. |
| 08 - Step 08 - GKE - Releasing New Versions | 🟡 | 3 | DEPLOYSTRAT | 41 | Rolling, blue-green and canary strategies for releases in GKE. |

### 33 - Google Cloud Developer - Best Practices
*5 lectures · 17 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| ⭐01 - Step 01 - Understanding Best Practices for Creating D | ⚪ | 9 | DOCKER | 26 | Best practices for creating Dockerfiles and lightweight Docker images. |
| ⭐02 - Step 02 - Understanding Semantic Versioning - Docker  | ⚪ | 2 | DOCKER | 26 | Semantic versioning applied to Docker image tags. |
| 03 - Step 03 - Exploring Function Identity for Cloud Funct | 🟡 | 2 | IAM | 85 | Function identity and service account for Cloud Functions. |
| ⭐04 - Step 04 - Exploring Google Cloud IDE Integration - Cl | 🟢 | 3 | DEVENV | 44 | Cloud Code simplifies development, debugging and deployment on GCP. |
| ⭐05 - Step 05 - Simplify Development with Google Cloud Emul | 🟡 | 1 | DEVENV | 44 | Local emulators for Bigtable, Firestore, Pub/Sub and Spanner. |

### 34 - Architecture at 10,000 feet for Google Cloud Developer
*11 lectures · 27 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - 10000 Feet Overview - Architectures in Google Cloud - | 🟡 | 1 | ARCH | 72 | Introduction to the architectures section relevant to the GCP developer. |
| 02 - Step 00 - Content Distribution with Cloud CDN | 🟡 | 6 | CDN | 6 | Cloud CDN integrated with external HTTPS load balancing. |
| ⭐03 - Step 01 - Architecture - Loose Coupling with Pub Sub | 🟢 | 2 | PUBSUB | 68 | Pub/Sub for loose coupling in microservices and IoT architectures. |
| 04 - Step 02 - Architecture 1 - Big Data Flow - Batch Inge | 🟢 | 2 | BIGQUERY | 35 | Big data batch ingestion architecture: GCS, ETL and BigQuery. |
| 05 - Step 03 - Architecture 2 - Streaming Data - Realtime  | 🟢 | 1 | ARCH | 72 | Streaming architecture with Pub/Sub, Dataflow and Bigtable in real time. |
| 06 - Step 04 - Architecture 3 - IOT | 🟢 | 2 | ARCH | 72 | IoT architecture with IoT Core, Pub/Sub, Dataflow and storage. |
| 07 - Step 05 - Architecture 4 - Serverless Full Stack | 🟢 | 2 | ARCH | 72 | Serverless full-stack architecture with CDN, Cloud Functions and API Gateway. |
| 08 - Step 06 - Architecture 5 - Logging | 🟢 | 1 | LOGGING | 40 | Routing Cloud Logging logs to GCS, Pub/Sub and BigQuery. |
| 09 - Step 07 - Exploring Load Testing in Google Cloud | 🟡 | 4 | GKE | 184 | Distributed load testing with Locust deployed on GKE. |
| 10 - Step 08 - Exploring API management - Apigee, Endpoint | 🟢 | 4 | APIMGMT | 32 | Apigee, Cloud Endpoints and API Gateway compared in GCP. |
| 11 - Step 09 - Monolith to Microservices_ Application Mode | 🟢 | 2 | ARCH | 72 | Best practices for modernizing a monolith into microservices in the cloud. |

### 35 - Course Updates - New Exam Guide - October 2022
*5 lectures · 21 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Step 01 - Quick Introduction to Identity Platform | 🟡 | 5 | AUTHN | 50 | Identity Platform for end-user authentication in web/mobile apps. |
| 02 - Step 02 - Getting Stared with Event Driven Architectu | 🟢 | 5 | EVENTARC | 7 | Event-driven architecture, CloudEvents and loose coupling. |
| 03 - Step 03 - Quick Introduction to Eventarc | 🟢 | 6 | EVENTARC | 7 | Eventarc: event providers, destinations and triggers in GCP. |
| 04 - Step 04 - Getting Started with Observability and Open | 🟡 | 3 | MONITORING | 41 | Observability with OpenTelemetry: standardized logs, metrics and traces. |
| 05 - Step 05 - Quick Introduction to Service Directory | 🟡 | 2 | ARCH | 72 | Service Directory for service discovery in microservices architectures. |

### 36 - Case Study - Google Cloud Certified Professional Cloud Developer
*3 lectures · 8 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 02 - Step 01 - Getting Started with Case Study - Hip Local | 🔴 | 2 | FOUND | 0 | Introduction to the HipLocal case study and tips for the PCD exam. |
| 03 - Step 02 - Case Study - HipLocal - Overview and Requir | 🟡 | 3 | ARCH | 72 | HipLocal case study: overview and requirements for the exam. |
| 04 - Step 03 - Case Study - HipLocal - Discussion | 🟢 | 4 | ARCH | 72 | GCP service recommendations for the HipLocal case study. |

### 37 - Google Cloud Professional Cloud Developer Certification - Getting Ready
*3 lectures · 7 min*

| Lecture | Level | min | Topic | #Q | Summary |
|---|:--:|---:|:--:|---:|---|
| 01 - Resources - Google Cloud Certification - Professional | 🔴 | 3 | FOUND | 0 | Resources and registration instructions for the Professional Cloud Developer exam. |
| 02 - Getting Ready - Google Cloud Certification - Professi | 🔴 | 3 | FOUND | 0 | Tips and strategies for time management on the PCD exam. |
| 03 - Congratulations - Google Cloud Certification - Profes | 🔴 | 1 | FOUND | 0 | Congratulations message and course wrap-up for PCD. |

---
## 6. Concrete concepts tested in the gap topics

Extracted from the questions themselves — not just the service name, but what the exam expects you to know.

### CLOUDRUN · Cloud Run  *(weight 81.5 · 116 questions · 13 min of lecture)*
- Cloud Run autoscales from zero to very high peaks (e.g., 6,000 req/s, 70,000 req/min) based on requests; ideal for bursty workloads with long idle periods — you pay only for actual usage.
- The concurrency setting (--concurrency) controls how many simultaneous requests each instance serves; lowering it for memory-heavy apps prevents the instance from being killed by OOM.
- min-instances avoids cold starts by keeping instances warm; max-instances enforces a ceiling — hitting that ceiling causes queueing and 503 errors under peak load.
- Traffic splitting between revisions enables canary/gradual rollout and A/B testing of configurations (CPU, memory, concurrency) with real traffic without changing code.
- Cloud Run supports gRPC over HTTP/2 with persistent connections within the configurable timeout limits; suitable for long sessions (2–45 min) with automatic scaling.
- Application logs should be written to stdout/stderr — Cloud Run forwards them automatically to Cloud Logging; it requires no GCP-specific libraries, keeping portability.
- For private access to Cloud Storage or Cloud SQL (private IP): use a dedicated Service Account with the minimum role + a Serverless VPC Access connector for connectivity inside the VPC.
- Runtime metadata (project ID, region) is read from the internal metadata server (metadata.google.internal/computeMetadata/v1) with the mandatory header Metadata-Flavor: Google — no extra API latency.
- Graceful shutdown: the app must catch SIGTERM, finish in-flight requests and exit within the configurable termination period — avoids dropped connections during rollout or scale-down.
- A client-side circuit breaker pattern protects Cloud Run from slow dependencies; a simple timeout/retry is not enough because it keeps instances stuck waiting for responses.

### APIMGMT · API mgmt (Apigee/Endpoints/Gateway)  *(weight 28.0 · 32 questions · 4 min of lecture)*
- Cloud Endpoints: GCP's API management product for authentication (API keys, JWT, OAuth), per-client quotas, usage analytics via Cloud Monitoring/Logging and a documentation portal; works with backends on Cloud Run, GKE and Compute Engine without migrating workloads.
- Apigee: full-lifecycle platform for enterprise APIs — includes a hosted developer portal with self-service API keys, SDKs, deep analytics, per-tier quota policies (e.g., 'starter' vs 'pro'), advanced threat protection; choose it when the scenario requires a developer portal or granular per-product quotas.
- API Gateway: managed entry point for Cloud Run/Cloud Functions in serverless architectures; integrates with IAM for authentication, emits metrics via Cloud Monitoring — suitable for ~25 services needing centralized routing and metrics.
- The API Key policy in Apigee/Endpoints validates keys issued to registered apps; different from OAuth 2.0 — it checks the key's existence, expiration and authorization, not access tokens.
- API versioning (/v1, /v2) is the right strategy to introduce breaking changes: keep both versions in parallel until all clients migrate; never break existing contracts abruptly.
- Strangler fig pattern: use API Gateway or a Load Balancer to gradually divert traffic from the monolith to microservices — the gateway is the central routing point during migration.
- In Apigee, environment groups control which hostnames reach which environments: subs-dev in the dev group (api-dev.example.com) and subs-prod in the prod group (api.example.com) ensure strict isolation.
- The Apigee Analytics Viewer role grants access to traffic, latency and error reports per environment without admin permissions — least privilege for SRE teams.
- Service Directory: managed registry for microservices — services register on deploy and clients discover them at runtime via API or DNS; eliminates fragile environment variables with hardcoded URLs.

### BIGQUERY · BigQuery  *(weight 24.0 · 35 questions · 6 min of lecture)*
- Streaming insert (insertAll / streaming API) makes rows queryable within seconds — use it for analytics availability requirements under ~75 seconds; batch load is cheaper but has higher latency.
- Authorized views in BigQuery: create views filtered by criteria (e.g., department) and grant access only to the view — provides row-level security without duplicating data or exposing base tables.
- Batch jobs in BigQuery: queue queries to run when idle capacity is available — ideal for analysts who accept higher latency and must not interfere with critical workloads; no extra cost.
- BigQuery supports denormalized data with nested (STRUCT) and repeated (ARRAY) columns — better OLAP performance than normalized joins; UNNEST converts an ARRAY into a table.
- roles/bigquery.dataViewer: read-only on tables/views of a specific dataset, without changing data or schema. roles/bigquery.jobUser: allows creating and submitting jobs via the bq CLI without granting dataset access. Both together are needed to run queries as jobs.
- Datastream CDC (Change Data Capture) replication from Cloud SQL to BigQuery in seconds — offloads analytics workloads from the transactional instance without contention; fully managed.
- Standard pipeline for real-time events: Pub/Sub (global ingestion + buffer) → Dataflow (windows, aggregations, streaming) → BigQuery (storage + SQL) → Looker Studio (dashboards).
- To export Cloud Logging logs to BigQuery: create the destination dataset BEFORE creating the log sink — BigQuery creates and manages the tables automatically once the sink is configured.
- Workload Identity is the recommended practice for GKE to access BigQuery: bind the Kubernetes SA to a Google SA without exporting long-lived keys — avoid JSON credentials in Secrets.
- ANY_VALUE() returns a random value from the group; UNNEST() converts an ARRAY into rows — analyst-level functions tested directly in BigQuery SQL syntax questions.

### ARTIFACT · Artifact / Container Registry  *(weight 17.0 · 31 questions · 6 min of lecture)*
- Artifact Registry supports multiple formats in a single service: Docker, npm, Maven, Python, Go — use it instead of Container Registry for multi-purpose repositories.
- To scan CVEs automatically when pushing images, enable the Container Analysis API; scanning happens automatically with no change to the Cloud Build pipeline.
- Binary Authorization prevents images without a signed attestation from being deployed to GKE or Cloud Run — combine Cloud Build (attestation generation) + Artifact Registry (storage) + Binary Authorization (admission policy).
- For reproducible, secure builds, pin builder images in cloudbuild.yaml using the SHA256 digest instead of mutable tags.
- To speed up Cloud Build builds without new infrastructure: use a larger machine type AND add --cache-from (Docker layer cache) or Kaniko caching with Artifact Registry.
- Workload Identity is the recommended method for GKE pods to pull private images from Artifact Registry without distributing long-lived JSON keys.
- To build images without a Dockerfile: use gcloud run deploy --source (Cloud Buildpacks via Cloud Build) or the pack build CLI; both publish to Artifact Registry.
- Centralized image repository in an operations project: grant the Artifact Registry Writer role to each development project's Cloud Build service account; no static credentials.
- The required field when creating a Cloud Build trigger is Source (repository + branch/tag); timeout and service account are optional.

### MEMORYSTORE · Memorystore / caching  *(weight 12.5 · 15 questions · 1 min of lecture)*
- Memorystore for Redis: fully managed in-memory storage with sub-millisecond latency; main use for read caching, user sessions with TTL and ephemeral data that cannot touch disk.
- Standard separation of concerns: session data (ephemeral, configurable TTL) → Memorystore for Redis; durable data (cart, preferences, wishlist) → Firestore — a recurring combination in the questions.
- Cloud Run has no direct access to Memorystore (private IP) — it requires a Serverless VPC Access connector in the SAME region AND the SAME VPC network as the Redis instance; a connector in a different region or VPC = connection failure.
- Memorystore for Redis supports per-key expiration (TTL) to implement automatic sign-out on inactivity (e.g., 30 min); Memcached lacks such robust native per-key TTL support.
- For high availability of sessions across multiple regions (e.g., tolerance to a whole-region failure): use Firestore multi-region, not Memorystore — Redis is zonal/regional, not natively multi-region.
- Memorystore as temporary storage for in-request sensitive data (compliance that forbids writing to disk): data stays in memory, expires via TTL, with no write to the container filesystem.
- To list Memorystore instances via CLI: gcloud redis instances list --filter=... — a service-specific command, not generic.
- HTTP 429 RESOURCE_EXHAUSTED from Firestore during peaks: use exponential backoff with jitter to spread retries and avoid a thundering herd; optimize access patterns (hot documents).

### SECRETS · Secret Manager  *(weight 11.0 · 12 questions · 3 min of lecture)*
- Secret Manager: centralized, auditable storage for tokens, passwords and API keys with versioning, granular IAM access control and Cloud Audit Logs — a product dedicated to secrets.
- Workload Identity + Secret Manager on GKE: binding the Kubernetes SA to a Google SA removes the need to export long-lived JSON keys; pods fetch the secret at runtime without embedding it in the manifest or image.
- Secret Manager with automatic rotation: configure a rotation notification that triggers a Cloud Function to generate a new secret version within the defined period (e.g., every 35 or 45 days).
- Cloud Build + Secret Manager: reference secrets via the availableSecrets field in cloudbuild.yaml — avoids exposing API keys in pipeline logs or config files.
- Kubernetes Secrets vs ConfigMaps: Secrets are for sensitive data (passwords, tokens) with encryption support via the Cloud KMS plugin (etcd); ConfigMaps are for non-sensitive configuration — never store credentials in ConfigMaps.
- Secret Manager + Workload Identity is preferable to Kubernetes Secrets when the requirement is that the value not be accessible via the Kubernetes API (kubectl get secret) — the secret never enters the cluster's etcd.
- Application Default Credentials (ADC): automatic mechanism that uses the SA attached to the instance/container to obtain short-lived OAuth tokens from the metadata server — Cloud Functions, Cloud Run and GCE use ADC with no manual configuration.
- Compute Engine instance metadata is accessible to ANY process on the VM — don't store secrets in instance metadata; move them to Secret Manager with a dedicated minimal-permission SA.

### WIF · Workload Identity (Federation)  *(weight 13.0 · 16 questions · 9 min of lecture)*
- Workload Identity is Google's recommended practice for GKE pods to access GCP APIs without long-lived JSON keys — use it whenever the question mentions 'no static credentials'.
- Setup flow: enable Workload Identity on the cluster → create a KSA (Kubernetes Service Account) → create a GSA (Google Service Account) → bind the KSA to the GSA → grant roles/iam.workloadIdentityUser to the KSA on the GSA.
- The IAM role required for federation is roles/iam.workloadIdentityUser, assigned to the principal 'serviceAccount:PROJECT.svc.id.goog[NAMESPACE/KSA]'.
- Workload Identity provides short-lived tokens that are rotated automatically — eliminating key-leak risk and the operational burden of manual rotation.
- Secret Manager + Workload Identity combination: store secrets in Secret Manager, grant access to the GSA and retrieve them at runtime via API — the value never appears in the manifest or the Kubernetes object.
- Avoid using a service account on the NodeConfig (node level) for API access: it grants the same permissions to all pods on the node, violating least privilege; Workload Identity is more granular.
- For GCP API access from outside GCP (e.g., external CI/CD), prefer Workload Identity Federation (federation with OIDC/SAML) over exported JSON keys.
- When accessing Artifact Registry from GKE pods: Workload Identity + a GSA with the Storage Object Viewer (or Artifact Registry Reader) role on the specific repository.

### DATAFLOW · Dataflow / data processing  *(weight 10.5 · 12 questions · 0 min of lecture)*
- Dataflow is the default service for high-throughput, low-latency streaming on GCP: managed, serverless, scales elastically (including 5x peaks) with no manual intervention.
- For event ingestion + near-real-time SQL: Pub/Sub (durable buffer) → Dataflow (processing with Apache Beam PubSubIO) → BigQuery (analytics).
- Dataflow guarantees exactly-once semantics when combined with idempotent sinks (e.g., BigQuery) and correct acknowledgment of Pub/Sub messages.
- Time windows (windowing) in Apache Beam/Dataflow let you aggregate events into fixed windows (e.g., 30 or 60 min) before writing totals to BigQuery.
- Datastream uses CDC (Change Data Capture) to replicate Cloud SQL for PostgreSQL → BigQuery with seconds of latency and no impact on the production instance.
- To migrate Hadoop/Spark/Hive to GCP with minimal code changes: use Cloud Dataproc + Cloud Storage (via the GCS connector) as a replacement for HDFS.
- Recommended architecture for a global voting/leaderboard with peaks: Pub/Sub (ingest) → Dataflow streaming (windowed aggregation) → BigQuery (raw + aggregated) → Looker Studio (dashboard).
- Dataflow autoscaling is based on backlog and real-time latency signals to absorb peaks without manual worker configuration.

### EVENTARC · Eventarc / Workflows  *(weight 6.5 · 7 questions · 11 min of lecture)*
- Eventarc is GCP's unified event layer: it ingests events from Cloud Storage, Pub/Sub and Cloud Audit Logs and routes them to Cloud Run, GKE or Workflows with no custom integration code.
- Eventarc triggers are declarative resources separate from the service code: change event filters (type, object prefix, exact name) without redeploying the app.
- To react only to a specific object in Cloud Storage, filter by the subject attribute (object name) in the Eventarc trigger — e.g., reports/daily.csv.
- To react to bucket-creation events (or other administrative operations), configure an Eventarc trigger for Cloud Audit Log events with the specific method (e.g., storage.buckets.create).
- Cloud Functions 2nd generation uses Eventarc as its native trigger mechanism — replacing the direct Cloud Functions 1st-gen triggers for Cloud Storage and Pub/Sub.
- To filter by a folder prefix in Cloud Storage (e.g., /ingest/photos/), use the object-name filter in the Eventarc trigger — no redeployment when changing the prefix.
- Pub/Sub + Eventarc: publish events to a Pub/Sub topic and use Eventarc to invoke Cloud Run or GKE — a pattern to absorb peaks and decouple producers from consumers.

### CLIENTLIB · Client Libraries / API consumption  *(weight 28.0 · 39 questions · 20 min of lecture)*
- Implement exponential backoff with jitter for 429 (RESOURCE_EXHAUSTED) and 503/504 (transient) errors: avoids a thundering herd and lets the downstream service recover.
- Use pagination with cursors (Firestore) or pagination tokens to limit the data returned per query — reduces memory usage and avoids HTTP 500 from instance overload.
- Group multiple rows into a single InsertAllRequest (BigQuery Java client) to reduce round-trips and per-request overhead — never send one request per row in a loop.
- Use the fields parameter (partial response) on the Cloud Storage JSON API to return only the needed metadata properties — reduces payload and latency on high-volume operations.
- For a cold Cloud Storage bucket (no prior traffic), ramp up the request rate gradually to avoid 5xx/429 errors — the backend needs time to allocate resources.
- Use the official Cloud Client Libraries (e.g., Pub/Sub, Spanner, Cloud Storage) instead of direct REST calls: they manage session pooling, gRPC channels, automatic retries, batching and authentication.
- gRPC with Protocol Buffers is superior to REST/JSON for internal microservice communication: smaller binary payload, HTTP/2 multiplexing, lower latency and CPU — use it for >1,000 req/s or frequent payloads.
- REST with JSON is preferable for external/partner integrations with changing contracts, legacy clients and scenarios where request inspection/replay is needed.
- To enable GCP APIs programmatically and repeatably across multiple projects, use the Service Management API (not the manual console).
- CORS: return Access-Control-Allow-Origin with the client's exact origin (e.g., https://app.example.com) — don't use '*' with credentialed requests.

### BINAUTH · Binary Authorization  *(weight 7.0 · 7 questions · 4 min of lecture)*
- Binary Authorization is a deploy-time admission control: it blocks pods/revisions on GKE and Cloud Run that lack the attestations required by the configured policy.
- The canonical flow is: Cloud Build produces the attestation after checks (tests, vulnerability scan), the image is stored in Artifact Registry with the attestation, and Binary Authorization verifies the signature before allowing the deploy.
- Attestations are cryptographically signed with keys managed in Cloud KMS; the attestor is the component that links the key to the approval criterion.
- For multi-project environments (e.g., dev/UAT/prod), the Binary Authorization policy is evaluated in the project that owns the target cluster; cluster-specific rules allow granularity within the same project.
- Integration with Artifact Analysis (Container Analysis API) enables automatic blocking of images with critical CVEs: Cloud Build queries the findings and only creates the attestation if there are no critical vulnerabilities.
- The service combination for supply chain security is: Cloud Build (CI + attestation generation) + Artifact Registry (storage of signed images) + Binary Authorization (enforcement at deploy).
- Binary Authorization supports both GKE and Cloud Run as enforcement surfaces, not limited to Kubernetes.

### PROFILER · Cloud Profiler  *(weight 7.0 · 7 questions · 2 min of lecture)*
- Cloud Profiler performs continuous profiling in production with very low overhead (statistical sampling), without interrupting traffic; it supports Java, Go, Python and Node.js on GKE and Compute Engine.
- The CPU time profiler type measures the time the processor spends actively executing code and attributes consumption to specific functions; ideal for investigating CPU saturation.
- The Wall time profiler type measures total elapsed time per code path, including wait time (I/O, network, locks); ideal for diagnosing user-perceived latency.
- Flame graphs in Cloud Profiler visualize which functions and stacks dominate CPU or memory (heap) consumption, making it easier to prioritize optimizations.
- Cloud Profiler works even with low traffic, because sampling is based on execution time rather than request volume; useful for spotting idle loops or runaway goroutines.
- Cloud Profiler does not replace Cloud Debugger (variable state inspection) nor Cloud Trace (distributed request latency); each tool has a distinct diagnostic scope.

### TRACE · Cloud Trace  *(weight 8.5 · 11 questions · 4 min of lecture)*
- Cloud Trace is a distributed tracing system that collects request latency data, showing how a request travels through multiple microservices with precise spans and per-hop timings.
- The recommended instrumentation is via OpenTelemetry, which sends traces to Cloud Trace; this covers the three observability signals: logs, metrics and traces.
- To force tracing of a specific request (overriding the default sampling), send the X-Cloud-Trace-Context header with the sampling flag enabled (;o=1).
- To correlate application logs with traces in Cloud Logging, the structured log (JSON on stdout) must include the logging.googleapis.com/trace field with the trace ID extracted from the X-Cloud-Trace-Context header.
- Cloud Run automatically writes logs sent to stdout; emitting structured JSON with the trace field populated ensures automatic correlation with request traces in Cloud Logging.
- For high-scale load testing (e.g., 11,000 reads/s + 2,200 writes/s on Cloud Spanner + Cloud Run), the recommended approach is GKE with Locust/JMeter in horizontally scalable containers + Cloud Trace for bottleneck analysis.
- Cloud Trace is the starting point for diagnosing intermittent latency in microservices: filter by service, method and URL, sort by latency and compare slow traces with normal ones.

### DNS · Cloud DNS  *(weight 7.5 · 10 questions · 0 min of lecture)*
- The automatic internal FQDN of a Compute Engine VM follows the format INSTANCE_NAME.ZONE.c.PROJECT_ID.internal and resolves to the internal IP within the same VPC, with no extra configuration.
- For service discovery within a GKE cluster, the right approach is to create a ClusterIP Service; Kubernetes DNS automatically assigns a stable name to the service, reachable only within the cluster.
- ClusterIP is the Service type for cluster-internal-only communication; the Service's DNS name is used by client pods without hardcoding IPs.
- To map a custom domain on App Engine (a subdomain like www), the process requires: (1) proving domain ownership via Google Search Console and (2) creating a CNAME record pointing to ghs.googlehosted.com.
- On Firebase Hosting, domain ownership verification uses a TXT record that must remain permanently in the DNS configuration; the apex domain covers all subdomains.
- To expose multiple paths (/books, /members, /loans) under a single HTTPS domain with centralized routing to distinct backends (Cloud Functions), use API Gateway with configured routes.
- Kubernetes DNS keeps records updated automatically as pods are added, removed or rescheduled, eliminating the need for manual external DNS management for cluster-internal communication.

### SOURCEREPO · Cloud Source Repositories  *(weight 6.0 · 11 questions · 0 min of lecture)*
- Cloud Source Repositories is a managed private Git repository service on Google Cloud, suitable for teams that cannot use public or internally uncertified repositories.
- A Cloud Build trigger is bound to a single repository; for monorepos or multi-repo, create a separate trigger per repository (compatible with Cloud Source Repositories and GitHub).
- The required field when creating a Cloud Build trigger is Source (repository + branch/tag filter); fields like timeout and service account are optional.
- To ensure code is not deployed without passing tests, Cloud Build should be configured to run the tests using the service account with deploy permission and only deploy if the tests pass.
- The ignoreExitStatus: true parameter on a Cloud Build step lets the build continue to subsequent steps even when the current step fails, enabling teardown/cleanup after failed tests.
- The recommended CI/CD workflow with Cloud Build is: feature branches + merge to main via code review + an automatic trigger on main for build and deploy.
- Separate triggers per event (pull request vs. push to main) pointing to distinct cloudbuild.yaml files allow different pipelines (e.g., tests only on PR, full build + deploy on merge).

---

## 7. Methodology & files

- `analysis/taxonomy.json` — 54 topic codes (services from the bank + domains from the official PCD guide).
- `analysis/q_tags/` — the 741 questions, each with 1 primary code + secondaries (validated: 100% covered, 0 invalid codes).
- `analysis/lecture_tags/` — the 340 lectures likewise, with a 1-line summary (validated: 100%).
- `analysis/scoring.json` — computed weights, minutes, scores and levels.
- `analysis/gap_concepts/` — concrete concepts per gap topic.
- Classification done by AI agents in parallel (sonnet model); weights by: primary=1.0 / secondary=0.5; a lecture's score = the topic's weight divided among the lectures that teach it (redundant lectures split the credit).
