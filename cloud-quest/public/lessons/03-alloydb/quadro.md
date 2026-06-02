# AlloyDB for PostgreSQL (+ Auth Proxy)

> Equivalente AWS: **Amazon Aurora PostgreSQL** (Postgres-compatible, compute/storage separados, writer + readers)

## O que é
- PostgreSQL **totalmente gerenciado e de alta performance**; engine Google + arquitetura cloud-native (compute ≠ storage).
- **>4x** mais rápido que Postgres self-managed (OLTP); **até 100x** em analytics via **columnar engine**.
- **HTAP**: OLTP + OLAP no mesmo banco, analytics sobre dados transacionais vivos.
- Topologia: **primary instance** (escrita) + **read pool instances** (leitura, escalam horizontalmente).
- **SLA 99.99%** (inclui manutenção); recuperação automática de falhas em **< 60s**.

## Quando usar
- **AlloyDB** → precisa de Postgres, mas Cloud SQL não dá conta de performance/escala; workloads pesados ou híbridos (OLTP+OLAP); regional.
- **Cloud SQL** → uso geral, mais barato/simples; MySQL/Postgres/SQL Server; single-region.
- **Spanner** → distribuição **global**, consistência forte multi-região, escala horizontal quase ilimitada.
- Regra: Postgres rápido regional = AlloyDB | global multi-região = Spanner | caso geral = Cloud SQL.

## Pontos-chave
- **AlloyDB Auth Proxy** ≈ Cloud SQL Auth Proxy: binário local, túnel seguro, app conecta em `localhost`.
- Faz **mTLS 1.3 / AES-256** automático + **autorização via identidade IAM** (sem gerenciar SSL/allowlist).
- Roles IAM obrigatórios (DECORAR):
  - `roles/alloydb.client` (Cloud AlloyDB Client)
  - `roles/serviceusage.serviceUsageConsumer` (Service Usage Consumer)
- Descoberta de credenciais (nesta ordem): `--credentials-file` → `--token` → gcloud → service account da VM/pod.
- **Automatic IAM database authentication**: proxy/Language Connector gerencia o access token; user do banco é um principal IAM (sem senha).
- AWS análogo do Auth Proxy: **RDS IAM authentication** (token).

## Comando/CLI (referência)
```bash
# Criar cluster + instância primária
gcloud alloydb clusters create my-cluster \
  --region=us-central1 --password=SENHA --network=default

gcloud alloydb instances create my-primary \
  --cluster=my-cluster --region=us-central1 \
  --instance-type=PRIMARY --cpu-count=2

# Iniciar o Auth Proxy (instance URI)
./alloydb-auth-proxy \
  "projects/PROJ/locations/us-central1/clusters/my-cluster/instances/my-primary"

# Com service account explícita
./alloydb-auth-proxy --credentials-file=key.json "<INSTANCE_URI>"

# App conecta como Postgres local
psql -h 127.0.0.1 -p 5432 -U postgres
```

## Pegadinhas de prova
- Auth Proxy **não dispensa** os roles IAM: faltando `alloydb.client` OU `serviceusage.serviceUsageConsumer` → falha de auth.
- Auth Proxy ≠ rede pública: ele autoriza por **IAM**, não por IP allowlist; criptografia é automática (mTLS).
- "Analytics 100x" vem do **columnar engine**, não do storage normal — é o gancho HTAP.
- Não confunda: precisa de **multi-região global + consistência forte** → é **Spanner**, não AlloyDB.
- AlloyDB é **regional** (read pools, não distribuição global como Spanner).
- Em produção: prefira **service account anexada** ao recurso, evite chave JSON (`--credentials-file`) em disco.

## Fontes
- https://docs.cloud.google.com/alloydb/docs/overview
- https://docs.cloud.google.com/alloydb/docs/auth-proxy/overview
- https://docs.cloud.google.com/alloydb/docs/connect-iam
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
