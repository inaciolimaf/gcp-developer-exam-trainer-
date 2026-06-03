# 35 — Atualizacoes do Exam Guide (Eventarc, Observability, Identity Platform)

## O que é

Topicos que entraram no exam guide do **Professional Cloud Developer** a partir de **outubro/2022**:

- **Eventarc** — backbone de event-driven architecture no Google Cloud. Conecta **event providers** a **event destinations**, seguindo a spec **CloudEvents** (CNCF). AWS ≈ **EventBridge**.
- **CloudEvents** — spec padrao (CNCF) pra descrever eventos entre clouds e linguagens.
- **OpenTelemetry (OTel)** — padrao aberto (CNCF) pros 3 pilares de observability: logs, metrics, traces. AWS ≈ **ADOT**.
- **Service Directory** — service discovery gerenciado (DNS/HTTP/gRPC). AWS ≈ **Cloud Map**.
- **Identity Platform** — CIAM, auth de usuarios finais de apps. AWS ≈ **Cognito**.

## Quando usar

- **Eventarc**: desacoplar microservices por eventos; reagir a mudancas de estado (objeto no Storage, msg no Pub/Sub, acao auditada).
- **OpenTelemetry**: instrumentar app uma vez e exportar telemetria pra qualquer cloud sem reescrever.
- **Service Directory**: nao hardcodar URL de service; descoberta central com workloads em GCP, on-prem ou outra cloud.
- **Identity Platform**: login/signup, MFA, social login, SAML/OIDC pros **usuarios finais** do seu app web/mobile.
- **Cloud IAM (nao Identity Platform)**: funcionario/parceiro ou service account acessando **recursos do Google Cloud**.

## Pontos-chave

- Eventarc tem **2 conceitos**: event **provider** (origem) e event **destination** (processador).
- **Destinations** suportados: **Cloud Run, Cloud Run functions, GKE, Workflows** (+ endpoint HTTP interno em VPC).
- **Providers**: +150 servicos Google. Entrega **direta** (do proprio servico) ou **indireta via Cloud Audit Logs**.
- Eventarc usa **Pub/Sub como transporte** por baixo e adere a **CloudEvents v1.0**.
- Se evento existe nos 2 caminhos, **prefira o direto** (mais rapido que audit log).
- Observability = **logs + metrics + traces**; OTel padroniza a coleta entre clouds/linguagens.
- **Identity Platform** = upgrade do **Firebase Authentication legacy**; integra com **Identity-Aware Proxy (IAP)**.

## Comando/CLI (referência)

```bash
# Trigger Eventarc DIRETO: objeto finalizado no Cloud Storage -> Cloud Run
gcloud eventarc triggers create my-bucket-trigger \
  --location=us-central1 \
  --destination-run-service=meu-servico \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=meu-bucket" \
  --service-account=SA@PROJ.iam.gserviceaccount.com

# Trigger INDIRETO via Cloud Audit Logs (ex.: instancia GCE deletada)
gcloud eventarc triggers create gce-delete-trigger \
  --location=us-central1 \
  --destination-run-service=meu-servico \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=compute.googleapis.com" \
  --event-filters="methodName=v1.compute.instances.delete" \
  --service-account=SA@PROJ.iam.gserviceaccount.com

gcloud eventarc triggers list --location=us-central1
```

## Pegadinhas de prova

- **Caminho indireto exige Cloud Audit Logs ATIVADOS.** Sem audit logs, sem trigger via audit.
- Evento de servico que so existe via audit log (ex.: `compute.instances.delete`) → resposta envolve **Cloud Audit Logs**, nao evento direto.
- Eventarc **destination NAO inclui** Compute Engine VM nem App Engine — so Cloud Run / Cloud Run functions / GKE / Workflows.
- **Identity Platform ≠ Cloud IAM**: usuario final do app = Identity Platform; funcionario/SA acessando recurso GCP = IAM.
- Eventarc usa **Pub/Sub por baixo** — se a questao perguntar o transporte, e Pub/Sub.
- **CloudEvents** e a spec; **Eventarc** e o servico que a implementa. Nao troque os nomes.
- OTel e **vendor-neutral / CNCF** — nao e proprietario do Google.

## Fontes

- https://cloud.google.com/eventarc/standard/docs/overview
- https://docs.cloud.google.com/eventarc/standard/docs/event-providers-targets
- https://cloud.google.com/learn/certification/cloud-developer/
- https://services.google.com/fh/files/misc/professional_cloud_developer_exam_guide_english.pdf
