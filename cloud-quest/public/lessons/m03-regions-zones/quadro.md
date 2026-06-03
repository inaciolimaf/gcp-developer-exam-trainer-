# 03 — Regions e Zones

## O que é

- **Region**: área geográfica específica e independente onde o Google hospeda infraestrutura. Contém **3 ou mais zones**. Ex.: `us-west1`, `europe-north1` (Finlândia), `asia-south1` (Mumbai).
- **Zone**: local isolado dentro de uma region, com energia, rede e refrigeração independentes. É um **single failure domain**. Ex.: `us-west1-a`, `us-west1-b`, `us-west1-c`.
- Zones da mesma region são ligadas por links de **baixa latency**; falham de forma independente.
- **Âncora AWS**: GCP Region ≈ AWS Region; GCP Zone ≈ AWS Availability Zone (AZ).
- **Convenção de nomes**: zone = nome da region + `-a`/`-b`/`-c`.

| Conceito | Protege contra | Resolve |
|---|---|---|
| Multi-zone (1 region) | falha local (queda de energia/incêndio em 1 zone) | High Availability na region |
| Multi-region | desastre regional inteiro | Disaster Recovery, latency global, data residency |

## Quando usar

- **HA numa única region** → deploy em **múltiplas zones**.
- **App SaaS global** → deploy em **múltiplas regions**.
- **Sobreviver à queda de uma region inteira** → **múltiplas regions**.
- **Atender data residency / compliance** → escolher a **region compatível**.
- **Escolher a region certa** — 4 fatores: **Compliance/data residency**, **Latency**, **Disponibilidade do serviço** (nem todo serviço está em toda region), **Preço** (varia por region).

## Pontos-chave

Escopo dos recursos (cai muito na PCD):

| Escopo | Vive em | Exemplos |
|---|---|---|
| **Zonal** | 1 zone | VM instance, persistent disk zonal, GPUs, TPUs |
| **Regional** | acessível em qualquer zone da region (replicado/distribuído entre zones) | regional MIG, regional persistent disk (replica em **2 zones**), regional static IP |
| **Global** | qualquer zone/region do projeto | images, snapshots, VPC network, firewall rules, routes, global static IP |

- Region tem **3+ zones** (maioria), número **varia** por region.
- **Multi-regional services** (geridos pelo Google) são desenhados para sobreviver à perda de uma region.

## Comando/CLI (referência)

```bash
# Listar regions e zones
gcloud compute regions list
gcloud compute zones list

# Definir region/zone padrão
gcloud config set compute/region us-west1
gcloud config set compute/zone us-west1-a

# Criar VM (zonal) numa zone específica
gcloud compute instances create vm1 --zone=us-west1-a

# Regional MIG (HA entre zones da region)
gcloud compute instance-groups managed create mig1 \
  --region=us-west1 --template=tmpl --size=3
```

## Pegadinhas de prova

- **VM instance é zonal** — não sobrevive sozinha à queda da zone. Para HA use múltiplas zones ou **regional MIG**.
- **Uma zone só NÃO dá HA** — zones falham; distribua em várias.
- **Nem toda region tem o mesmo número de zones** (a maioria tem 3, mas varia).
- **Mesmo serviço custa diferente** em regions diferentes — regions não custam igual.
- **Nem todo serviço está em toda region**, principalmente lançamentos novos — verifique antes.
- **Data residency é lei**, não otimização — escolha a region pela jurisdição, não só pela latency.
- Não confunda **regional** (replicado entre zones) com **multi-regional** (replicado entre regions): persistent disk regional ≠ bucket multi-region.

## Fontes

- https://docs.cloud.google.com/docs/geography-and-regions
- https://docs.cloud.google.com/compute/docs/regions-zones
- https://docs.cloud.google.com/compute/docs/regions-zones/global-regional-zonal-resources
- https://cloud.google.com/about/locations
