# 24 — Conectando ao Cloud SQL

## O que é
Conjunto de formas seguras de conectar uma aplicacao ao Cloud SQL (MySQL/PostgreSQL/SQL Server). Os pilares para a prova PCD:
- **Cloud SQL Auth Proxy** — conector que roda junto ao cliente; criptografa via **TLS automatico** (sem gerenciar certificados) e autoriza via **IAM**. Funciona com IP publico e privado. Dispensa authorized networks e SSL manual.
- **IAM database authentication** — identidade IAM (user/service account) vira usuario do banco. Com `--auto-iam-authn` o proxy injeta um **OAuth 2.0 access token** (validade 1h) no lugar da senha.
- **Private IP (Private Service Access)** vs **Public IP + authorized networks** — privado e o recomendado.
- **Serverless VPC Access connector** (ou **Direct VPC egress**) — ponte para serverless alcancar Cloud SQL por **IP privado**.

Analogia AWS: RDS IAM authentication + SSL gerenciado, embrulhados num conector unico.

## Quando usar
| Cenario | Solucao |
|---|---|
| VM em VPC -> Cloud SQL por IP privado | Private Service Access (private IP) |
| Serverless (Run/Functions/App Engine) -> Cloud SQL por IP **publico** | Automatico (proxy embutido), nada a fazer |
| Serverless -> Cloud SQL por IP **privado** | Serverless VPC Access connector ou Direct VPC egress |
| GCE / GKE conectando (publico ou privado) | Cloud SQL Auth Proxy (no GKE, como **sidecar container**) |
| Sem proxy nem conector | Certificados **SSL/TLS autogerenciados** (minimo) |
| Sem passar senha no codigo | Proxy + `--auto-iam-authn` |

## Pontos-chave
- Proxy garante **TLS** + **IAM** sem authorized networks e sem gerenciar certificado.
- Role minima para subir o proxy: **Cloud SQL Client** (`cloudsql.instances.connect`).
- Automatic IAM auth: a conta que **sobe o proxy** deve ser a mesma que **loga no banco**.
- Egress do proxy: **porta 3307** para a instancia + **443** para as APIs.
- Serverless com IP publico usa o proxy **automaticamente**; com IP privado exige conector VPC.
- Conector Serverless VPC Access deve estar na **mesma regiao** do servico.
- Cloud SQL e **sempre regional** (sem multi-region). HA = primary + standby em zonas diferentes da mesma regiao.
- **Read replicas** escalam leitura, **nao** aumentam disponibilidade.
- Best practices: connection pooling, **exponential backoff**, transacoes curtas, preferir IP interno.

## Comando/CLI (referência)
```bash
# Cloud SQL Auth Proxy v2 (IP publico ou privado)
./cloud-sql-proxy PROJECT:REGION:INSTANCE
./cloud-sql-proxy --private-ip PROJECT:REGION:INSTANCE

# Automatic IAM database authentication (sem senha)
./cloud-sql-proxy --auto-iam-authn PROJECT:REGION:INSTANCE

# Service account dedicada via key file
./cloud-sql-proxy --credentials-file=key.json PROJECT:REGION:INSTANCE

# Role minima
gcloud projects add-iam-policy-binding PROJECT \
  --member=serviceAccount:SA_EMAIL --role=roles/cloudsql.client

# Serverless VPC Access connector
gcloud compute networks vpc-access connectors create CONN \
  --region=REGION --network=default --range=10.8.0.0/28

# Cloud Run -> Cloud SQL
gcloud run deploy APP --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
  --vpc-connector=CONN   # --vpc-connector so necessario para IP privado
```

## Pegadinhas de prova
- Serverless com **IP publico** NAO precisa de conector VPC nem de configurar proxy (e automatico). Conector so para **IP privado**.
- A role correta para o proxy e **Cloud SQL Client**, nao Editor nem Admin (esses dao permissoes demais).
- Proxy NAO substitui conectividade de rede: para IP privado, a rota privada (VPC/conector) ainda precisa existir.
- Token de IAM auth dura **1 hora**; nao e senha estatica.
- Read replica **nao** e alta disponibilidade; para HA, ative a configuracao de HA (standby em outra zona).
- Authorized networks so se aplicam a **IP publico**; com proxy ou IP privado voce nao precisa delas.
- Conector Serverless VPC Access tem de estar na **mesma regiao** do servico serverless.

## Fontes
- https://docs.cloud.google.com/sql/docs/mysql/sql-proxy
- https://docs.cloud.google.com/sql/docs/mysql/iam-logins
- https://docs.cloud.google.com/sql/docs/mysql/connect-run
- https://docs.cloud.google.com/sql/docs/mysql/private-ip
