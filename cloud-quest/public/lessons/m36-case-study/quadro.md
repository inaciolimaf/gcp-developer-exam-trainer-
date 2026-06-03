# 36 — Case Study (HipLocal) na prova PCD

## O que é
- O exame **Professional Cloud Developer** inclui ~**5–6 questões** baseadas num estudo de caso fixo: **HipLocal**.
- HipLocal = app de comunidade *hyper-local* (lançado em Dallas, quer ir global).
- O case dá contexto; cada questão pede que você escolha o serviço/padrão GCP que atende a um **requisito explícito** do texto.
- Analogia AWS: igual às questões longas de cenário do exame de Solutions Architect.

**Ambiente atual do HipLocal**
- Híbrido: on-prem + Google Cloud.
- APIs em **VMs do Compute Engine**.
- Estado num **MySQL single-instance** no próprio Google Cloud.
- Export de dados para data warehouse on-prem (Teradata/Vertica); analytics em Hadoop on-prem.
- Dores: app **sem logging** (só uptime básico); deploys manuais (= baixa confiança no processo).

## Quando usar
Mapa **requisito → serviço** (a regra de ouro):

| Requisito no case | Serviço GCP | Equivalente AWS |
|---|---|---|
| Menos gestão de DB / MySQL gerenciado | **Cloud SQL** | RDS |
| Conexão segura ao DB | **Cloud SQL Auth Proxy** (IAM + TLS) | RDS IAM auth |
| Estado de sessão rápido | **Memorystore** (Redis) | ElastiCache |
| Escala global / NoSQL | **Firestore / Spanner** | DynamoDB global |
| 10x usuários, autoscaling de VMs | **Managed Instance Groups** | Auto Scaling Group |
| CI/CD, fim do deploy manual | **Cloud Build** | CodeBuild + CodePipeline |
| Logs centralizados | **Cloud Logging** (agente nas VMs) | CloudWatch Logs |
| Métricas, alertas, uptime, SLO/SLI | **Cloud Monitoring** | CloudWatch |
| Métricas de atividade do usuário | **OpenTelemetry** (ex-OpenCensus) | — |
| Analytics de logs/atividade | **BigQuery** | Redshift / Athena |
| Expor APIs | **Cloud Endpoints / API Gateway / Apigee** | API Gateway |
| Autenticar usuários | **Identity-Aware Proxy (IAP)** | — (BeyondCorp) |
| Conexão privada on-prem ↔ cloud | **Cloud Interconnect** | Direct Connect |

## Pontos-chave
- **Heurística mestre:** requisito = "menos gerenciamento / global / autoscale" → prefira **managed/serverless**.
- Toda resposta deve ancorar num **requisito citado** no case. Sem requisito correspondente → provavelmente errada.
- Você **pode reler o case durante o exame**, mas leia antes; não dependa disso.
- **Gestão de tempo** é crítica: agrupe as questões do case e responda juntas (contexto fresco + economia de tempo).
- Requisitos-chave do HipLocal: globalizar, 10x usuários, GDPR, reduzir custo de infra, SRE (SLO/SLI), segurança de APIs.

## Comando/CLI (referência)
```bash
# Cloud SQL (substitui o MySQL manual)
gcloud sql instances create hiplocal-db --database-version=MYSQL_8_0 --region=us-central1

# Cloud SQL Auth Proxy (IAM + TLS, sem IP estático nem cert manual)
./cloud-sql-proxy --port 3306 PROJECT:REGION:hiplocal-db

# Managed Instance Group com autoscaling (substitui VMs soltas)
gcloud compute instance-groups managed set-autoscaling hiplocal-mig \
  --max-num-replicas=20 --target-cpu-utilization=0.6

# CI/CD (fim do deploy manual)
gcloud builds submit --tag gcr.io/PROJECT/hiplocal-api
```

## Pegadinhas de prova
- **Estado ≠ sempre Cloud SQL.** Sessão rápida → **Memorystore**; relacional → Cloud SQL; escala global → Firestore/Spanner. Leia o que o estado *é*.
- Conexão segura ao Cloud SQL: a resposta é **Cloud SQL Auth Proxy** (IAM/TLS), não "abrir IP público + firewall".
- **OpenCensus está deprecado** → a resposta atual é **OpenTelemetry**.
- **IAP** autentica *usuários* do app; não confunda com autorização IAM de serviços nem com API keys.
- On-prem → cloud privado e de baixa latência = **Cloud Interconnect** (não VPN, quando o requisito pede alta banda/baixa latência).
- "Adotar práticas do Google / SRE" = **SLO/SLI + alertas no Cloud Monitoring**, não só uptime check básico.

## Fontes
- https://cloud.google.com/certification/guides/cloud-developer/casestudy-hiplocal
- https://services.google.com/fh/files/blogs/master_case_study_hiplocal.pdf
- https://docs.cloud.google.com/sql/docs/mysql/sql-proxy
- https://cloud.google.com/iap/docs/concepts-overview
