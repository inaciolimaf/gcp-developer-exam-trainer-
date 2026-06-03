# 34 — Arquitetura (visao 10.000 pes)

## O que é
Visao de alto nivel de como os servicos do Google Cloud se encaixam em arquiteturas reais. E o analogo do **AWS Well-Architected**: voce ja conhece os blocos, aqui monta os padroes. Cinco desenhos centrais do exame PCD:

1. **Big data batch** — On-prem -> Cloud Storage (landing) -> ETL -> BigQuery -> Looker Studio.
2. **Streaming / real-time** — Pub/Sub -> Dataflow -> Bigtable (serie temporal, baixa latencia) e/ou BigQuery (ad-hoc).
3. **IoT** — dispositivos -> Pub/Sub -> mesmo fluxo de streaming.
4. **Serverless full stack** — front estatico em Cloud Storage + Cloud CDN; back REST em Cloud Run / Functions / App Engine; API mgmt na frente; Cloud DNS.
5. **Logging** — Cloud Logging -> Log Router (sinks) -> Cloud Storage / Pub/Sub / BigQuery.

**Pub/Sub** = loose coupling em todos eles (desacopla publisher/subscriber).

## Quando usar
| Necessidade | Servico GCP | Equivalente AWS |
|---|---|---|
| Desacoplar producer/consumer | Pub/Sub | SNS + SQS |
| Data warehouse / analytics ad-hoc | BigQuery | Redshift |
| Serie temporal, leitura rapida por chave | Bigtable | DynamoDB / Cassandra |
| ETL / pipelines | Dataflow (Dataprep, Dataproc) | Glue / EMR |
| Landing zone / arquivo barato | Cloud Storage | S3 |
| CDN borda global | Cloud CDN | CloudFront |
| Logs centralizados | Cloud Logging | CloudWatch Logs |

**API management — qual produto:**
- **Apigee** — plataforma full lifecycle, multi-cloud/hibrida, monetizacao, portal, seguranca avancada. Enterprise/alta escala.
- **API Gateway** — simples, gerenciado, para back-ends **serverless** (Cloud Run, Functions, App Engine). Default serverless.
- **Cloud Endpoints** — mais antigo, exige container proxy. Hoje: **gRPC** e testes locais / controle fino.

## Pontos-chave
- BigQuery e o centro de quase todo fluxo de analytics; carregue via Cloud Storage + ETL.
- Bigtable vs BigQuery: rapido por chave / serie temporal vs SQL analitico complexo.
- Pub/Sub aparece em microservices, IoT, streaming e fan-out de logs.
- Cloud CDN serve conteudo estatico de Cloud Storage com cache na borda.
- Cloud Logging roteia para 3 sinks classicos; cada um com um proposito distinto.

## Comando/CLI (referência)
```bash
# Sink de logs para BigQuery (analise SQL de longo prazo)
gcloud logging sinks create logs-to-bq \
  bigquery.googleapis.com/projects/PROJECT/datasets/DS \
  --log-filter='severity>=ERROR'

# Sink para Cloud Storage (arquivamento barato / compliance)
gcloud logging sinks create logs-archive \
  storage.googleapis.com/MEU_BUCKET

# Sink para Pub/Sub (tempo real / export p/ Splunk, Datadog)
gcloud logging sinks create logs-to-ps \
  pubsub.googleapis.com/projects/PROJECT/topics/TOPIC

# API Gateway (back-end serverless)
gcloud api-gateway gateways create GW --api=API --api-config=CFG --location=us-central1
```

## Pegadinhas de prova
- **API Gateway** = serverless simples; **Apigee** = enterprise/multi-cloud; **Endpoints** = gRPC / local. Nao confunda.
- **Bigtable** para serie temporal e baixa latencia; **BigQuery** para query analitica ad-hoc. Trocar os dois e a pegadinha classica.
- Log sink para arquivamento longo/barato = **Cloud Storage**; para tempo real e export externo = **Pub/Sub**; para SQL nos logs = **BigQuery**.
- Conteudo estatico nao vai em Compute/VM: vai em **Cloud Storage + Cloud CDN**.
- Dado on-prem nao carrega direto no BigQuery: passa primeiro pelo **Cloud Storage**.
- Cloud Endpoints **nao** e o default serverless moderno (precisa de container proxy) — prefira API Gateway.

## Fontes
- https://cloud.google.com/blog/products/application-modernization/choosing-between-apigee-api-gateway-and-cloud-endpoints
- https://cloud.google.com/endpoints/docs/choose-endpoints-option
- https://docs.cloud.google.com/logging/docs/routing/overview
- https://docs.cloud.google.com/logging/docs/export/configure_export_v2
