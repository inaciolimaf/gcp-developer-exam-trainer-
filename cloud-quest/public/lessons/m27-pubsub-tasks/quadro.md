# 27 — Comunicacao Assincrona: Pub/Sub e Cloud Tasks

## O que é

- **Cloud Pub/Sub** — messaging assincrono gerenciado, global, auto-scaling. Publishers mandam mensagens pra um **topic**; subscribers recebem via **subscriptions**. AWS: ≈ **SNS + SQS** num servico so (push *e* pull).
- **Cloud Tasks** — fila de **tasks HTTP**: cada task chama um endpoint HTTP especifico (método, URL, body), com **rate limiting** e **retry** configuraveis. AWS: ≈ **SQS**, mas com invocacao explicita e push-only.
- **Cloud Scheduler** — cron gerenciado (formato cron UNIX). Alvos: HTTP, Pub/Sub topic ou App Engine. AWS: ≈ **EventBridge Scheduler / CloudWatch cron**.

| Conceito | Invocacao | Modelos | AWS |
|---|---|---|---|
| Pub/Sub | implicita (publisher nao conhece consumidor) | push + pull | SNS + SQS |
| Cloud Tasks | explicita (voce escolhe o URL) | só push | SQS |
| Cloud Scheduler | agendada (cron) | dispara HTTP/Pub/Sub | EventBridge cron |

## Quando usar

- **Pub/Sub** — event ingestion, streaming analytics, fan-out (1 evento → muitos consumidores), desacoplar microservicos event-driven.
- **Cloud Tasks** — diferir trabalho pra depois sem segurar o cliente; controlar rate/concurrency de um servico downstream; invocar um endpoint HTTP especifico de forma confiavel.
- **Cloud Scheduler** — qualquer job recorrente por horario (cron): disparar HTTP, publicar no Pub/Sub, start/stop de VMs.

## Pontos-chave

- **Subscription = copia**: cada subscription recebe TODAS as mensagens do topic. Varios clientes na MESMA subscription → mensagens **divididas** (load balancing). Subscriptions diferentes → **fan-out** (cada uma recebe tudo).
- **At-least-once** é o default → consumidor deve ser **idempotente**. Existe exactly-once (pull). Sem **ack** dentro do **ack deadline** → reentrega.
- **Ordering**: desligado por padrao. Liga com **ordering key** + ordering habilitado na subscription, mesma regiao.
- **Dead-letter topic**: apos N tentativas falhas, mensagem vai pra DLQ pra debug offline.
- **Cloud Tasks**: dispatch rate, max concurrent dispatches, retry com exponential backoff — tudo por fila.
- **Cloud Scheduler hoje NAO exige App Engine** (só se o alvo for App Engine).

## Comando/CLI (referência)

```bash
# Pub/Sub
gcloud pubsub topics create orders
gcloud pubsub subscriptions create orders-sub --topic=orders            # pull
gcloud pubsub subscriptions create orders-push --topic=orders \
  --push-endpoint=https://meu-servico/handler                           # push
gcloud pubsub subscriptions create orders-sub --topic=orders \
  --dead-letter-topic=orders-dlq --max-delivery-attempts=5              # dead-letter
gcloud pubsub subscriptions create ord-sub --topic=orders --enable-message-ordering
gcloud pubsub topics publish orders --message="hello" --ordering-key=k1

# Cloud Tasks
gcloud tasks queues create my-queue
gcloud tasks queues update my-queue \
  --max-dispatches-per-second=10 --max-concurrent-dispatches=5 \
  --max-attempts=5                                                      # rate + retry
gcloud tasks create-http-task --queue=my-queue \
  --url=https://meu-servico/run --method=POST --body-content='{"id":1}'

# Cloud Scheduler
gcloud scheduler jobs create http nightly \
  --schedule="0 2 * * *" --uri=https://meu-servico/cron --http-method=POST
gcloud scheduler jobs create pubsub publish-job \
  --schedule="*/5 * * * *" --topic=orders --message-body="tick"
```

## Pegadinhas de prova

- **Fan-out vs load balancing**: mesma subscription com varios consumidores DIVIDE mensagens; subscriptions distintas DUPLICAM. Confundir isso é erro classico.
- **At-least-once por padrao** → assuma duplicatas; exactly-once é opt-in (pull). Idempotencia é obrigatoria.
- **Push em Pub/Sub** precisa de **endpoint HTTPS** (webhook). Ordering com push: só 1 mensagem outstanding por ordering key — push nao é recomendado pra ordering pesado.
- **Cloud Tasks só push, sem pull**; e invocacao **explicita** (voce define o URL). Se a questao fala "publisher nao sabe quem consome" → Pub/Sub, nao Tasks.
- **Cloud Scheduler ≠ Cloud Tasks**: Scheduler é por HORARIO (cron); Tasks é fila de execucao com rate/retry. Scheduler dispara, Tasks/Pub/Sub processam.
- **Material antigo diz que Scheduler exige App Engine** — desatualizado. Só precisa de App Engine se o ALVO for App Engine.
- **Dead-letter** nao preserva ordem.

## Fontes

- https://cloud.google.com/pubsub/docs/subscriber
- https://cloud.google.com/pubsub/docs/ordering
- https://cloud.google.com/pubsub/docs/dead-letter-topics
- https://docs.cloud.google.com/tasks/docs/configuring-queues
- https://docs.cloud.google.com/scheduler/docs/overview
