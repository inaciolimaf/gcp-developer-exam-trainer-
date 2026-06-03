# 15 — Autorizacao no GKE (Workload Identity, RBAC)

## O que é

Duas perguntas distintas, duas ferramentas:

1. **Workload Identity Federation for GKE** — como um Pod acessa **APIs do Google Cloud** sem service account key. Faz uma **Kubernetes Service Account (KSA)** agir como identidade do Google Cloud.
   - **KSA** = recurso interno do Kubernetes (criada com `kubectl`, igual Deployment/Service). NAO e do Google.
   - **GSA (Google Service Account)** = recurso de IAM (gcloud/console).
   - Analogia AWS: **EKS IRSA** (associar K8s SA a uma IAM Role da AWS).

2. **Autorizacao no cluster** — quem pode fazer o que. Duas camadas:
   - **Google Cloud IAM** → acesso ao cluster (projeto/pasta/org). Especifico do Google Cloud.
   - **Kubernetes RBAC** → acesso fino a recursos dentro do cluster/namespace. Recurso do **Kubernetes** (funciona em GKE, EKS, AKS, on-prem). Igual ao RBAC que voce ja usa no EKS.

Regra mental: **IAM diz se voce entra no cluster; RBAC diz o que voce faz dentro.** Somam-se.

## Quando usar

- **Workload Identity**: sempre que um workload no GKE precisar chamar API do Google Cloud (Storage, Pub/Sub, etc.). E a abordagem **recomendada** — substitui injetar SA key como Secret no Pod.
- **IAM roles do GKE**: conceder acesso administrativo/operacional ao(s) cluster(es) de um projeto. Use **predefined roles**, nunca basic (owner/editor/viewer).
- **RBAC**: controle fino por namespace/recurso para usuarios e service accounts dentro de um cluster.

## Pontos-chave

- **KSA != GSA.** Decorar essa distincao e meio modulo.
- Fluxo classico (GSA no meio): ativa Workload Identity no cluster → cria GSA com permissoes → cria KSA → aponta Pod (`serviceAccountName`) → costura: `roles/iam.workloadIdentityUser` + anotacao na KSA.
- **Atualidade:** doc oficial hoje recomenda **direct resource access** — bind da role IAM direto no `principal://` da KSA, **sem GSA e sem anotacao**. Conheca os dois.
- Ligou Workload Identity num cluster antigo? **Atualize os node pools** (`--workload-metadata=GKE_METADATA`).
- Sem chaves: GKE **metadata server** entrega credencial de curta duracao. Nada de SA key no disco.
- RBAC = 4 objetos: **Role** (permissoes num namespace), **ClusterRole** (no cluster, sem namespace), **RoleBinding** (liga sujeitos a uma role num namespace), **ClusterRoleBinding** (no cluster inteiro).
- Sujeitos de binding: usuario Google (email), grupo Google, KSA ou GSA.
- IAM roles GKE: `container.admin` (tudo), `container.clusterAdmin` (so gerencia cluster, nao objetos K8s), `container.developer` (gerencia objetos K8s, read no cluster), `container.viewer` (read).

## Comando/CLI (referência)

```bash
# 1. Ativar Workload Identity (criacao ou update)
gcloud container clusters create CLUSTER \
  --workload-pool=PROJECT_ID.svc.id.goog
gcloud container clusters update CLUSTER \
  --workload-pool=PROJECT_ID.svc.id.goog
# update de cluster antigo: atualizar node pool tambem
gcloud container node-pools update POOL --cluster=CLUSTER \
  --workload-metadata=GKE_METADATA

# 2. Criar KSA
kubectl create serviceaccount KSA_NAME --namespace NS

# 3a. Modelo classico (GSA no meio)
gcloud iam service-accounts add-iam-policy-binding GSA@PROJECT.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:PROJECT_ID.svc.id.goog[NS/KSA_NAME]"
kubectl annotate serviceaccount KSA_NAME --namespace NS \
  iam.gke.io/gcp-service-account=GSA@PROJECT.iam.gserviceaccount.com

# 3b. Modelo recomendado (direct resource access, sem GSA)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --role roles/storage.objectViewer \
  --member "principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/PROJECT_ID.svc.id.goog/subject/ns/NS/sa/KSA_NAME"

# Apontar Pod para a KSA:  spec.serviceAccountName: KSA_NAME
```

```yaml
# RBAC: Role + RoleBinding (namespace)
kind: Role          # ClusterRole nao tem namespace
metadata: { namespace: default, name: configmap-editor }
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "update"]
---
kind: RoleBinding
subjects:
- kind: User        # ou Group, ou ServiceAccount
  name: dev@empresa.com
roleRef: { kind: Role, name: configmap-editor }
```

## Pegadinhas de prova

- **KSA nao e GSA.** Se a questao mistura "Kubernetes service account" com "IAM service account", leia com lupa.
- **Service account key no Pod = errado.** A resposta certa quase sempre e **Workload Identity**.
- **RBAC e do Kubernetes**, nao do Google Cloud — vale em EKS/AKS/on-prem tambem. IAM e que e especifico do Google Cloud.
- **Role exige namespace; ClusterRole nao.** RoleBinding pode referenciar uma ClusterRole (reaproveita permissoes num namespace).
- Ligou Workload Identity depois? **Node pools antigos precisam ser atualizados explicitamente.**
- Basic roles (owner/editor/viewer) em cluster GKE = nao recomendado; use predefined.
- Default Compute Engine SA nos nodes = nao recomendado; de aos nodes so logging/monitoring e use Workload Identity por microsservico.

## Fontes

- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
- https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity
- https://docs.cloud.google.com/iam/docs/workload-identities
