# Eventarc

## O que é
- Camada de roteamento de eventos do GCP: recebe eventos de várias fontes e entrega num destino, desacoplado.
- Equivalente AWS: **Amazon EventBridge**.
- Todo evento chega no formato **CloudEvents v1.0**, via HTTP (binary content mode, headers `ce-`).
- Transporte por baixo do capô: **push subscription do Pub/Sub**.

## Quando usar
- Reagir a eventos de plataforma do GCP (Storage, Audit Logs, etc.) de forma unificada.
- Acionar Cloud Run / Functions / Workflows / GKE a partir de mudanças em serviços Google.
- Não usar quando: só precisa de mensageria custom de alto throughput / baixa latência -> **Pub/Sub direto**.

## Pontos-chave
- **3 tipos de fonte (trigger):**
  - **Cloud Audit Logs** — filtra por `serviceName` + `methodName` (mais amplo).
  - **Direct events** — eventos diretos de +130 providers (ex.: objeto criado no Cloud Storage).
  - **Pub/Sub** — qualquer mensagem publicada num topic.
- **Destinos:** Cloud Run, Cloud Run functions, Workflows, serviços no GKE (Workload Identity).
- Toda Cloud Function de 2ª gen orientada a evento usa Eventarc por baixo.
- Entrega best-effort, **sem garantia de ordenação**, retenção padrão 24h com backoff exponencial.
- **Eventarc vs Pub/Sub direto:**

  | | Eventarc | Pub/Sub direto |
  |---|---|---|
  | Abstração | Alta (filtros, normalização, fontes Google nativas) | Baixa (só o canal de mensagens) |
  | Fontes | Audit Logs, direct events, Pub/Sub | Mensagens que você publica |
  | Formato | CloudEvents padronizado | Payload livre |
  | Caso de uso | Reagir a eventos de plataforma | Mensageria custom, alto throughput |
  | Transporte | Usa Pub/Sub por baixo | É o próprio Pub/Sub |

## Comando/CLI (referência)
```bash
# Trigger de Pub/Sub -> Cloud Run
gcloud eventarc triggers create my-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \
  --event-filters="resource=projects/MY_PROJECT/topics/MY_TOPIC" \
  --service-account=PROJECT_NUMBER-compute@developer.gserviceaccount.com

# Trigger de Cloud Audit Log
gcloud eventarc triggers create audit-trigger \
  --location=us-central1 \
  --destination-run-service=my-service \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=storage.googleapis.com" \
  --event-filters="methodName=storage.objects.create" \
  --service-account=SA_EMAIL
```

## Pegadinhas de prova
- **`--event-filters` são imutáveis**: errou o tipo -> delete e recrie o trigger.
- **Localização**: trigger deve ficar na **mesma região** da fonte (performance + data residency).
- **Sem ordenação garantida** — trate ordem no seu código se importar.
- Trigger precisa de **service account** com permissão para invocar o destino.
- Eventarc usa Pub/Sub por baixo, mas "Eventarc usa Pub/Sub" != "use Pub/Sub direto" — saiba a diferença de abstração.
- Cada trigger exige **pelo menos um** `--event-filters`.

## Fontes
- https://docs.cloud.google.com/eventarc/standard/docs/overview
- https://docs.cloud.google.com/run/docs/triggering/trigger-with-events
- https://cloud.google.com/blog/topics/developers-practitioners/eventarc-unified-eventing-experience-google-cloud
- https://cloud.google.com/blog/topics/developers-practitioners/three-ways-receiving-events-cloud-run
