# 04 — Google Compute Engine (GCE)

> Âncora AWS: **GCE ≈ Amazon EC2** (IaaS, VMs gerenciadas)

## O que é

Serviço de IaaS do Google Cloud para **provisionar e gerenciar máquinas virtuais (VMs)**.
Permite criar/iniciar/parar/reiniciar/excluir VMs, anexar discos, load balancing e autoscaling.

## Quando usar

- Você precisa de **controle total do SO** / lift-and-shift de servidores.
- App não cabe bem em container/serverless (PaaS), ou exige kernel/licença específicos.
- Workloads de longa duração com perfil de hardware definido (CPU, RAM, GPU).
- **Não use** quando Cloud Run / GKE / App Engine resolvem com menos gestão.

## Pontos-chave

- **Machine families** (por workload):
  - General-purpose: **E2, N2, N2D, N1** → default, melhor custo-benefício.
  - Compute-optimized: **C2** → CPU intensa (HPC, games).
  - Memory-optimized: **M** → RAM altíssima (in-memory DB, SAP).
- **Machine type** = vCPUs + memória (ex.: `e2-standard-4`). Há **custom machine types** (≈ instance family/size na AWS).
- **Images**: public images (Debian, Ubuntu, Windows...) ou **custom image** a partir de uma VM configurada → boot mais rápido (**≈ AMI**).
- **Instance template**: congela machine type + image + labels + startup script + rede. **Imutável** (≈ launch template). Base para Managed Instance Groups.
- **Startup script**: roda no boot, instala/configura software. Flexível; custom image é mais rápida.
- **IPs**: internal (VPC) sempre; external **ephemeral** por padrão; **static external IP** reservável (≈ Elastic IP).
- **Spot VMs**: até **91% off**, encerráveis a qualquer hora, **sem SLA**, **sem runtime máximo** (≈ Spot Instances). Evolução das preemptible.
- **Descontos**: **sustained-use** automático até 30% (E2 **não** recebe); **committed-use** 1/3 anos, até 70% (mem-optimized) / 55% (resto).
- **Disponibilidade**: **live migration** (move VM em execução na manutenção, sem downtime) + **automatic restart**.
- **Sole-tenant node**: servidor físico dedicado só seu (BYOL/compliance) (≈ Dedicated Hosts).

## Comando/CLI (referência)

```bash
# Criar VM
gcloud compute instances create my-vm \
  --machine-type=e2-standard-4 \
  --image-family=debian-12 --image-project=debian-cloud \
  --zone=us-central1-a

# Startup script no boot
gcloud compute instances create web \
  --metadata-from-file=startup-script=startup.sh

# Spot VM
gcloud compute instances create cheap-vm \
  --provisioning-model=SPOT --instance-termination-action=STOP

# Custom image a partir de um disco
gcloud compute images create my-image --source-disk=my-vm --source-disk-zone=us-central1-a

# Instance template + reservar static IP
gcloud compute instance-templates create my-tpl --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud
gcloud compute addresses create my-ip --region=us-central1
```

## Pegadinhas de prova

- **Instance template é imutável** — não edita; copie e crie nova versão.
- **E2 NÃO tem sustained-use discount** (os outros general-purpose têm).
- **Spot vs Preemptible**: preemptible tinha **máx. 24h**; **Spot não tem limite de runtime**. Spot é o modelo atual.
- **Static IP reservado e não anexado É COBRADO** (idem Elastic IP ocioso).
- **External IP ephemeral muda** ao parar/reiniciar a VM; use static se precisa fixo.
- **Live migration ≠ alta disponibilidade de app** — protege contra manutenção do host, não substitui MIG multi-zona / load balancer.
- **Committed-use**: até **70%** só em **memory-optimized**; demais até **55%**.
- **Custom image** acelera boot; **startup script** dá flexibilidade — saiba quando cada um.
- **Sole-tenant** = isolamento de hardware físico (compliance/BYOL), não é a opção de custo.

## Fontes

- https://docs.cloud.google.com/compute/docs/machine-resource
- https://docs.cloud.google.com/compute/docs/instances/spot
- https://docs.cloud.google.com/compute/docs/sustained-use-discounts
- https://docs.cloud.google.com/compute/docs/instances/committed-use-discounts-overview
