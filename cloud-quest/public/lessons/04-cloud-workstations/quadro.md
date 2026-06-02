# Cloud Workstations (≈ AWS Cloud9)

## O que é
- Development environment gerenciado, em VM (Compute Engine) dentro do SEU projeto.
- Liga/desliga on-demand; persistent disk guarda código e configs entre sessões.
- Ambiente definido por container image → resolve "works on my machine" e config drift.
- Equivalente AWS: Cloud9 (que a AWS já não oferece a novos clientes). Não confundir com Cloud Shell.

## Quando usar
- Desenvolvimento contínuo de time, onboarding rápido, ambiente padronizado.
- Exigência de segurança: código não pode sair pra máquina local.
- Precisa de IDE de verdade (browser, VS Code local, JetBrains) + persistência/storage.
- NÃO use pra tarefa rápida de terminal → isso é Cloud Shell.

## Pontos-chave
- 3 camadas: **Cluster** (regional, define rede/VPC; NÃO é GKE) → **Configuration** (template: machine type, disk, image, IDE) → **Workstation** (instância do dev).
- IDEs: Code-OSS no browser (com Cloud Code pré-instalado), VS Code local, JetBrains (IntelliJ Ultimate / PyCharm Pro), SSH.
- Segurança: VPC Service Controls, ingress/egress privado, IAM granular, Cloud Audit Logs, CMEK, IAP/BeyondCorp.
- Custom container image definido pelo admin; rebuild automatizável.
- Custo = control plane fee (por hora de cluster) + compute da VM rodando.
- idle-timeout para a workstation ociosa (default 7200s = 2h); running-timeout limita execução total (default também 7200s; ajustável, ex.: 43200s = 12h).

### Workstations vs Shell vs Code
- **Cloud Code**: plugin/extensão de IDE (deploy GKE/Cloud Run, APIs). Não é ambiente.
- **Cloud Shell**: terminal temporário e gratuito, VM efêmera fora do seu projeto, pouco storage.
- **Cloud Workstations**: ambiente persistente, customizável, no seu projeto.

## Comando/CLI (referência)
```
# 1. Cluster (regional, define a rede)
gcloud workstations clusters create CLUSTER \
  --region=REGION --network=NET --subnetwork=SUBNET

# 2. Configuration (template)
gcloud workstations configs create CONFIG \
  --cluster=CLUSTER --region=REGION \
  --machine-type=e2-standard-4 --pd-disk-size=200 \
  --container-custom-image=REGION-docker.pkg.dev/PROJ/REPO/IMG \
  --idle-timeout=3600 --running-timeout=43200

# 3. Workstation
gcloud workstations create WS --config=CONFIG --cluster=CLUSTER --region=REGION
gcloud workstations start  WS --config=CONFIG --cluster=CLUSTER --region=REGION
```

## Pegadinhas de prova
- "Workstation cluster" NÃO é cluster GKE — é só agrupamento regional de rede.
- Cloud Shell é efêmero e descartado; Workstations é persistente. Não troque os dois.
- Cloud Code é extensão, não ambiente de execução.
- A VM roda no SEU projeto → por isso herda VPC SC, IAM, CMEK, Audit Logs (Cloud9 não tem essa pegada de segurança corporativa).
- Política "no source code local" = caso de uso típico de Workstations, não de Cloud Shell.
- Custo tem control plane fee mesmo com a workstation parada (cluster ativo); idle-timeout reduz custo de compute, não o do control plane.

## Fontes
- https://docs.cloud.google.com/workstations/docs/overview
- https://docs.cloud.google.com/workstations/docs/architecture
- https://cloud.google.com/sdk/gcloud/reference/workstations/clusters/create
- https://docs.cloud.google.com/docs/get-started/developer-tools
