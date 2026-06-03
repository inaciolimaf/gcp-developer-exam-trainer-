# 22 — Escolha de Bancos de Dados no Google Cloud

## O que é

Decisão de qual database gerenciado usar por caso de uso. Eixos:

- **Relacional vs NoSQL** — schema fixo + transações fortes vs schema flexível + escala horizontal.
- **OLTP vs OLAP** — transações operacionais (muitas escritas pequenas) vs consultas analíticas pesadas.
- **Latência / volume** — ms vs µs; TB vs PB vs EB; TPS esperado.

Serviços e equivalentes AWS:

| Caso de uso | Google Cloud | AWS |
|---|---|---|
| Relacional OLTP, regional, ~TB | **Cloud SQL** (MySQL/PostgreSQL/SQL Server) | RDS |
| Relacional OLTP, global, milhões TPS | **Spanner** | Aurora (extremo) |
| OLAP / data warehouse, PB | **BigQuery** (columnar, serverless) | Redshift |
| NoSQL documento, app web/mobile, ~TB | **Firestore** (ex-Datastore) | DynamoDB |
| NoSQL wide-column, IoT/time-series, PB | **Bigtable** | DynamoDB / Keyspaces |
| Cache em memória, µs | **Memorystore** (Redis/Valkey/Memcached) | ElastiCache |

## Quando usar

- **Cloud SQL** — relacional padrão, região única, milhares de TPS, dados em terabytes.
- **Spanner** — "global" + "transacional" + "milhões de TPS" + escala horizontal nas escritas; SLA 99,999% multi-region.
- **BigQuery** — analytics, data warehouse, big data, "análise de petabytes".
- **Firestore** — documento serverless transacional, apps web/mobile, schema em evolução, dados pequenos/médios.
- **Bigtable** — volumes enormes (10 TB a PB), baixa latência, alto throughput, IoT, streaming, time-series, analytics operacional. Não transacional, não serverless.
- **Memorystore** — resposta em microssegundos; cache na frente de qualquer database.

## Pontos-chave

- Spanner é o único relacional com escala horizontal global e SLA de 5 noves (multi-region).
- BigQuery usa columnar storage → rápido em agregações; é OLAP, não OLTP.
- Firestore = serverless. Bigtable = provisiona nodes (NÃO serverless).
- Firestore tem dois modos: Native (apps novos, web/mobile, real-time) e Datastore (apps que dependem da Datastore API).
- Bigtable NÃO serve para cargas transacionais.
- Memorystore não persiste como database primário; é camada de cache.

## Comando/CLI (referência)

```bash
# Cloud SQL
gcloud sql instances create my-pg --database-version=POSTGRES_15 --tier=db-custom-2-7680 --region=us-central1

# Spanner
gcloud spanner instances create my-inst --config=regional-us-central1 --nodes=1 --description="demo"

# Firestore (modo Native)
gcloud firestore databases create --location=nam5 --type=firestore-native

# Bigtable (provisiona nodes — não serverless)
gcloud bigtable instances create my-bt --cluster-config=id=c1,zone=us-central1-b,nodes=3 --display-name=demo

# Memorystore for Redis
gcloud redis instances create my-cache --size=1 --region=us-central1

# BigQuery (serverless — cria dataset)
bq mk --dataset my_project:analytics
```

## Pegadinhas de prova

- "Global" + "transacional" + "milhões TPS" → **Spanner**, nunca Cloud SQL.
- Região única + milhares TPS relacional → **Cloud SQL**, não Spanner (custo).
- Petabytes de análise / data warehouse → **BigQuery**, não Bigtable.
- IoT, time-series, streams gigantes → **Bigtable**, não Firestore.
- Bigtable **não** é serverless e **não** é para transações.
- Schema em rápida evolução, app web/mobile → **Firestore**.
- Precisa de microssegundos / acelerar leituras → **Memorystore** (cache), não trocar o database.
- MySQL/PostgreSQL/SQL Server gerenciado → **Cloud SQL** (Spanner não fala esses engines diretamente).

## Fontes

- https://cloud.google.com/spanner/sla
- https://cloud.google.com/firestore/native/docs/firestore-or-datastore
- https://cloud.google.com/memorystore
- https://cloud.google.com/bigtable/docs/overview
