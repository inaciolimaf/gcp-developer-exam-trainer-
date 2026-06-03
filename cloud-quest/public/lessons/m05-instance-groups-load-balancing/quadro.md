# 05 — Instance Groups & Cloud Load Balancing

## O que é
- **Instance Group**: coleção de VMs tratadas como uma unidade para balanceamento de carga.
  - **Unmanaged**: VMs heterogêneas agrupadas à mão. Sem template, sem autoscaling/auto-healing/rolling update. Só casos legados.
  - **Managed (MIG)**: VMs idênticas criadas de um **instance template**. ≈ **Auto Scaling Group** (AWS). Dá autoscaling, auto-healing, rolling updates e multi-zona (zonal/regional).
- **Instance template**: blueprint da VM (machine type, imagem, discos, startup script). ≈ **Launch Template**. Imutável.
- **Cloud Load Balancing**: distribui tráfego para backends (MIGs). Cobre o papel de **ELB/ALB/NLB**.
  - **Frontend**: IP + protocolo + porta (+ certificado SSL) onde o cliente bate.
  - **Backend service**: aponta para os backends (MIGs), com health check e política de balanceamento.
  - **Host/path rules**: roteamento L7 (`/a` → service A, `/b` → service B) — só HTTP(S).
  - **SSL/TLS termination (offload)**: HTTPS termina no LB; LB→VM via HTTP na rede interna do Google.

## Quando usar
- **MIG** sempre que precisar de escala, HA ou atualização automática. **Unmanaged** só com VMs pré-existentes/diferentes.
- **MIG regional** (multi-zona) para alta disponibilidade; zonal para casos simples.
- Escolha do LB por 3 eixos — **externo/interno**, **global/regional**, **protocolo**:
  - HTTP(S) com routing por host/path → **Application Load Balancer** (≈ ALB).
  - TCP/SSL com proxy, SSL offload ou global → **Proxy Network Load Balancer**.
  - TCP/UDP preservando IP do cliente, ou UDP/ESP/ICMP → **Passthrough Network Load Balancer** (≈ NLB).
  - Backends em várias regiões num único IP → **Application LB global** (externo).

## Pontos-chave
- **Só MIG faz autoscaling e auto-healing.** Unmanaged não escala nem se cura.
- **Autoscaling policies**: CPU, capacidade de **load balancing**, ou **métricas do Cloud Monitoring**. Define min/max/alvo.
- **Auto-healing**: health check de **aplicação** detecta VM unhealthy → MIG **recria** a VM. Autoscaling (quantidade) e auto-healing (saúde) são independentes.
- **Rolling updates / canary**: troca o template, MIG substitui VMs gradualmente; canary = nova versão só numa fração.
- **Só LBs externos são globais; internos são sempre regionais.**
- Nomenclatura nova × antiga: Application LB = "HTTP(S) LB"; Proxy Network LB = "TCP Proxy / SSL Proxy"; Passthrough Network LB = "Network LB (TCP/UDP)".

## Comando/CLI (referência)
- Criar template: `gcloud compute instance-templates create T --machine-type=... --image-family=...`
- Criar MIG regional: `gcloud compute instance-groups managed create MIG --template=T --size=3 --region=REGION`
- Autoscaling: `gcloud compute instance-groups managed set-autoscaling MIG --max-num-replicas=10 --min-num-replicas=2 --target-cpu-utilization=0.6 --region=REGION`
- Auto-healing: `gcloud compute instance-groups managed update MIG --health-check=HC --initial-delay=300 --region=REGION`
- Rolling update: `gcloud compute instance-groups managed rolling-action start-update MIG --version=template=T2 --region=REGION`
- Health check: `gcloud compute health-checks create http HC --port=80 --request-path=/healthz`

## Pegadinhas de prova
- "Quero autoscaling/auto-healing" → resposta é **MIG**, nunca unmanaged.
- "Preservar o IP do cliente" / UDP / ESP / ICMP → **Passthrough Network LB** (não Application, não Proxy).
- "Roteamento por URL path ou host / microsserviços" → **Application LB** (L7).
- "Backends em múltiplas regiões com um IP único / anycast global" → **Application LB global externo**. Interno **nunca** é global.
- "SSL offload em TCP" → **Proxy** Network LB (SSL Proxy), não passthrough.
- Auto-healing usa health check de **aplicação**, não confunda com o health check do backend service do LB (são checks separados).
- Autoscaling **não** depende de auto-healing e vice-versa — perguntas tentam misturar os dois.
- Instance template é **imutável**: para mudar a frota, cria novo template + rolling update.

## Fontes
- https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer
- https://docs.cloud.google.com/compute/docs/autoscaler
- https://cloud.google.com/compute/docs/instance-groups
- https://cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs
