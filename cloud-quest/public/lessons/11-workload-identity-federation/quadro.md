# Workload Identity Federation (WIF)

## O que é
- Permite que cargas de **FORA da GCP** (AWS, Azure, GitHub Actions, GitLab, on-prem, OIDC/SAML) acessem recursos GCP **sem service account key (JSON)**.
- Troca de token OAuth 2.0 via **STS (Security Token Service)** → devolve credencial **de curta duração**.
- Equivalente AWS: **IAM OIDC federation / `AssumeRoleWithWebIdentity`**; com cert X.509 ≈ **IAM Roles Anywhere**.

## Quando usar
- Workload externa precisa chamar APIs GCP: EC2/Lambda na AWS, VM no Azure, CI/CD (GitHub Actions, GitLab), K8s on-prem.
- Quer **eliminar service account keys** (segredo de longa duração).
- NÃO usar pra carga dentro do GKE → ver pegadinha.

## Pontos-chave
- **Workload Identity Pool**: contêiner de identidades externas (1 por ambiente: dev/staging/prod).
- **Pool Provider**: relação de confiança com o IdP (aws / oidc / saml).
- **Attribute mapping**: claims do IdP → atributos Google; `google.subject` é obrigatório.
- **Attribute condition**: expressão **CEL** que filtra quem entra (evita confused deputy).
- Dois modos de acesso:
  - **Direct resource access** (recomendado): IAM role direto na identidade externa.
  - **Service account impersonation**: assume SA via `roles/iam.workloadIdentityUser`.

## Comando/CLI (referência)
```bash
# 1. Pool
gcloud iam workload-identity-pools create POOL_ID \
  --location=global --display-name="ext-pool"

# 2a. Provider OIDC (ex: GitHub Actions)
gcloud iam workload-identity-pools providers create-oidc PROVIDER_ID \
  --workload-identity-pool=POOL_ID --location=global \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repo=assertion.repository" \
  --attribute-condition="assertion.repository=='org/repo'"

# 2b. Provider AWS
gcloud iam workload-identity-pools providers create-aws PROVIDER_ID \
  --workload-identity-pool=POOL_ID --location=global \
  --account-id=AWS_ACCOUNT_ID

# 3. Liberar impersonation (modo SA)
gcloud iam service-accounts add-iam-policy-binding SA_EMAIL \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://.../workloadIdentityPools/POOL_ID/*"
```

## Pegadinhas de prova
- **WIF (geral) ≠ Workload Identity Federation for GKE.** Geral = identidades de FORA da GCP. For GKE = DENTRO do cluster (mapeia **Kubernetes ServiceAccount**, pool gerenciado pelo Google). Questão com "EC2/GitHub/Azure VM" → WIF geral; "pod no GKE" → WIF for GKE.
- Service account **key** é a resposta ERRADA quando o cenário pede segurança/sem segredo estático.
- Token é **de curta duração** (STS), não credencial permanente.
- `google.subject` é o único mapping **obrigatório**.
- Sem **attribute condition** → risco de confused deputy (qualquer identidade do IdP entra).
- **Direct resource access** é o caminho recomendado atual; impersonation ainda cai em prova.

## Fontes
- https://docs.cloud.google.com/iam/docs/workload-identity-federation
- https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds
- https://docs.cloud.google.com/iam/docs/workload-identities
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
