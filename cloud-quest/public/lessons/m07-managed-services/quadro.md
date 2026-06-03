# 07 — Managed Services & Espectro de Compute

## O que é

Managed services são serviços onde o Google assume parte (ou tudo) do trabalho operacional — OS, patching, runtime, scaling, disponibilidade, load balancing. O conceito central é um **espectro de responsabilidade**: quanto mais você delega ao provedor, menos controle tem e menos operação faz.

- **IaaS** (Infrastructure as a Service): provedor dá hardware, rede e virtualização. Você cuida de OS, runtime, app, scaling, HA, LB. → **Compute Engine** (≈ AWS EC2).
- **PaaS** (Platform as a Service): provedor cuida de OS, runtime, scaling, HA, LB. Você traz só código + config. → **App Engine** (≈ AWS Elastic Beanstalk).
- **CaaS** (Container as a Service): a unidade que roda é um container Docker. → **GKE**, **Cloud Run**.
- **FaaS** (Function as a Service): a unidade é uma função disparada por evento. → **Cloud Functions** (≈ AWS Lambda).
- **Serverless**: você não enxerga/gerencia servidores; autoscaling e HA de graça; **pay-per-use** com **scale-to-zero**. NÃO significa "sem servidores". → Cloud Functions, Cloud Run, App Engine Standard.
- **Docker/containers**: imagem empacota runtime + código + dependências; leve (sem guest OS, usa host OS); portátil/cloud-neutral; isolada. Kubernetes orquestra (autoscaling, service discovery, LB, self-healing, deploy sem downtime).

## Quando usar

- **Compute Engine** — precisa de controle de OS, lift-and-shift de legado/monólito, bancos como SAP HANA, GPUs, processos em background, sem limite de timeout.
- **GKE** — microservices complexos, Kubernetes, multi-cloud, dependências de sistema customizadas, precisa de orquestração avançada (cluster com nodes).
- **Cloud Run** — app containerizado simples sem querer gerenciar cluster; HTTP/APIs; quer scale-to-zero e pay-per-use.
- **Cloud Functions** — event-driven (reagir a mensagem em fila, upload no Cloud Storage); função pequena e leve.
- **App Engine** — trazer só o código (Java/Python/Node/Go etc.) sem montar container; plataforma 100% gerenciada; Standard escala a zero em carga esporádica/ad hoc.

## Pontos-chave

Espectro de compute do GCP — do mais controle (esquerda) ao mais gerenciado (direita):

| Serviço | Modelo | Unidade de deploy | Cluster? | Scale-to-zero | Âncora AWS |
|---|---|---|---|---|---|
| Compute Engine | IaaS | VM / imagem | Não | Não | EC2 |
| GKE | CaaS | Container | Sim (nodes) | Não | EKS |
| Cloud Run | CaaS / serverless | Container (ou source/função) | Não | Sim | Fargate / App Runner |
| Cloud Functions | FaaS / serverless | Função | Não | Sim | Lambda |
| App Engine | PaaS / serverless | Código (source) | Não | Sim (Standard) | Elastic Beanstalk |

- Trade-off central: **controle ↔ gerência**. Esquerda = mais controle, mais trabalho. Direita = menos controle, menos ops.
- Cloud Run é o "meio-termo doce": container serverless **sem cluster**.
- GKE = Kubernetes para arquiteturas complexas; Cloud Run para arquiteturas simples.

## Comando/CLI (referência)

```
# IaaS — Compute Engine
gcloud compute instances create vm1 --zone=us-central1-a

# CaaS gerenciado — GKE
gcloud container clusters create-auto cluster1 --region=us-central1

# Serverless container — Cloud Run
gcloud run deploy svc1 --image=gcr.io/proj/app --region=us-central1

# FaaS — Cloud Functions (2nd gen)
gcloud functions deploy fn1 --runtime=python312 --trigger-http --gen2

# PaaS — App Engine
gcloud app deploy app.yaml
```

## Pegadinhas de prova

- **Serverless ≠ sem servidores**: há servidores, você só não os gerencia/enxerga.
- **Compute Engine é IaaS**, não serverless. GKE **não** escala a zero (mantém nodes).
- **GKE = CaaS** (não é IaaS nem PaaS puro): control plane gerenciado, mas você ainda pensa em cluster/nodes.
- **Cloud Run vs GKE**: Cloud Run **não precisa de cluster**; GKE precisa. Container simples → Cloud Run; microservices complexos → GKE.
- **Cloud Functions = FaaS = event-driven**; é o serverless "verdadeiro" e equivale ao Lambda.
- **App Engine = PaaS**; Standard escala a zero (bom pra carga ad hoc/ociosa). App Engine também roda containers simples, mas sem orquestração estilo Kubernetes.
- "Sem ops / autoscaling / pay-per-use / low maintenance" no enunciado → puxa para a opção **mais gerenciada** que couber (geralmente Cloud Run em vez de Compute Engine).
- "Controle de OS / stack específico / lift-and-shift" → puxa para **Compute Engine**.

## Fontes

- https://cloud.google.com/hosting-options
- https://cloud.google.com/learn/paas-vs-iaas-vs-saas
- https://cloud.google.com/blog/products/gcp/time-to-hello-world-vms-vs-containers-vs-paas-vs-faas/
