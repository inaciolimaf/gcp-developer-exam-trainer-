# Workflows — orquestração serverless de serviços (≈ AWS Step Functions)

## O que é
- Orquestrador **serverless** e **stateful**: encadeia steps numa ordem definida, mantém estado e garante execução durável. Zero infra.
- Steps descritos em **YAML** (ou JSON). Diferente do Step Functions, execução é **sequencial por padrão** (não precisa declarar o `next` de cada state). YAML aceita comentários.
- Orquestra qualquer coisa que fale HTTP: Cloud Run, Cloud Functions, APIs Google (BigQuery, Vision...) e APIs externas.
- **Connectors**: atalho pra chamar serviços Google sem montar request/auth na mão; já trazem retry e tratamento de long-running operation.

## Quando usar
- Coordenar **vários serviços** num fluxo com lógica, ordem, condicionais e retries.
- Chaining de microserviços, pipelines ETL, automação de infra (start/stop VM), integração com sistemas externos.
- Esperar processos longos via **polling** ou **callback** (callback + Eventarc para eventos externos).
- NÃO use pra: mensageria pura/fan-out (→ Pub/Sub), uma tarefa controlada pra um endpoint (→ Cloud Tasks), DAGs de dados complexos com Airflow (→ Cloud Composer).

## Pontos-chave
- Disparo: API, **Cloud Scheduler** (cron/recorrente), **Eventarc** (event-driven, ex: arquivo no GCS).
- Controle de fluxo: `assign` (variáveis) · `switch` (≈ Choice) · `for` (≈ Map) · `sys.sleep` (≈ Wait) · `next` (pular step).
- Erros: bloco `try`/`except`; dentro do try, política de `retry`.
- Retry policies prontas: **default (idempotente)** auto em GET; **non-idempotent** nos demais métodos. Customizável: predicate + max_retries + backoff (initial_delay, max_delay, multiplier).
- Passagem de dados entre steps via variáveis; `params` recebe input da execução.

## Comando/CLI (referência)
```bash
# Deploy
gcloud workflows deploy MY_WF --source=workflow.yaml --location=us-central1

# Executar e ver resultado
gcloud workflows run MY_WF --data='{"arg":"valor"}'
gcloud workflows executions describe EXEC_ID --workflow=MY_WF
```
```yaml
# Esqueleto YAML (retry + chamada)
main:
  params: [input]
  steps:
    - chama:
        try:
          call: http.get
          args: { url: https://api.exemplo/x }
          result: r
        retry: ${http.default_retry}     # default idempotente p/ GET
        except:
          as: e
          steps:
            - log: { call: sys.log, args: { text: ${e.message} } }
    - fim:
        return: ${r.body}
```

## Pegadinhas de prova
- **Workflows vs Cloud Tasks vs Pub/Sub:**
  - **Workflows** = orquestração stateful, controla a ORDEM de múltiplos serviços com lógica/retries.
  - **Cloud Tasks** = invocação EXPLÍCITA: empurra 1 task pra 1 endpoint; controle de rate/agendamento/dedupe; entrega at-least-once. Sender controla quando/onde roda.
  - **Pub/Sub** = event bus, fan-out IMPLÍCITO; publisher não conhece consumers; N subscribers recebem a mesma mensagem (broadcast/decoupling).
- Regra: fluxo de passos → Workflows; controlar quando/onde 1 tarefa roda → Cloud Tasks; desacoplar e fazer broadcast → Pub/Sub.
- Eventarc → Workflows: evento maior que o tamanho máximo de argumento **falha** a execução.
- `${...}` envolve expressões; não confundir com YAML literal.
- Step Functions usa JSON e exige `next` em todo state; Workflows é YAML e sequencial por padrão.

## Fontes
- https://docs.cloud.google.com/workflows/docs/overview
- https://docs.cloud.google.com/workflows/docs/migrate-from-step-functions
- https://docs.cloud.google.com/workflows/docs/reference/syntax/retrying
- https://docs.cloud.google.com/pubsub/docs/choosing-pubsub-or-cloud-tasks
