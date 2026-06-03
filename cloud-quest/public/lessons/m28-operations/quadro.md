# 28 — Operations (Cloud Logging, Monitoring, Trace, Profiler, Error Reporting)

## O que é

**Cloud Operations** (ex-**Stackdriver**, hoje também "Google Cloud Observability") é o guarda-chuva de logs, métricas, traces e profiling.

Âncora AWS: **Cloud Operations ≈ Amazon CloudWatch** (+ X-Ray).

| GCP | Função | AWS |
|-----|--------|-----|
| Cloud Logging | logs centralizados | CloudWatch Logs |
| Cloud Monitoring | métricas, alertas, dashboards | CloudWatch Metrics/Alarms |
| Error Reporting | agrupa exceções | (sem 1:1) |
| Cloud Trace | distributed tracing | AWS X-Ray |
| Cloud Profiler | profiling de CPU/memória | CodeGuru Profiler |

## Quando usar

- App caiu → me avise: **uptime check** + **alerting policy** (Cloud Monitoring).
- Contar quantas vezes um padrão aparece no log → **log-based metric** (counter).
- Exceções/erros agrupados de um microsserviço → **Error Reporting**.
- Latência de uma request atravessando vários serviços → **Cloud Trace**.
- Gargalo de CPU/memória no código em produção → **Cloud Profiler**.
- Retenção longa / compliance / consulta SQL → **sink** export p/ Cloud Storage / BigQuery / Pub/Sub.

## Pontos-chave

- **Stackdriver → Cloud Operations** (renomeação): Stackdriver Monitoring = Cloud Monitoring, etc. Cai na prova com o nome antigo.
- Serviços gerenciados (**GKE, App Engine, Cloud Run, Cloud Functions**) enviam logs **automaticamente**. **VM do Compute Engine** precisa de agente.
- **Ops Agent** = agente atual e recomendado (logs + métricas num só, config YAML). **Logging Agent (fluentd)** = legado. Sem agente, a VM não envia memória/disco.
- **Log Router + sinks**: todo log passa pelo Router; sinks definem destino/inclusão/exclusão.
- **Buckets de log**:
  - `_Required`: Admin Activity, System Event, Access Transparency. **400 dias fixos**, não dá para apagar nem alterar. Sem custo.
  - `_Default`: todo o resto. **30 dias** padrão, ajustável de **1 dia a 10 anos (3650)**. Cobrado.
- **Log-based metrics**: `counter` (conta entradas que batem no filtro) vs `distribution` (captura valor numérico). Só valem para logs gerados **no próprio projeto**.
- **Cloud Profiler**: estatístico, baixo overhead, contínuo em prod. Java, Go, Node.js, Python.
- **Error Reporting**: dispara só com stack trace enviado ao Logging (ou via API). Go, Java, .NET, Node.js, PHP, Python, Ruby.

## Comando/CLI (referência)

```bash
# Logs — ler e filtrar
gcloud logging read 'severity>=ERROR AND resource.type="gce_instance"' --limit=20

# Escrever um log de teste
gcloud logging write my-log "mensagem de teste" --severity=WARNING

# Sink: exportar logs para um bucket do Cloud Storage (retenção longa)
gcloud logging sinks create my-sink \
  storage.googleapis.com/my-logs-bucket \
  --log-filter='resource.type="cloud_run_revision"'

# Listar buckets de log (_Required / _Default)
gcloud logging buckets list --location=global

# Ajustar retenção do _Default (30 -> 90 dias)
gcloud logging buckets update _Default --location=global --retention-days=90

# Instalar o Ops Agent numa VM (recomendado; substitui o fluentd)
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent.sh
sudo bash add-google-cloud-ops-agent.sh --also-install

# Monitoring — listar uptime checks
gcloud monitoring uptime list-configs
```

## Pegadinhas de prova

- **Stackdriver = Cloud Operations.** Nome antigo no enunciado é a mesma coisa. Não se confunda.
- **VM não manda log/métrica sozinha** → precisa de **agente** (Ops Agent atual; fluentd Logging Agent é legado). Serviços gerenciados mandam sozinhos.
- `_Required` = **400 dias, imutável**; `_Default` = **30 dias, ajustável (1 dia–10 anos)**. Não troque os números.
- "App fora do ar, me alerte" → **uptime check**, não log-based metric.
- "Contar ocorrências de string no log" → **log-based metric (counter)**, depois alerta no Monitoring.
- Trace ≠ Profiler: **Trace** = latência entre serviços; **Profiler** = consumo de CPU/memória no código.
- Error Reporting **só agrupa** o que chega ao Logging com stack trace (ou via API).
- **Cloud Debugger foi descontinuado** (deprecated 16/maio/2022, desligado 31/maio/2023) — pode aparecer em material antigo; não é a resposta atual.
- Para reter logs além de 30 dias para compliance → **sink** p/ Cloud Storage (ou BigQuery para consultar). Não confie no `_Default`.

## Fontes

- https://cloud.google.com/logging/docs/buckets
- https://cloud.google.com/logging/docs/agent/ops-agent
- https://cloud.google.com/stackdriver/docs/release-notes
- https://cloud.google.com/logging/docs/logs-based-metrics
