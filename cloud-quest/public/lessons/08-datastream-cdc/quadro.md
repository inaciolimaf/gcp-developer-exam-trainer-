# Datastream (Change Data Capture / CDC)

## O que é
- Serviço **serverless** de **CDC** (Change Data Capture) e replicação near real-time.
- Lê **insert / update / delete** do **transaction log** da origem (binlog, WAL, redo log) → impacto mínimo na origem.
- Escala automático, paga por **GB processado** (sem instância pra gerenciar).
- Equivalente AWS: **AWS DMS** (parte de CDC) — mas DMS usa replication instance; Datastream é serverless.

## Quando usar
- Replicar banco transacional → **BigQuery** para **analytics near real-time** (sem ETL batch).
- Gravar stream de mudanças no **Cloud Storage** para pipelines **event-driven** / Dataflow.
- Sincronização contínua de dados entre origem e destino com baixa latência.
- Origem pode estar fora do GCP: on-prem, VM, **Amazon RDS/Aurora**, ou Cloud SQL.

## Pontos-chave
- **Origens**: MySQL, PostgreSQL (+ AlloyDB), Oracle, SQL Server.
- **Destinos nativos**: BigQuery, Cloud Storage (Apache Iceberg também suportado).
- Outros destinos (Cloud SQL, Spanner) → Cloud Storage + **template Dataflow** ("Datastream to SQL").
- Componentes: **connection profiles** + **stream** (backfill + CDC) + **connectivity**.
- Connectivity: IP allowlist, SSH tunnel, VPC peering, **Private Service Connect**.
- Dados criptografados em trânsito e em repouso.

## Comando/CLI (referência)
```
# Connection profile da origem
gcloud datastream connection-profiles create my-src \
  --location=us-central1 --type=mysql \
  --mysql-hostname=... --mysql-port=3306 --mysql-username=...

# Stream: origem -> destino BigQuery
gcloud datastream streams create my-stream \
  --location=us-central1 \
  --source=my-src --destination=my-bq \
  --backfill-all   # backfill inicial + CDC contínuo
```

## Pegadinhas de prova
- Datastream **NÃO transforma** dados. Transformação/enriquecimento = **Dataflow**.
- **Migração de banco com mínimo downtime** = **Database Migration Service (DMS)**, NÃO Datastream.
- Datastream = CDC para **streaming/analytics**; DMS (GCP) = **migração**.
- **Schema evolution limitado** (drop de coluna, troca de tipo nem sempre suportados).
- "near real-time / stream de mudanças / sem servidor" → Datastream.
- Destino para analytics na prova quase sempre = **BigQuery**.

## Fontes
- https://docs.cloud.google.com/datastream/docs/overview
- https://cloud.google.com/datastream
- https://docs.cloud.google.com/datastream/docs/sources
- https://docs.cloud.google.com/dataflow/docs/guides/templates/provided/datastream-to-sql
