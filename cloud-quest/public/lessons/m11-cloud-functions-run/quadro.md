# 11 — Cloud Functions e Cloud Run

## O que é

- **Cloud Functions** = FaaS (Function as a Service). Equivale ao **AWS Lambda**.
  - Modelo: **event** (algo aconteceu) → **trigger** (a regra) → **function** (seu código).
  - **gen1**: 1 request/instância, timeout máx 9 min, poucos triggers.
  - **gen2**: construída sobre **Cloud Run + Eventarc**. Concurrency até 1000, timeout HTTP até 60 min, 90+ event sources.
- **Cloud Run** = container serverless totalmente gerenciado. Equivale a **AWS Fargate / App Runner**.
  - "Do container à produção em segundos." Roda sobre o padrão aberto **Knative**.
  - Zero gestão de infra/cluster. Qualquer linguagem/binário/dependência (é container).
  - Terminologia: **service** → contém várias **revisions** (cada deploy = nova revision; dá traffic split / canário / rollback).

## Quando usar

| Cenário | Escolha |
|---|---|
| Pedaço pequeno de código disparado por evento (Storage, Pub/Sub, HTTP) | Cloud Functions |
| Precisa de container, runtime/binário customizado | Cloud Run |
| Concurrency alta (vários requests por instância) | Cloud Run / Functions gen2 |
| Timeout longo (até 60 min HTTP) | gen2 / Cloud Run |
| Serviço web/API completo, microsserviço | Cloud Run |
| Portar container entre Cloud Run, GKE, App Engine | Cloud Run |

## Pontos-chave

- **Triggers de Functions**: HTTP, Cloud Storage, Pub/Sub, Firestore/Firebase, Cloud Audit Logs (gen2 via **Eventarc**).
- **Scale-to-zero**: padrão. Sem tráfego → 0 instâncias → 0 custo de request.
- **Cold start**: subir instância nova adiciona latência. Mitigar com **min-instances > 0** (instâncias quentes).
- **min-instances**: piso (default 0). **max-instances**: teto (default ~100), protege backends.
- **Concurrency (Cloud Run)**: várias requests por instância. **Default 80**, máx **1000**. (Lambda = 1 por instância.)
- **CPU allocation**: "CPU durante o request" (paga por invocação, scale-to-zero) vs "CPU sempre alocada" (instância sempre de pé).
- **Billing Cloud Run**: por CPU, memória, requests e rede usados.
- Nome do service + região são **imutáveis** após criação.

## Comando/CLI (referência)

```bash
# Cloud Functions gen2 - HTTP
gcloud functions deploy minha-func \
  --gen2 --runtime=python312 --trigger-http \
  --entry-point=handler --region=us-central1 --allow-unauthenticated

# Cloud Functions gen2 - trigger Pub/Sub
gcloud functions deploy minha-func \
  --gen2 --trigger-topic=meu-topico --runtime=nodejs20

# Cloud Run - deploy de imagem com tuning de scaling
gcloud run deploy meu-service \
  --image=gcr.io/PROJ/app --region=us-central1 \
  --concurrency=80 --min-instances=1 --max-instances=10 \
  --allow-unauthenticated

# Cloud Run - deploy direto do source (build automático)
gcloud run deploy meu-service --source=.

# Split de tráfego entre revisions
gcloud run services update-traffic meu-service \
  --to-revisions=meu-service-00002=20,meu-service-00001=80
```

## Pegadinhas de prova

- **gen2 é Cloud Run por baixo** — herda concurrency até 1000, timeout 60 min, Eventarc. gen1 NÃO.
- **gen1 = 1 request por instância**; só gen2/Cloud Run têm concurrency multi-request.
- **Timeout**: gen1 máx 9 min; gen2 HTTP até **60 min**, mas event-driven gen2 ainda **9 min**.
- **Cold start** vem de scale-to-zero → resolve com **min-instances**, não com max-instances.
- **max-instances** limita teto (protege DB/backend), não evita cold start.
- "CPU sempre alocada" é o que permite **trabalho em background** fora do ciclo do request.
- Concurrency alta → menos instâncias para o mesmo tráfego → menor custo. CPU-bound → baixar concurrency.
- Pergunta mencionou **container** ou **concurrency**? Pense **Cloud Run**.
- Nome e região do service são **imutáveis**.

## Fontes

- https://docs.cloud.google.com/functions/docs/concepts/version-comparison
- https://docs.cloud.google.com/run/docs/about-instance-autoscaling
- https://cloud.google.com/run/docs/about-concurrency
- https://cloud.google.com/run/docs
